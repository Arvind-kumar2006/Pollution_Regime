from pathlib import Path

import numpy as np
import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.config import UPLOAD_MAX_MB
from backend.database import SessionLocal
from backend.models import Dataset

router = APIRouter(prefix="/data", tags=["Data"])

_MAX_BYTES = UPLOAD_MAX_MB * 1024 * 1024

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        import io
        import uuid

        safe_filename = Path(file.filename).name
        if not safe_filename or safe_filename in (".", ".."):
            raise HTTPException(status_code=400, detail="Invalid filename")

        unique_prefix = str(uuid.uuid4())[:8]
        secure_filename = f"{unique_prefix}_{safe_filename}"

        file_path = DATA_DIR / secure_filename
        contents = await file.read()

        if len(contents) > _MAX_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File too large (max {UPLOAD_MAX_MB} MB)",
            )

        file_path.write_bytes(contents)

        df = pd.read_csv(io.BytesIO(contents), sep=";")

        preview_df = df.head(5).where(pd.notnull(df.head(5)), None)
        raw_preview_json = preview_df.to_dict(orient="records")

        def to_jsonable(value):
            if pd.isna(value):
                return None
            if isinstance(value, (np.integer, np.floating, np.bool_)):
                return value.item()
            if isinstance(value, pd.Timestamp):
                return value.isoformat()
            return value

        raw_preview_json = [
            {k: to_jsonable(v) for k, v in row.items()} for row in raw_preview_json
        ]

        rel_path = str(Path("data") / secure_filename)

        db = SessionLocal()
        try:
            new_dataset = Dataset(
                original_file_name=safe_filename,
                stored_file_name=secure_filename,
                file_path=rel_path,
                row_count=len(df),
                file_size_bytes=len(contents),
                upload_status="completed",
                preview_json=raw_preview_json,
            )
            db.add(new_dataset)
            db.commit()
            db.refresh(new_dataset)
        finally:
            db.close()

        preview_rows = []
        for row in raw_preview_json[:5]:
            ts = f"{row.get('Date', '')} {row.get('Time', '')}".strip()

            raw_val = str(row.get("CO(GT)", "0")).replace(",", ".")
            try:
                clean_val = round(float(raw_val), 2)
            except ValueError:
                clean_val = 0.0

            preview_rows.append({"timestamp": ts, "value": clean_val})

        avg_val = None
        volatility = None
        metrics_status = "not_computed"
        if "CO(GT)" in df.columns:
            co_gt_num = pd.to_numeric(
                df["CO(GT)"].astype(str).str.replace(",", ".", regex=False), errors="coerce"
            )
            if not co_gt_num.isna().all():
                avg_val_f = float(co_gt_num.mean())
                std_val_f = float(co_gt_num.std()) if not pd.isna(co_gt_num.std()) else None
                if not pd.isna(avg_val_f) and std_val_f is not None and not pd.isna(std_val_f):
                    avg_val = round(avg_val_f, 1)
                    ratio = (std_val_f / max(avg_val_f, 1.0)) if avg_val_f is not None else None
                    if ratio is not None:
                        volatility = f"{'High' if std_val_f > 2 else 'Normal'} ({ratio:.2f})"
                        metrics_status = "computed"

        return {
            "message": "Uploaded",
            "rows": len(df),
            "columns": list(df.columns),
            "dataset_id": str(new_dataset.dataset_id),
            "filename": secure_filename,
            "preview": preview_rows,
            "avg_aqi": avg_val,
            "expected_volatility": volatility,
            "metrics_status": metrics_status,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Dataset processing error")
