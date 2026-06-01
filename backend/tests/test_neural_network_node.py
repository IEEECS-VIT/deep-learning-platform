import pytest
from app.pipeline.nodes.neural_network_node import run

def test_invalid_architecture_raises_error():
    input_data = {}
    config = {
        "architecture": "banana"
    }
    with pytest.raises(ValueError):
        run(input_data, config)