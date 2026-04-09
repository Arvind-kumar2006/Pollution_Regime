from fastapi import APIRouter, HTTPException

from backend.database import SessionLocal
from backend.models import ModelRun

# Import service layer (business logic)
from backend.services.hmm_service import train_model_service, predict_service

router = APIRouter(prefix="/model", tags=["Model"])


# ----------------------------
# Train Model
# ----------------------------
@router.post("/train" )
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
    try:
        db = SessionLocal()

        runs = db.query(ModelRun).all()

        data = []
        for run in runs:
            data.append({
                "run_id": str(run.run_id),
                "n_states": run.n_states,
                "log_likelihood": run.log_likelihood
            })

        db.close()

        return {
            "message": "History fetched from DB",
            "total_runs": len(data),
            "data": data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching history: {str(e)}"
        )
    finally:
        db.close()   

# ----------------------------
# Model Info (BONUS - HIGH VALUE)
# ----------------------------
@router.get("/info")
def model_info():
    try:
        db = SessionLocal()

        run = db.query(ModelRun).order_by(ModelRun.run_id.desc()).first()

        db.close()

        if not run:
            raise HTTPException(status_code=400, detail="No model found")

        return {
            "n_states": run.n_states,
            "log_likelihood": run.log_likelihood
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching model info: {str(e)}"
        )
    finally:
        db.close()