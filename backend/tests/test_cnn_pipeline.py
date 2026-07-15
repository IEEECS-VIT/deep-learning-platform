import pytest

from app.pipeline.error_handler import PipelineError
from app.pipeline.executor import run_pipeline
from app.pipeline.generators.dataset_generator import generate_dataset_code
from app.pipeline.generators.neural_network_generator import generate_neural_network_code
from app.pipeline.nodes import dataset_node
from app.pipeline.nodes.dataset_node import run as run_dataset


def _make_mock_image_data(dataset_name, data_shape):
    channels = data_shape[3] if len(data_shape) == 4 else 1
    height = data_shape[1]
    width = data_shape[2]
    num_samples = data_shape[0]

    if len(data_shape) == 4:
        X = [[[[float((i + r + c + ch) % 255) for ch in range(channels)]
               for c in range(width)]
              for r in range(height)]
             for i in range(num_samples)]
    else:
        X = [[[float((i + r + c) % 255) for c in range(width)]
              for r in range(height)]
             for i in range(num_samples)]

    return {
        "X": X,
        "y": [index % 2 for index in range(num_samples)],
        "dataset_name": dataset_name,
        "task_type": "classification",
        "data_format": "image",
        "image_channels": channels,
        "image_height": height,
        "image_width": width,
    }


def patch_torchvision_dataset(monkeypatch, dataset_name, data_shape):
    mock_data = _make_mock_image_data(dataset_name, data_shape)
    func_name = f"get_{dataset_name}"
    monkeypatch.setattr(dataset_node, func_name, lambda max_samples=2000: mock_data)


def test_digits_dataset_returns_images_with_metadata():
    result = run_dataset({}, {"dataset": "digits"})

    assert result["dataset_name"] == "digits"
    assert result["task_type"] == "classification"
    assert result["data_format"] == "image"
    assert result["image_channels"] == 1
    assert result["image_height"] == 8
    assert result["image_width"] == 8
    assert len(result["X"][0]) == 8
    assert len(result["X"][0][0]) == 8


@pytest.mark.parametrize(
    "dataset_name,data_shape,channels,height,width",
    [
        ("mnist", (8, 28, 28), 1, 28, 28),
        ("fashion_mnist", (8, 28, 28), 1, 28, 28),
        ("cifar10", (8, 32, 32, 3), 3, 32, 32),
    ]
)
def test_torchvision_image_datasets_return_metadata(
    monkeypatch,
    dataset_name,
    data_shape,
    channels,
    height,
    width
):
    patch_torchvision_dataset(monkeypatch, dataset_name, data_shape)

    result = run_dataset({}, {"dataset": dataset_name, "data_dir": "/tmp/dlp-data"})

    assert result["dataset_name"] == dataset_name
    assert result["task_type"] == "classification"
    assert result["data_format"] == "image"
    assert result["image_channels"] == channels
    assert result["image_height"] == height
    assert result["image_width"] == width
    assert len(result["X"]) == data_shape[0]


def test_cnn_digits_pipeline_execution():
    pipeline = {
        "nodes": [
            {
                "id": "dataset",
                "type": "dataset",
                "config": {
                    "dataset": "digits"
                }
            },
            {
                "id": "split",
                "type": "train_test_split",
                "config": {
                    "test_size": 0.2,
                    "random_state": 42
                }
            },
            {
                "id": "nn",
                "type": "neural_network",
                "config": {
                    "architecture": "cnn",
                    "filters": 8,
                    "kernel_size": 3,
                    "hidden_size": 32,
                    "dropout": 0.2,
                    "epochs": 1,
                    "learning_rate": 0.001,
                    "batch_size": 64,
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
                "target": "nn"
            }
        ]
    }

    result = run_pipeline(pipeline)

    assert result["status"] == "success"
    assert result["output"]["model_name"] == "cnn"
    assert "accuracy" in result["output"]["metrics"]
    assert "loss" in result["output"]["metrics"]
    assert "best_loss" in result["output"]
    assert "final_loss" in result["output"]
    assert len(result["output"]["loss_history"]) == 1
    assert "class CNN" in result["generated_code"]
    assert "nn.Conv2d(image_channels, filters" in result["generated_code"]
    assert "DataLoader" in result["generated_code"]


@pytest.mark.parametrize(
    "dataset_name,data_shape",
    [
        ("mnist", (12, 28, 28)),
        ("fashion_mnist", (12, 28, 28)),
        ("cifar10", (12, 32, 32, 3)),
    ]
)
def test_torchvision_cnn_pipeline_execution(monkeypatch, dataset_name, data_shape):
    patch_torchvision_dataset(monkeypatch, dataset_name, data_shape)
    pipeline = {
        "nodes": [
            {
                "id": "dataset",
                "type": "dataset",
                "config": {
                    "dataset": dataset_name
                }
            },
            {
                "id": "split",
                "type": "train_test_split",
                "config": {
                    "test_size": 0.25,
                    "random_state": 42
                }
            },
            {
                "id": "nn",
                "type": "neural_network",
                "config": {
                    "architecture": "cnn",
                    "filters": 4,
                    "kernel_size": 3,
                    "hidden_size": 8,
                    "dropout": 0.1,
                    "epochs": 1,
                    "learning_rate": 0.001,
                    "batch_size": 4,
                    "optimizer": "sgd"
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
                "target": "nn"
            }
        ]
    }

    result = run_pipeline(pipeline)

    assert result["status"] == "success"
    assert result["output"]["model_name"] == "cnn"
    assert result["output"]["training_summary"]["optimizer"] == "sgd"
    assert "accuracy" in result["output"]["metrics"]


def test_cnn_rejects_non_image_dataset():
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
                "id": "nn",
                "type": "neural_network",
                "config": {
                    "architecture": "cnn",
                    "epochs": 1
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
                "target": "nn"
            }
        ]
    }

    with pytest.raises(PipelineError) as exc_info:
        run_pipeline(pipeline)

    assert "CNN architecture requires an image dataset" in str(exc_info.value)


def test_cnn_code_generation_includes_runtime_components():
    imports, code = generate_neural_network_code(
        {
            "architecture": "cnn",
            "filters": 16,
            "kernel_size": 5,
            "hidden_size": 32,
            "dropout": 0.25,
            "epochs": 1,
            "learning_rate": 0.001,
            "batch_size": 64,
            "optimizer": "sgd",
        }
    )
    generated_code = "\n".join(sorted(imports) + code)

    assert "class CNN" in generated_code
    assert "prepare_image_tensor" in generated_code
    assert "nn.Conv2d(image_channels, filters" in generated_code
    assert "nn.Conv2d(filters, filters * 2" in generated_code
    assert "nn.Dropout(dropout)" in generated_code
    assert "nn.MaxPool2d(kernel_size=2)" in generated_code
    assert "TensorDataset" in generated_code
    assert "DataLoader" in generated_code
    assert "optimizer_name == 'sgd'" in generated_code
    assert "loss_history" in generated_code
    assert "accuracy_score" in generated_code


@pytest.mark.parametrize(
    "dataset_name,loader_name",
    [
        ("mnist", "datasets.MNIST"),
        ("fashion_mnist", "datasets.FashionMNIST"),
        ("cifar10", "datasets.CIFAR10"),
    ]
)
def test_torchvision_dataset_code_generation(dataset_name, loader_name):
    imports, code = generate_dataset_code(
        {
            "dataset": dataset_name,
            "data_dir": "data/images"
        }
    )
    generated_code = "\n".join(sorted(imports) + code)

    assert "from torchvision import datasets" in imports
    assert loader_name in generated_code
    assert "download=True" in generated_code
    assert "data_format = 'image'" in generated_code
