import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from backend.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    dataset_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_file_name = Column(Text, nullable=False)
    stored_file_name = Column(Text, nullable=False, unique=True)
    file_path = Column(Text, nullable=False)
    row_count = Column(Integer, nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    upload_status = Column(String(32), nullable=False, default="completed")
    preview_json = Column(JSONB, nullable=True)
    uploaded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    created_by = Column(Text, nullable=True)

    model_runs = relationship("ModelRun", back_populates="dataset")
    regime_predictions = relationship("RegimePrediction", back_populates="dataset")


class ModelRun(Base):
    __tablename__ = "model_runs"

    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(
        UUID(as_uuid=True),
        ForeignKey("datasets.dataset_id", ondelete="RESTRICT"),
        nullable=True,
    )
    n_states = Column(Integer, nullable=False)
    log_likelihood = Column(Float, nullable=True)
    execution_duration_sec = Column(Float, nullable=True)
    avg_aqi = Column(Float, nullable=True)
    peak_aqi = Column(Float, nullable=True)
    mean_confidence = Column(Float, nullable=True)
    last_confidence = Column(Float, nullable=True)
    dominant_regime = Column(String(32), nullable=True)
    total_predictions = Column(Integer, nullable=False, default=0)
    transitions_count = Column(Integer, nullable=False, default=0)
    status = Column(String(16), nullable=False, default="success")
    error_message = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)

    dataset = relationship("Dataset", back_populates="model_runs")
    predictions = relationship(
        "RegimePrediction",
        back_populates="run",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class RegimePrediction(Base):
    __tablename__ = "regime_predictions"

    prediction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("model_runs.run_id", ondelete="CASCADE"),
        nullable=False,
    )
    dataset_id = Column(
        UUID(as_uuid=True),
        ForeignKey("datasets.dataset_id", ondelete="SET NULL"),
        nullable=True,
    )
    sequence_index = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    pollution_index = Column(Float, nullable=True)
    aqi_value = Column(Float, nullable=False)
    predicted_state = Column(Integer, nullable=False)
    regime = Column(String(32), nullable=False)
    hmm_posterior_max = Column(Float, nullable=True)
    regime_confidence = Column(Float, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    run = relationship("ModelRun", back_populates="predictions")
    dataset = relationship("Dataset", back_populates="regime_predictions")


class SystemSettings(Base):
    __tablename__ = "system_settings"

    setting_key = Column(String(128), primary_key=True)
    setting_value = Column(JSONB, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
