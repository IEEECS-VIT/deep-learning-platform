import json
import sys
from pathlib import Path

# Ensure backend directory is in PYTHONPATH
sys.path.append('backend')

# Import the pipeline execution function
from app.pipeline.executor import run_pipeline

config = {
    "nodes": [
        {"type": "dataset", "config": {"dataset": "cifar10", "data_dir": "data", "max_samples": 2000}},
        {"type": "train_test_split", "config": {"test_size": 0.2, "random_state": 42}},
        {"type": "neural_network", "config": {"architecture": "cnn", "epochs": 2, "batch_size": 64, "learning_rate": 0.001, "optimizer": "adam", "filters": 32, "kernel_size": 3, "hidden_size": 128, "dropout": 0.2}}
    ]
}

# Run the pipeline
result = run_pipeline(config)

# Print summary
print(json.dumps(result, indent=2))

# Save output to file for inspection
output_path = Path("cifar10_pipeline_output.json")
output_path.write_text(json.dumps(result, indent=2))
