from app.pipeline.nodes import dataset_node, model_node, preprocess_node, train_test_split_node

NODE_REGISTRY = {
    "dataset": {
        "executor": dataset_node.run,
        "metadata": {
            "display_name": "Dataset Node",
            "description": "Loads dataset into the pipeline",
            "inputs": [],
            "outputs": ["X", "y"],
            "config_schema": {
                "dataset": {
                    "type": "string",
                    "options": ["iris", "wine", "breast_cancer", "california_housing", "diabetes"],
                    "default": "iris"
                }
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
            "config_schema": {
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
            "config_schema": {
                "scaler_type": {
                    "type": "string",
                    "options": ["standard", "minmax", "robust"],
                    "default": "standard"
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
            "config_schema": {
                "algorithm": {
                    "type": "string",
                    "options": ["linear_regression", "logistic_regression", "decision_tree", "random_forest"],
                    "default": "logistic_regression"
                },
                "fit_intercept": {
                    "type": "boolean",
                    "default": True
                },
                "max_depth": {
                    "type": "integer",
                    "default": 5
                },
                "n_estimators": {
                    "type": "integer",
                    "default": 100
                },
                "criterion": {
                    "type": "string",
                    "options": ["gini", "entropy"],
                    "default": "gini"
                },
                "C": {
                    "type": "float",
                    "default": 1.0
                },
                "solver": {
                    "type": "string",
                    "options": ["lbfgs", "liblinear"],
                    "default": "lbfgs"
                }
            }
        }
    }
}