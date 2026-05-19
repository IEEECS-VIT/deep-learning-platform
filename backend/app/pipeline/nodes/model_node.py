from app.pipeline.models import (
    linear_regression, 
    logistic_regression, 
    decision_tree, 
    random_forest
)

MODEL_REGISTRY = {
    "linear_regression": {
        "executor": linear_regression.train,
        "task_type": "regression"
    },
    "logistic_regression": {
        "executor": logistic_regression.train,
        "task_type": "classification"
    },
    "decision_tree": {
        "executor": decision_tree.train,
        "task_type": "classification"
    },
    "random_forest": {
        "executor": random_forest.train,
        "task_type": "classification"
    }
}

def run(input_data, config):
    algorithm = config.get("algorithm")
    if not algorithm:
        raise ValueError("Algorithm not specified")
    if algorithm not in MODEL_REGISTRY:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    required_inputs = ["X_train", "X_test", "y_train", "y_test"]
    for key in required_inputs:
        if key not in input_data:
            raise ValueError(f"Missing required input: {key}")
    
    model_info = MODEL_REGISTRY[algorithm]
    
    dataset_task_type = input_data["task_type"]
    model_task_type = model_info["task_type"]
    if dataset_task_type != model_task_type:
        raise ValueError(f"Incompatible model and dataset task types: "
                         f"{dataset_task_type} vs {model_task_type}")
    
    model_executor = model_info["executor"]
    return model_executor(input_data, config)