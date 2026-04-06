from fastapi import APIRouter, UploadFile, File
import pandas as pd
from pathlib import Path

router = APIRouter(prefix="/data", tags=["Data"])

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_path = DATA_DIR / file.filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    df = pd.read_csv(file_path)

    return {
        "message": "Uploaded",
        "rows": len(df),
        "columns": list(df.columns)
    }