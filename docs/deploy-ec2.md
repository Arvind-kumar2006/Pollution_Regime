# Production deployment (AWS EC2)

This project is designed for a typical split deployment:
- React frontend served via static hosting (or Nginx on EC2)
- FastAPI backend behind a reverse proxy
- PostgreSQL via RDS (recommended) or a managed Postgres instance

## Recommended production environment variables

### Backend
- `APP_ENV=production`
- `DATABASE_URL=postgresql://...` (RDS or managed Postgres)
- `CORS_ORIGINS=https://your-frontend-domain`
- `SETTINGS_API_KEY=...` (required for settings writes)
- `UPLOAD_MAX_MB=50`
- `SQL_ECHO=false`

### Frontend
- `VITE_API_URL=https://api.your-domain`

## Hardening checklist
- Terminate TLS at the reverse proxy (Nginx) or load balancer
- Restrict inbound traffic to API ports (security group)
- Store uploads/artifacts on persistent storage (EBS volume) or object storage (S3)
- Disable/lock down `/docs` and `/redoc` if the API is public
- Add request rate limiting at the proxy (recommended)

## Operational checks
- `GET /health` for liveness
- `GET /health/ready` for DB readiness

