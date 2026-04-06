# Pollution Regime Classification (HMM)

This repo currently implements **only the model training** part of the project: train a Gaussian Hidden Markov Model (HMM) on time-series pollution data and label each timestamp as **stable** or **volatile** based on within-state variance.

## Folder structure

```
.
├─ backend/
│  ├─ requirements.txt
│  ├─ train_hmm.py
│  └─ artifacts/            # generated after training (gitignored)
└─ frontend/                # placeholder for future UI
```

## Dataset

The included `pollution.csv` is expected to have:
- `Date` and `Time` columns
- numeric pollutant/sensor columns
- `;` as delimiter
- `,` decimal separator (e.g. `2,6`)
- `-200` as a missing-value sentinel

## Run training

From the repo root:

```bash
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

python backend/train_hmm.py --csv pollution.csv --states 4 --out backend/artifacts
```

## Outputs

After training, `backend/artifacts/` will contain:
- `hmm_model.joblib`: trained `GaussianHMM`
- `scaler.joblib`: `StandardScaler` + selected feature column list
- `state_stats.csv`: per-state variance + stable/volatile label
- `predictions.csv`: timestamp → predicted state + regime label
- `metadata.json`: run metadata

