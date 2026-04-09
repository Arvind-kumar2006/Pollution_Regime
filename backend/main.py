from fastapi import FastAPI
from backend.routes import data
from backend.routes import model_routes
from backend.routes.model_routes import router as model_router
from backend.routes.data import router as data_router

from backend.database import engine
from backend.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pollution API")

app.include_router(data.router)
app.include_router(model_routes.router)

@app.get("/")
def home():
    return {"message": "API running"}