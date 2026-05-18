from app.pipeline.nodes import dataset_node, model_node, preprocess_node, train_test_split_node

NODE_REGISTRY = {
    "dataset": {
        "executor": dataset_node.run,
        "metadata": {
            "display_name": "Dataset Node",
            "description": "Loads dataset into the pipeline",
            "inputs": [],
            "outputs": ["X", "y"],
            "config_schemas": {
                "dataset": "string",
                "options": [
                    "iris", "wine", "breast_cancer"
                ],
                "default": "iris"
            }
        }
    },
    
    "train_test_split": {
        "executor": train_test_split_node.run,
        "metadata": {
            "display_name": "Train-Test Split Node",
            "description": "Splits dataset into training and testing sets",
            "inputs": ["X", "y"],
            "outputs": ["X_train", "X_test", "y_train", "y_test"],
            "config_schemas": {
                "test_size": {
                    "type": "float",
                    "default": 0.2
                },
                "random_state": {
                    "type": "integer",
                    "default": 42
                }
            }
        }
    },
    
    "preprocess": {
        "executor": preprocess_node.run,
        "metadata": {
            "display_name": "Preprocess Node",
            "description": "Applies preprocessing transformations",
            "inputs": ["X_train", "X_test", "y_train", "y_test"],
            "outputs": ["X_train", "X_test", "y_train", "y_test"],
            "config_schemas": {
                "scale_factor": {
                    "type": "integer",
                    "default": 1
                }
            }
        }
    },
    
    "model": {
        "executor": model_node.run,
        "metadata": {
            "display_name": "Model Node",
            "description": "Trains machine learning model",
            "inputs": ["X_train","X_test", "y_train", "y_test"],
            "outputs": ["predictions", "metrics"],
            "config_schemas": {
                "algorithm": {
                    "type": "string",
                    "options": ["linear_regression"],
                },
                "fit_intercept": {
                    "type": "boolean",
                    "default": True
                }
            }
        }
    }
}