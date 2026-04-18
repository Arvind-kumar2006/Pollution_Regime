"""Resolve which ModelRun backs dashboard-style views (single source of truth)."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy import desc, exists
from sqlalchemy.orm import Session

from backend.models import ModelRun, RegimePrediction


def get_latest_successful_run_with_predictions(
    db: Session,
    dataset_id: Optional[str] = None,
) -> Optional[ModelRun]:
    """
    Latest run with status success and at least one RegimePrediction row.
    Optionally restrict to a dataset UUID string.
    """
    has_pred = exists().where(RegimePrediction.run_id == ModelRun.run_id)
    q = db.query(ModelRun).filter(ModelRun.status == "success", has_pred)
    if dataset_id is not None:
        try:
            uid = UUID(dataset_id) if isinstance(dataset_id, str) else dataset_id
        except (ValueError, TypeError):
            return None
        q = q.filter(ModelRun.dataset_id == uid)
    return q.order_by(desc(ModelRun.created_at)).first()
