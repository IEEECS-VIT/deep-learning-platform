import pytest
from app.pipeline.nodes.neural_network_node import run

def test_invalid_architecture_raises_error():
    input_data = {}
    config = {
        "architecture": "banana"
    }
    with pytest.raises(ValueError):
        run(input_data, config)

def test_invalid_epochs():
    config = {
        "architecture": "mlp",
        "epochs": -5
    }
    with pytest.raises(ValueError):
        run({}, config)

def test_invalid_learning_rate():
    config = {
        "architecture": "mlp",
        "learning_rate": -0.1
    }
    with pytest.raises(ValueError):
        run({}, config)
def test_invalid_batch_size():
    config = {
        "architecture": "mlp",
        "batch_size": 0
    }
    with pytest.raises(ValueError):
        run({}, config)
def test_invalid_hidden_size():
    config = {
        "architecture": "mlp",
        "hidden_size": -10
    }
    with pytest.raises(ValueError):
        run({}, config)