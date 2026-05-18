from app.pipeline.models import (linear_regression)

MODEL_REGISTRY = {
    "linear_regression": linear_regression.train
}

def run(input_data, config):
    algorithm = config.get("algorithm")
    if algorithm not in MODEL_REGISTRY:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    required_inputs = ["X_train", "X_test", "y_train", "y_test"]
    for key in required_inputs:
        if key not in input_data:
            raise ValueError(f"Missing required input: {key}")
    
    model_executor = MODEL_REGISTRY[algorithm]
    return model_executor(input_data, config)