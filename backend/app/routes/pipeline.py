from fastapi import APIRouter, HTTPException
from app.pipeline.executor import run_pipeline
from app.pipeline.schemas import Pipeline

router = APIRouter()

@router.post("/run_pipeline")
def execute_pipeline(pipeline: Pipeline):
    try:
        results = run_pipeline(pipeline.model_dump())
        return{
            "status": "success",
            "results": results
        }
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )