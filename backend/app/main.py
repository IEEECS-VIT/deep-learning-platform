from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.pipeline import router as pipeline_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend running"}

app.include_router(pipeline_router)