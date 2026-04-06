from fastapi import FastAPI
from routes import model, data

app = FastAPI(title="Pollution API")

app.include_router(data.router)
app.include_router(model.router)

@app.get("/")
def home():
    return {"message": "API running"}