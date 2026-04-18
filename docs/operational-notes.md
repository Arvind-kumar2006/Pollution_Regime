# Operational notes

## Runtime model artifacts
Trained artifacts are written to `artifacts/` at runtime. In production, store artifacts on:
- a persistent volume (EBS), or
- object storage (S3) and download on startup.

## Uploaded datasets
Uploads are written to `data/`. Most production environments need persistent storage or object storage.

## Performance
Training is synchronous and can take minutes. For scale:
- move training to a background worker
- return `run_id` immediately and poll run status

