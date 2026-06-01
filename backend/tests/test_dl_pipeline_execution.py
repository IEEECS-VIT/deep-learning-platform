from app.pipeline.executor import run_pipeline

def test_dl_pipeline_execution():
    pipeline = {
        "nodes": [
            {
                "id": "dataset",
                "type": "dataset",
                "config": {
                    "dataset": "iris"
                }
            },
            {
                "id": "split",
                "type": "train_test_split",
                "config": {}
            },
            {
                "id": "preprocess",
                "type": "preprocess",
                "config": {
                    "scaler_type": "standard"
                }
            },
            {
                "id": "nn",
                "type": "neural_network",
                "config": {
                    "architecture": "mlp",
                    "hidden_size": 32,
                    "epochs": 5,
                    "learning_rate": 0.001,
                    "batch_size": 32,
                    "optimizer": "adam"
                }
            }
        ],
        "edges": [
            {
                "source": "dataset",
                "target": "split"
            },
            {
                "source": "split",
                "target": "preprocess"
            },
            {
                "source": "preprocess",
                "target": "nn"
            }
        ]
    }

    result = run_pipeline(pipeline)
    assert result["status"] == "success"
    assert "output" in result
    assert "metrics" in result["output"]
    assert "accuracy" in result["output"]["metrics"]