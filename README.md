# Pollution Regime Classification (HMM) — FastAPI + React

Production-oriented, full-stack analytics app that classifies **hidden pollution regimes** (stable / volatile / high) from air-quality time-series data using a **Hidden Markov Model (HMM)**. Includes dataset upload, model training, persisted inference, dashboarding, advanced analytics, history, and validated system settings.

## Problem statement
Air-quality sensor streams are noisy and non-stationary. Pure threshold rules miss temporal context and regime transitions. This project uses an HMM to learn latent states and provides an operational UI to interpret regime shifts with confidence and auditability.

## Features
- Dataset upload (CSV) with preview + metadata stored in Postgres
- Model training + artifact persistence
- Regime inference with confidence scores
- Dashboard: current AQI/regime/confidence, timeseries chart, transitions log
- Advanced analytics: transition matrix, hourly aggregation, confidence trend windows
- History + run detail inspection
- System settings API with validation and reset support

## Architecture (high level)
- **Frontend**: React + Tailwind + Recharts
- **Backend**: FastAPI + SQLAlchemy
- **DB**: PostgreSQL (`datasets`, `model_runs`, `regime_predictions`, `system_settings`)
- **ML**: pandas/numpy preprocessing, scikit-learn scaler, hmmlearn HMM

## Screenshots
Add screenshots in `docs/screenshots/` and link them here.

## API endpoints (selected)
- `POST /data/upload`
- `POST /model/train?n_states=&dataset_id=`
- `GET /model/dashboard/latest`
- `GET /model/history`
- `GET /model/history/{run_id}`
- `GET /model/advanced-analytics?days=`
- `GET /model/info`
- `GET /settings/`
- `PUT /settings/` (write-protected in production)
- `POST /settings/reset` (write-protected in production)
- `GET /health`, `GET /health/ready`

## Setup
See:
- `backend/.env.example`
- `frontend/.env.example`
- `docs/setup-local.md`
- `docs/deploy-ec2.md`

## Resume-ready highlights
- Full-stack ML analytics app (FastAPI + React) for pollution regime classification using HMMs
- Persisted runs and predictions with Postgres-backed auditability
- Canonical latest successful run selection to keep dashboard widgets consistent
- Production hardening: validated settings, readiness checks, env-based configuration

## GitHub topics
`fastapi`, `react`, `tailwindcss`, `recharts`, `postgresql`, `sqlalchemy`, `pandas`, `numpy`, `hmmlearn`, `hidden-markov-model`, `time-series`, `data-visualization`

## How HMM is used here
- Clean and standardize time-series features
- Train an HMM with configurable hidden states (`n_states`)
- Map inferred behavior to logical regimes (stable/volatile/high)
- Persist predictions and compute per-run metrics for consistent dashboards

## Folder structure
See `docs/folder-structure.md`.

## Future improvements
- Background training jobs + progress reporting
- Auth + role-based settings access
- Object storage for datasets/artifacts (S3)
- CI + automated tests

## Author
Arvind Kumar
- Transition probability heatmap  
- Regime mean & variance table  
- Manual inference tool  

---

## 🗂️ History & Logs
Track previous model runs and performance.

![History](https://github.com/user-attachments/assets/45ee7a2b-38bd-45e4-b9b4-b8b00d37e380)

**Key Features**
- Dataset history  
- Log-likelihood scores  
- Re-run and export options  

---

## ⚙️ Tech Stack

### Backend
- Python  
- FastAPI  
- hmmlearn  
- Pandas  
- NumPy  

### Frontend
- React / Streamlit  

### Database
- MongoDB / PostgreSQL  

---

## 🔄 ML Pipeline
=======
>>>>>>> 78b8f6d (backup before sync)

## 🏗️ System Architecture

### Architecture Diagram 1
![System Architecture 1](https://github.com/user-attachments/assets/60bcceb6-847f-401b-b77c-8b29ae547861)

### Architecture Diagram 2
![System Architecture 2](https://github.com/user-attachments/assets/f59d5180-cb59-4b9e-a057-a931002fba26)

### Architecture Diagram 3
![System Architecture 3](https://github.com/user-attachments/assets/62d9e740-08a7-4d22-a04a-54d8eadd2eac)

---

# 🎨 AetherScan UI (Figma Wireframes)

## 📊 Dashboard — “AirSense”
Displays real-time pollution trends and regime insights.

![Dashboard](https://github.com/user-attachments/assets/056a8055-bc8e-46ff-b11f-fa850a16a23b)

**Key Features**
- PM2.5 trend chart  
- Current regime display  
- AQI indicators  
- Confidence score  
- API connection status  

---

## 📥 Model Input / Data Upload — “DataFlow”
Interface for dataset upload and HMM configuration.

![Model Input](https://github.com/user-attachments/assets/0c2ca3d6-e7d3-47d3-b901-4f91a98f3241)

**Key Features**
- CSV/JSON upload  
- Hidden state slider (N)  
- Covariance selection  
- Train & classify trigger  

---

## 📈 Prediction & Analytics — “Quantalytics”
Deep model insights and regime statistics.

![Analytics](https://github.com/user-attachments/assets/2dd82089-2797-41ce-ac69-c5618b1247d2)

**Key Features**
- Transition probability heatmap  
- Regime mean & variance table  
- Manual inference tool  

---

## 🗂️ History & Logs
Track previous model runs and performance.

![History](https://github.com/user-attachments/assets/45ee7a2b-38bd-45e4-b9b4-b8b00d37e380)

**Key Features**
- Dataset history  
- Log-likelihood scores  
- Re-run and export options  

---

## ⚙️ Tech Stack

### Backend
- Python  
- FastAPI  
- hmmlearn  
- Pandas  
- NumPy  

### Frontend
- React / Streamlit  

### Database
- MongoDB / PostgreSQL  

---

## 🔄 ML Pipeline