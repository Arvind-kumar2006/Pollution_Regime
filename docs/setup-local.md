# Local setup (development)

## Prerequisites
- Node.js 18+
- Python 3.11+ (works with newer versions as well)
- PostgreSQL 14+

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/pollution_db"
export APP_ENV=development
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

alembic upgrade head
uvicorn backend.main:app --reload
```

### Health checks
- `GET http://127.0.0.1:8000/health`
- `GET http://127.0.0.1:8000/health/ready`

## Frontend

```bash
cd frontend
npm install

# Create a local env file for dev (do not commit)
echo 'VITE_API_URL=http://127.0.0.1:8000' > .env.local

npm run dev
```

Open `http://localhost:5173`.

## Troubleshooting
- **DB auth failed**: verify `DATABASE_URL` credentials match your Postgres user/password.
- **CORS blocked**: ensure `CORS_ORIGINS` includes `http://localhost:5173`.

