from app.pipeline.executor import run_pipeline

def test_pipeline_execution():
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