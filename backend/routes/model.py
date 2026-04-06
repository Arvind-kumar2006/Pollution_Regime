from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

# Import service layer (business logic)
from services.hmm_service import train_model_service, predict_service

router = APIRouter(prefix="/model", tags=["Model"])


# ----------------------------
# Train Model
# ----------------------------
@router.post("/train")
def train(n_states: int = 3):
    try:
        result = train_model_service(n_states)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


# ----------------------------
# Predict
# ----------------------------
@router.get("/predict")
def predict(limit: int = 100, regime: str = None):
    try:
        result = predict_service(limit, regime)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ----------------------------
# History
# ----------------------------
@router.get("/history")
def history():
    metadata_path = Path("artifacts/metadata.json")

    if not metadata_path.exists():
        raise HTTPException(
            status_code=400,
            detail="No history found. Train model first."
        )

    try:
        with open(metadata_path, "r") as f:
            data = json.load(f)

        # ensure it's always list
        if not isinstance(data, list):
            data = [data]

        return {
            "message": "History fetched successfully",
            "total_runs": len(data),
            "data": data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading history: {str(e)}"
        )

# ----------------------------
# Model Info (BONUS - HIGH VALUE)
# ----------------------------
@router.get("/info")
def model_info():
    metadata_path = Path("artifacts/metadata.json")

    if not metadata_path.exists():
        raise HTTPException(status_code=400, detail="No model found. Train first.")

    try:
        with open(metadata_path, "r") as f:
            data = json.load(f)

        return {
            "n_states": data.get("n_states"),
            "log_likelihood": data.get("log_likelihood"),
            "features": data.get("feature_cols"),
            "rows_used": data.get("rows_after_cleaning")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching model info: {str(e)}")