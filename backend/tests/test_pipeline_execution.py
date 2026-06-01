from app.pipeline.executor import run_pipeline
from app.pipeline.error_handler import PipelineError
import pytest

def test_classification_pipeline():
    pipeline = {
        "nodes": [
            {
                "id": "dataset_1",
                "type": "dataset",
                "config": {
                    "dataset": "iris"
                }
            },
            {
                "id": "split_1",
                "type":
                    "train_test_split",
                "config": {
                    "test_size": 0.2
                }
            },
            {
                "id": "preprocess_1",
                "type":
                    "preprocess",
                "config": {
                    "scale_factor": 1
                }
            },
            {
                "id": "model_1",
                "type":
                    "model",
                "config": {
                    "algorithm":
                        "logistic_regression"
                }
            }
        ],
        "edges": [
            {
                "source":
                    "dataset_1",
                "target":
                    "split_1"
            },
            {
                "source":
                    "split_1",
                "target":
                    "preprocess_1"
            },
            {
                "source":
                    "preprocess_1",
                "target":
                    "model_1"
            }
        ]
    }

    results = run_pipeline(pipeline)

    assert results["status"] == "success"

    assert results["output"]["model_name"] == "logistic_regression"

    assert "accuracy" in results["output"]["metrics"]
    

def test_regression_pipeline():
    pipeline = {
        "nodes": [
            {
                "id": "dataset_1",
                "type": "dataset",
                "config": {
                    "dataset": "diabetes"
                }
            },
            {
                "id": "split_1",
                "type":
                    "train_test_split",
                "config": {
                    "test_size": 0.2
                }
            },
            {
                "id": "preprocess_1",
                "type":
                    "preprocess",
                "config": {
                    "scale_factor": 1
                }
            },
            {
                "id": "model_1",
                "type":
                    "model",
                "config": {
                    "algorithm":
                        "linear_regression"
                }
            }
        ],
        "edges": [
            {
                "source":
                    "dataset_1",
                "target":
                    "split_1"
            },
            {
                "source":
                    "split_1",
                "target":
                    "preprocess_1"
            },
            {
                "source":
                    "preprocess_1",

                "target":
                    "model_1"
            }
        ]
    }

    results = run_pipeline(pipeline)

    assert results["status"] == "success"

    assert results["output"]["model_name"] == "linear_regression"

    assert "mse" in results["output"]["metrics"]
    
    
import pytest


def test_invalid_task_combination():
    pipeline = {
        "nodes": [
            {
                "id": "dataset_1",
                "type": "dataset",
                "config": {
                    "dataset": "iris"
                }
            },
            {
                "id": "split_1",
                "type":
                    "train_test_split",
                "config": {}
            },
            {
                "id": "preprocess_1",
                "type":
                    "preprocess",
                "config": {}
            },
            {
                "id": "model_1",
                "type":
                    "model",
                "config": {
                    "algorithm":
                        "linear_regression"
                }
            }
        ],
        "edges": [
            {
                "source":
                    "dataset_1",
                "target":
                    "split_1"
            },
            {
                "source":
                    "split_1",
                "target":
                    "preprocess_1"
            },
            {
                "source":
                    "preprocess_1",
                "target":
                    "model_1"
            }
        ]
    }

    with pytest.raises(PipelineError) as exc_info:
        run_pipeline(pipeline)
    assert exc_info.value.error_type == "NODE_EXECUTION_ERROR"