"""Production schema audit: datasets, model_runs, regime_predictions, indexes.

Revision ID: schema_audit_1
Revises:
Create Date: 2025-04-18

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text
from sqlalchemy.dialects import postgresql

revision = "schema_audit_1"
down_revision = None
branch_labels = None
depends_on = None


def _table_exists(bind, name: str) -> bool:
    return name in inspect(bind).get_table_names()


def _column_names(bind, table: str) -> set[str]:
    return {c["name"] for c in inspect(bind).get_columns(table)}


def _ensure_indexes() -> None:
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_datasets_uploaded_at ON datasets (uploaded_at DESC)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_model_runs_dataset_id ON model_runs (dataset_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_model_runs_created_at ON model_runs (created_at DESC)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_model_runs_status ON model_runs (status)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_regime_predictions_run_ts ON regime_predictions (run_id, timestamp)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_regime_predictions_run_seq ON regime_predictions (run_id, sequence_index)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_regime_predictions_dataset_id ON regime_predictions (dataset_id)"
    )


def upgrade() -> None:
    bind = op.get_bind()

    if not _table_exists(bind, "datasets"):
        from backend.models import Base

        Base.metadata.create_all(bind=bind)
        _ensure_indexes()
        return

    dcols = _column_names(bind, "datasets")
    if "stored_file_name" in dcols:
        _ensure_indexes()
        return

    # --- datasets: legacy -> new ---
    op.add_column("datasets", sa.Column("original_file_name", sa.Text(), nullable=True))
    op.add_column("datasets", sa.Column("stored_file_name", sa.Text(), nullable=True))
    op.add_column("datasets", sa.Column("file_path", sa.Text(), nullable=True))
    op.add_column("datasets", sa.Column("row_count", sa.Integer(), nullable=True))
    op.add_column("datasets", sa.Column("file_size_bytes", sa.BigInteger(), nullable=True))
    op.add_column(
        "datasets",
        sa.Column("upload_status", sa.String(length=32), nullable=True, server_default="completed"),
    )
    op.add_column("datasets", sa.Column("preview_json", postgresql.JSONB(), nullable=True))
    op.add_column("datasets", sa.Column("created_by", sa.Text(), nullable=True))

    op.execute(
        text(
            """
            UPDATE datasets SET
              stored_file_name = file_name,
              original_file_name = CASE
                WHEN strpos(file_name, '_') > 0 THEN substring(file_name from strpos(file_name, '_') + 1)
                ELSE file_name
              END,
              file_path = 'data/' || file_name,
              row_count = COALESCE((raw_data_json->>'rows')::integer, 0),
              file_size_bytes = COALESCE((raw_data_json->>'size')::bigint, 0),
              preview_json = raw_data_json->'preview'
            WHERE stored_file_name IS NULL
            """
        )
    )

    op.alter_column("datasets", "original_file_name", nullable=False)
    op.alter_column("datasets", "stored_file_name", nullable=False)
    op.alter_column("datasets", "file_path", nullable=False)
    op.alter_column("datasets", "row_count", nullable=False)
    op.alter_column("datasets", "file_size_bytes", nullable=False)
    op.alter_column("datasets", "upload_status", nullable=False, server_default=None)

    op.create_unique_constraint("uq_datasets_stored_file_name", "datasets", ["stored_file_name"])

    op.drop_column("datasets", "raw_data_json")
    op.drop_column("datasets", "file_name")

    op.execute(text("ALTER TABLE datasets RENAME COLUMN upload_timestamp TO uploaded_at"))
    op.execute(
        text(
            """
            ALTER TABLE datasets
            ALTER COLUMN uploaded_at TYPE TIMESTAMP WITH TIME ZONE
            USING uploaded_at AT TIME ZONE 'UTC'
            """
        )
    )

    # --- model_runs: add metrics, drop unused JSONB ---
    mcols = _column_names(bind, "model_runs")
    if "transition_matrix" in mcols:
        op.drop_column("model_runs", "transition_matrix")
    if "state_profiles" in mcols:
        op.drop_column("model_runs", "state_profiles")

    op.add_column("model_runs", sa.Column("execution_duration_sec", sa.Float(), nullable=True))
    op.add_column("model_runs", sa.Column("avg_aqi", sa.Float(), nullable=True))
    op.add_column("model_runs", sa.Column("peak_aqi", sa.Float(), nullable=True))
    op.add_column("model_runs", sa.Column("mean_confidence", sa.Float(), nullable=True))
    op.add_column("model_runs", sa.Column("last_confidence", sa.Float(), nullable=True))
    op.add_column("model_runs", sa.Column("dominant_regime", sa.String(length=32), nullable=True))
    op.add_column(
        "model_runs",
        sa.Column("total_predictions", sa.Integer(), nullable=True, server_default="0"),
    )
    op.add_column(
        "model_runs",
        sa.Column("transitions_count", sa.Integer(), nullable=True, server_default="0"),
    )
    op.add_column(
        "model_runs",
        sa.Column("status", sa.String(length=16), nullable=True, server_default="success"),
    )
    op.add_column("model_runs", sa.Column("error_message", sa.Text(), nullable=True))
    op.add_column("model_runs", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))

    op.alter_column("model_runs", "total_predictions", nullable=False, server_default=None)
    op.alter_column("model_runs", "transitions_count", nullable=False, server_default=None)
    op.alter_column("model_runs", "status", nullable=False, server_default=None)

    op.execute(
        text(
            """
            ALTER TABLE model_runs
            ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE
            USING created_at AT TIME ZONE 'UTC'
            """
        )
    )

    # --- regime_predictions ---
    rcols = _column_names(bind, "regime_predictions")
    op.add_column("regime_predictions", sa.Column("pollution_index", sa.Float(), nullable=True))
    op.add_column("regime_predictions", sa.Column("hmm_posterior_max", sa.Float(), nullable=True))
    op.add_column(
        "regime_predictions",
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "regime_predictions",
        sa.Column("sequence_index", sa.Integer(), nullable=True),
    )
    op.add_column(
        "regime_predictions",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )

    if "observed_value" in rcols:
        op.execute(text("ALTER TABLE regime_predictions RENAME COLUMN observed_value TO aqi_value"))
    if "confidence" in rcols:
        op.execute(text("ALTER TABLE regime_predictions RENAME COLUMN confidence TO regime_confidence"))

    op.execute(
        text(
            """
            UPDATE regime_predictions SET hmm_posterior_max = regime_confidence
            WHERE hmm_posterior_max IS NULL
            """
        )
    )

    op.execute(
        text(
            """
            UPDATE regime_predictions rp SET sequence_index = sub.seq
            FROM (
              SELECT prediction_id,
                     (ROW_NUMBER() OVER (PARTITION BY run_id ORDER BY timestamp) - 1)::integer AS seq
              FROM regime_predictions
            ) sub
            WHERE rp.prediction_id = sub.prediction_id
            """
        )
    )

    op.execute(
        text(
            """
            UPDATE regime_predictions rp SET dataset_id = mr.dataset_id
            FROM model_runs mr
            WHERE rp.run_id = mr.run_id AND rp.dataset_id IS NULL
            """
        )
    )

    op.execute(
        text(
            """
            UPDATE regime_predictions SET created_at = COALESCE(timestamp, now())
            WHERE created_at IS NULL
            """
        )
    )

    op.alter_column("regime_predictions", "sequence_index", nullable=False)
    op.alter_column("regime_predictions", "created_at", nullable=False)

    op.execute(
        text(
            "ALTER TABLE regime_predictions DROP CONSTRAINT IF EXISTS regime_predictions_run_id_fkey"
        )
    )
    op.create_foreign_key(
        "regime_predictions_run_id_fkey",
        "regime_predictions",
        "model_runs",
        ["run_id"],
        ["run_id"],
        ondelete="CASCADE",
    )

    op.execute(
        text(
            "ALTER TABLE regime_predictions DROP CONSTRAINT IF EXISTS fk_regime_predictions_dataset_id"
        )
    )
    op.create_foreign_key(
        "fk_regime_predictions_dataset_id",
        "regime_predictions",
        "datasets",
        ["dataset_id"],
        ["dataset_id"],
        ondelete="SET NULL",
    )

    op.execute(
        text(
            """
            ALTER TABLE regime_predictions
            ALTER COLUMN timestamp TYPE TIMESTAMP WITH TIME ZONE
            USING timestamp AT TIME ZONE 'UTC'
            """
        )
    )

    op.execute(
        text(
            """
            WITH dom AS (
              SELECT run_id, regime
              FROM (
                SELECT run_id, regime, ROW_NUMBER() OVER (
                  PARTITION BY run_id ORDER BY cnt DESC, regime
                ) AS rn
                FROM (
                  SELECT run_id, regime, COUNT(*) AS cnt
                  FROM regime_predictions
                  GROUP BY run_id, regime
                ) s
              ) t WHERE rn = 1
            ),
            stats AS (
              SELECT
                run_id,
                AVG(aqi_value)::double precision AS avg_aqi,
                MAX(aqi_value)::double precision AS peak_aqi,
                AVG(regime_confidence)::double precision AS mean_conf,
                (ARRAY_AGG(regime_confidence ORDER BY timestamp DESC))[1]::double precision AS last_conf,
                COUNT(*)::integer AS total_p
              FROM regime_predictions
              GROUP BY run_id
            ),
            trans AS (
              SELECT run_id, SUM(changed)::integer AS trans_cnt
              FROM (
                SELECT run_id,
                  CASE
                    WHEN LAG(regime) OVER (PARTITION BY run_id ORDER BY timestamp) IS NULL THEN 0
                    WHEN regime <> LAG(regime) OVER (PARTITION BY run_id ORDER BY timestamp) THEN 1
                    ELSE 0
                  END AS changed
                FROM regime_predictions
              ) x
              GROUP BY run_id
            )
            UPDATE model_runs mr SET
              avg_aqi = stats.avg_aqi,
              peak_aqi = stats.peak_aqi,
              mean_confidence = stats.mean_conf,
              last_confidence = stats.last_conf,
              dominant_regime = dom.regime,
              total_predictions = stats.total_p,
              transitions_count = COALESCE(trans.trans_cnt, 0),
              completed_at = COALESCE(mr.completed_at, mr.created_at)
            FROM stats
            LEFT JOIN dom ON dom.run_id = stats.run_id
            LEFT JOIN trans ON trans.run_id = stats.run_id
            WHERE mr.run_id = stats.run_id
            """
        )
    )

    _ensure_indexes()


def downgrade() -> None:
    raise NotImplementedError("Downgrade not supported for this production migration.")
