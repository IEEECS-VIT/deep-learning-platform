from fastapi import FastAPI
from app.routes.pipeline import router as pipeline_router

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend running"}

app.include_router(pipeline_router)