from pathlib import Path
import pandas as pd
import joblib

from train_hmm import train_hmm

DATA_DIR = Path("data")
ARTIFACTS_DIR = Path("artifacts")


def train_model_service(n_states: int):
    csv_path = DATA_DIR / "pollution.csv"

    if not csv_path.exists():
        return {"error": "Upload data first"}

    metadata = train_hmm(
        csv_path=csv_path,
        output_dir=ARTIFACTS_DIR,
        n_states=n_states
    )

    return {
        "message": "Model trained",
        "log_likelihood": metadata["log_likelihood"]
    }


def predict_service(limit: int, regime: str):
    path = ARTIFACTS_DIR / "predictions.csv"

    if not path.exists():
        return {"error": "Train model first"}

    df = pd.read_csv(path)

    if regime:
        df = df[df["regime"] == regime]

    df = df.head(limit)

    return {
        "summary": {
            "total": len(df),
            "stable": int((df["regime"] == "stable").sum()),
            "volatile": int((df["regime"] == "volatile").sum())
        },
        "data": df.to_dict(orient="records")
    }