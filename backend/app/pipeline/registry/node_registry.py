from app.pipeline.nodes import dataset_node, model_node, preprocess_node

NODE_REGISTRY = {
    "dataset": {
        "executor": dataset_node.run,
        "metadata": {
            "display_name": "Dataset Node",
            "description": "Loads dataset into the pipeline",
            "inputs": [],
            "outputs": ["X_train", "y_train"],
            "config_schemas": {
                "dataset": "string"
            }
        }
    },
    
    "preprocess": {
        "executor": preprocess_node.run,
        "metadata": {
            "display_name": "Preprocess Node",
            "description": "Applies preprocessing transformations",
            "inputs": ["X_train", "y_train"],
            "outputs": ["X_train", "y_train"],
            "config_schemas": {
                "scale_factor": "integer"
            }
        }
    },
    
    "model": {
        "executor": model_node.run,
        "metadata": {
            "display_name": "Model Node",
            "description": "Trains machine learning model",
            "inputs": ["X_train", "y_train"],
            "outputs": ["predictions", "metrics"],
            "config_schemas": {
                "algorithm": "string",
                "fit_intercept": "boolean"
            }
        }
    }
}