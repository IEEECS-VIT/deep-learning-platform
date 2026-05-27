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
                    "label": "Algorithm",
                    "options": ["linear_regression", "logistic_regression", "decision_tree", "random_forest"],
                    "default": "logistic_regression"
                },

                "fit_intercept": {
                    "type": "boolean",
                    "label": "Fit Intercept",
                    "default": True,
                    "visible_if": {
                        "algorithm": ["linear_regression", "logistic_regression"]
                    }
                },

                "max_depth": {
                    "type": "integer",
                    "label": "Max Depth",
                    "default": 5,
                    "min": 1,
                    "max": 100,
                    "visible_if": {
                        "algorithm": ["decision_tree", "random_forest"]
                    }
                },

                "n_estimators": {
                    "type": "integer",
                    "label": "Number of Estimators",
                    "default": 100,
                    "min": 1,
                    "max": 1000,
                    "visible_if": {
                        "algorithm": ["random_forest"]
                    }
                },

                "criterion": {
                    "type": "string",
                    "label": "Criterion",
                    "options": ["gini", "entropy"],
                    "default": "gini",
                    "visible_if": {
                        "algorithm": ["decision_tree", "random_forest"]
                    }
                },

                "C": {
                    "type": "float",
                    "label": "Regularization Strength",
                    "default": 1.0,
                    "min": 0.0001,
                    "max": 1000,
                    "visible_if": {
                        "algorithm": ["logistic_regression"]
                    }
                },

                "solver": {
                    "type": "string",
                    "label": "Solver",
                    "options": ["lbfgs", "liblinear"],
                    "default": "lbfgs",
                    "visible_if": {
                        "algorithm": ["logistic_regression"]
                    }
                }
            }
        }
    }
}