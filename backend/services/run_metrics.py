"""Persist denormalized aggregates on model_runs from regime_predictions."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func

from backend.database import SessionLocal
from backend.models import ModelRun, RegimePrediction


def update_run_metrics(
    run_id,
    execution_duration_sec: float | None = None,
) -> None:
    """Recompute aggregates from regime_predictions and store on model_runs."""
    db = SessionLocal()
    try:
        run = db.query(ModelRun).filter(ModelRun.run_id == run_id).first()
        if not run:
            return

        stats = (
            db.query(
                func.avg(RegimePrediction.aqi_value).label("avg_aqi"),
                func.max(RegimePrediction.aqi_value).label("peak_aqi"),
                func.avg(RegimePrediction.regime_confidence).label("mean_conf"),
                func.count(RegimePrediction.prediction_id).label("total"),
            )
            .filter(RegimePrediction.run_id == run_id)
            .first()
        )

        last_row = (
            db.query(RegimePrediction)
            .filter(RegimePrediction.run_id == run_id)
            .order_by(RegimePrediction.timestamp.desc())
            .first()
        )

        dom = (
            db.query(RegimePrediction.regime, func.count(RegimePrediction.regime).label("c"))
            .filter(RegimePrediction.run_id == run_id)
            .group_by(RegimePrediction.regime)
            .order_by(func.count(RegimePrediction.regime).desc())
            .first()
        )

        regimes = [
            r[0]
            for r in db.query(RegimePrediction.regime)
            .filter(RegimePrediction.run_id == run_id)
            .order_by(RegimePrediction.timestamp.asc())
            .all()
        ]
        transitions_count = sum(
            1 for i in range(1, len(regimes)) if regimes[i] != regimes[i - 1]
        )

        run.avg_aqi = float(stats.avg_aqi) if stats and stats.avg_aqi is not None else None
        run.peak_aqi = float(stats.peak_aqi) if stats and stats.peak_aqi is not None else None
        run.mean_confidence = float(stats.mean_conf) if stats and stats.mean_conf is not None else None
        run.last_confidence = (
            float(last_row.regime_confidence)
            if last_row and last_row.regime_confidence is not None
            else None
        )
        run.dominant_regime = dom.regime if dom else None
        run.total_predictions = int(stats.total) if stats and stats.total is not None else 0
        run.transitions_count = transitions_count
        if execution_duration_sec is not None:
            run.execution_duration_sec = execution_duration_sec
        run.completed_at = datetime.now(timezone.utc)
        db.commit()
    finally:
        db.close()
