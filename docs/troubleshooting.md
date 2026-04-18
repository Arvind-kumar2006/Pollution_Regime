# Troubleshooting

## CORS blocked in browser
- Ensure backend env: `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- Restart the backend after changing env vars.

## DATABASE_URL required / authentication failed
- Set `DATABASE_URL` explicitly before starting `uvicorn`.
- Verify username/password match your local Postgres configuration.

## Training request timeout
Training can take minutes. The frontend uses a longer timeout for `POST /model/train`.
For scale, move training to a background job and poll run status.

