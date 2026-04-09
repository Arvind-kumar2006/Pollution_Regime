from pydantic import BaseModel
from datetime import datetime


class TrainResponse(BaseModel):
    message: str
    run_id: str
    log_likelihood: float


class PredictionItem(BaseModel):
    timestamp: datetime
    observed_value: float
    predicted_state: int
    regime: str


class PredictResponse(BaseModel):
    total: int
    stable: int
    volatile: int
    data: list[PredictionItem]