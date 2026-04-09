from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from hmmlearn.hmm import GaussianHMM
from sklearn.preprocessing import StandardScaler


DEFAULT_FEATURES = ["CO(GT)", "NO2(GT)", "T", "RH", "AH"]


def _create_timestamp(df: pd.DataFrame) -> pd.Series:
    if "Date" not in df.columns or "Time" not in df.columns:
        raise ValueError("CSV must contain 'Date' and 'Time' columns.")
    return pd.to_datetime(
        df["Date"].astype(str).str.strip() + " " + df["Time"].astype(str).str.strip(),
        format="%d/%m/%Y %H.%M.%S",
        errors="coerce",
    )


def _to_numeric_column(series: pd.Series) -> pd.Series:
    if series.dtype == object:
        series = series.astype(str).str.replace(",", ".", regex=False)
    return pd.to_numeric(series, errors="coerce")


def _prepare_dataframe(csv_path: Path, selected_features: list[str]) -> tuple[pd.DataFrame, list[str]]:
    df = pd.read_csv(csv_path, sep=";", engine="python")
    df.columns = [c.strip() for c in df.columns]
    df = df.loc[:, ~df.columns.str.startswith("Unnamed")]
    df["timestamp"] = _create_timestamp(df)
    df = df.dropna(subset=["timestamp"]).sort_values("timestamp").reset_index(drop=True)

    # Convert selected features to numeric (comma-decimal safe).
    available_features: list[str] = [c for c in selected_features if c in df.columns]
    if not available_features:
        raise ValueError("None of the selected feature columns exist in CSV.")

    clean = pd.DataFrame({"timestamp": df["timestamp"]})
    for col in available_features:
        clean[col] = _to_numeric_column(df[col])

    # Dataset-specific: -200 means invalid / missing.
    clean = clean.replace(-200, np.nan)
    clean = clean.ffill().bfill()
    clean = clean.dropna().reset_index(drop=True)

    # Keep only non-negative CO values (same style as your notebook).
    if "CO(GT)" in clean.columns:
        clean = clean[clean["CO(GT)"] >= 0].reset_index(drop=True)

    return clean, available_features


def _state_stats(X_scaled: np.ndarray, states: np.ndarray, n_states: int) -> pd.DataFrame:
    rows = []
    for state in range(n_states):
        mask = states == state
        if mask.sum() == 0:
            rows.append({"state": state, "count": 0, "var_score": np.nan, "mean_level": np.nan})
            continue
        sample = X_scaled[mask]
        rows.append(
            {
                "state": state,
                "count": int(mask.sum()),
                "var_score": float(np.mean(np.var(sample, axis=0))),
                "mean_level": float(np.mean(sample)),
            }
        )

    stats = pd.DataFrame(rows).sort_values("state").reset_index(drop=True)
    valid_var = stats.loc[stats["count"] > 0, "var_score"]
    median_var = float(valid_var.median())
    stats["regime"] = np.where(stats["var_score"] <= median_var, "stable", "volatile")
    return stats


def train_hmm(
    csv_path: Path,
    output_dir: Path,
    n_states: int = 3,
    n_iter: int = 200,
    random_state: int = 42,
    features: list[str] | None = None,
) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)
    selected_features = features or DEFAULT_FEATURES

    clean_df, used_features = _prepare_dataframe(csv_path, selected_features)
    X = clean_df[used_features].to_numpy(dtype=float)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = GaussianHMM(
        n_components=n_states,
        covariance_type="diag",
        n_iter=n_iter,
        random_state=random_state,
    )
    model.fit(X_scaled)
    states = model.predict(X_scaled)
    log_likelihood = float(model.score(X_scaled))

    stats = _state_stats(X_scaled, states, n_states)
    state_to_regime = stats.set_index("state")["regime"].to_dict()

    predictions = clean_df[["timestamp"]].copy()
    
    predictions['value'] = clean_df['CO(GT)']
    predictions["state"] = states.astype(int)
    predictions["regime"] = predictions["state"].map(state_to_regime)
    
    model_path = output_dir / "hmm_model.joblib"
    scaler_path = output_dir / "scaler.joblib"
    state_stats_path = output_dir / "state_stats.csv"
    predictions_path = output_dir / "predictions.csv"
    metadata_path = output_dir / "metadata.json"

    joblib.dump(model, model_path)
    joblib.dump({"scaler": scaler, "feature_cols": used_features}, scaler_path)
    stats.to_csv(state_stats_path, index=False)
    predictions.to_csv(predictions_path, index=False)

    metadata = {
        "csv_path": str(csv_path),
        "rows_after_cleaning": int(len(clean_df)),
        "feature_cols": used_features,
        "n_states": int(n_states),
        "n_iter": int(n_iter),
        "log_likelihood": log_likelihood,
        "artifacts": {
            "hmm_model": str(model_path),
            "scaler": str(scaler_path),
            "state_stats": str(state_stats_path),
            "predictions": str(predictions_path),
        },
    }
    metadata_path.write_text(json.dumps(metadata, indent=2))
    return metadata


def _parse_features(features_text: str) -> list[str]:
    return [c.strip() for c in features_text.split(",") if c.strip()]


def main() -> None:
    parser = argparse.ArgumentParser(description="Simple HMM training for pollution regime classification.")
    parser.add_argument("--csv", type=Path, default=Path("../pollution.csv"), help="Path to pollution CSV file.")
    parser.add_argument("--out", type=Path, default=Path("./artifacts"), help="Output folder for training artifacts.")
    parser.add_argument("--states", type=int, default=3, help="Number of hidden states.")
    parser.add_argument("--n-iter", type=int, default=200, help="Maximum HMM training iterations.")
    parser.add_argument("--random-state", type=int, default=42, help="Random seed.")
    parser.add_argument(
        "--features",
        type=str,
        default="CO(GT),NO2(GT),T,RH,AH",
        help="Comma-separated feature names.",
    )
    args = parser.parse_args()

    metadata = train_hmm(
        csv_path=args.csv,
        output_dir=args.out,
        n_states=args.states,
        n_iter=args.n_iter,
        random_state=args.random_state,
        features=_parse_features(args.features),
    )
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()

