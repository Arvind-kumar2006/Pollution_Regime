from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database import Base
import uuid
from datetime import datetime


class Dataset(Base):
    __tablename__ = "datasets"

    dataset_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name = Column(String)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    raw_data_json = Column(JSONB)


class ModelRun(Base):
    __tablename__ = "model_runs"

    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.dataset_id"))
    n_states = Column(Integer)
    log_likelihood = Column(Float)
    transition_matrix = Column(JSONB)
    state_profiles = Column(JSONB)


class RegimePrediction(Base):
    __tablename__ = "regime_predictions"

    prediction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("model_runs.run_id"))
    timestamp = Column(DateTime)
    observed_value = Column(Float)
    predicted_state = Column(Integer)
    regime = Column(String)