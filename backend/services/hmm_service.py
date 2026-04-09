from pathlib import Path
import pandas as pd
from backend.train_hmm import train_hmm
import numpy as np 
from backend.database import SessionLocal
from backend.models import Dataset, ModelRun, RegimePrediction

DATA_DIR = Path("data")
ARTIFACTS_DIR = Path("artifacts")


# ----------------------------
# SAVE DATASET
# ----------------------------
def save_dataset(file_name, df):
    db = SessionLocal()
    
    df = df.replace({np.nan: None})
    dataset = Dataset(
        file_name=file_name,
        raw_data_json=df.to_dict(orient="records")
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    db.close()

    return dataset.dataset_id


# ----------------------------
# SAVE MODEL RUN
# ----------------------------
def save_model_run(dataset_id, metadata, model):
    db = SessionLocal()

    run = ModelRun(
        dataset_id=dataset_id,
        n_states=metadata["n_states"],
        log_likelihood=metadata["log_likelihood"],
        transition_matrix=model.transmat_.tolist(),
        state_profiles=model.means_.tolist()
    )

    db.add(run)
    db.commit()
    db.refresh(run)
    db.close()

    return run.run_id


# ----------------------------
# SAVE PREDICTIONS
# ----------------------------
def save_predictions(run_id, df):
    db = SessionLocal()

    for _, row in df.iterrows():
        pred = RegimePrediction(
            run_id=run_id,
            timestamp=row["timestamp"],
            observed_value=row["value"],
            predicted_state=row["state"], 
            regime=row["regime"]
        )
        db.add(pred)

    db.commit()
    db.close()


# ----------------------------
# TRAIN SERVICE
# ----------------------------
def train_model_service(n_states: int):
    csv_path = DATA_DIR / "pollution.csv"

    if not csv_path.exists():
        return {"error": "Upload data first"}

    # Load raw data
    df = pd.read_csv(csv_path , sep=";")

    # Save dataset
    dataset_id = save_dataset("pollution.csv", df)

    # Train model
    metadata = train_hmm(
        csv_path=csv_path,
        output_dir=ARTIFACTS_DIR,
        n_states=n_states
    )

    # Load trained model
    import joblib
    model = joblib.load(ARTIFACTS_DIR / "hmm_model.joblib")

    # Save model run
    run_id = save_model_run(dataset_id, metadata, model)

    return {
        "message": "Model trained",
        "run_id": str(run_id),
        "log_likelihood": metadata["log_likelihood"]
    }


# ----------------------------
# PREDICT SERVICE
# ----------------------------
def predict_service(limit: int, regime: str):
    path = ARTIFACTS_DIR / "predictions.csv"

    if not path.exists():
        return {"error": "Train model first"}

    df = pd.read_csv(path)
    
    df.columns = df.columns.str.strip().str.lower()

    if regime:
        df = df[df["regime"] == regime.lower()]

    df = df.head(limit)

    # ⚠️ IMPORTANT: you need last run_id (simple hack for now)
    db = SessionLocal()
    last_run = db.query(ModelRun).order_by(ModelRun.run_id.desc()).first()
    db.close()

    if not last_run:
        return {"error": "No model run found"}

    save_predictions(last_run.run_id, df)

    return {
        "summary": {
            "total": len(df),
            "stable": int((df["regime"] == "stable").sum()),
            "volatile": int((df["regime"] == "volatile").sum())
        },
        "data": df.to_dict(orient="records")
    }