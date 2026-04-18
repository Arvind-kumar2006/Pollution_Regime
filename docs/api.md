# API reference (summary)

## Data
- `POST /data/upload`
  - Uploads a CSV dataset
  - Returns: `dataset_id`, `columns`, `preview`, `metrics_status`

## Model
- `POST /model/train?n_states=&dataset_id=`
  - Trains HMM for the dataset and persists a new `model_run`
  - Persists `regime_predictions` for the run

- `GET /model/dashboard/latest`
  - Returns a single payload used by all Dashboard widgets
  - Always uses the canonical latest successful run with predictions

- `GET /model/history`
  - Lists runs + key metrics + status

- `GET /model/history/{run_id}`
  - Returns run metadata + paginated prediction rows

- `GET /model/advanced-analytics?days=`
  - Transition matrix + hourly averages + confidence trend

- `GET /model/info`
  - Canonical latest successful run metadata

## Settings
- `GET /settings/`
  - Returns `{ settings, meta }`

- `PUT /settings/` *(write-protected in production)*
- `POST /settings/reset` *(write-protected in production)*

## Health
- `GET /health` (liveness)
- `GET /health/ready` (DB readiness)

