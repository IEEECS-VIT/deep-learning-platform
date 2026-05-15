from app.pipeline.models import (linear_regression)

MODEL_REGISTRY = {
    "linear_regression": linear_regression.train
}

def run(input_data, config):
    algorithm = config.get("algorithm")
    if algorithm not in MODEL_REGISTRY:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    return MODEL_REGISTRY[algorithm](input_data, config)