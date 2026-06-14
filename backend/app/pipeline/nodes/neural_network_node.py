from app.services.modal_service import run_mlp, run_cnn

def run(input_data, config):
    architecture = config.get("architecture", "mlp")
    if architecture not in {"mlp", "cnn"}:
        raise ValueError(
            f"Unknown architecture: {architecture}"
        )
    hidden_size = config.get("hidden_size", 128)
    epochs = config.get("epochs", 10)
    learning_rate = config.get("learning_rate", 0.001)
    batch_size = config.get("batch_size", 32)
    optimizer = config.get("optimizer", "adam")
    if hidden_size <= 0:
        raise ValueError("hidden_size must be greater than 0")
    if epochs <= 0:
        raise ValueError("epochs must be greater than 0")
    if learning_rate <= 0:
        raise ValueError("learning_rate must be greater than 0")
    if batch_size <= 0:
        raise ValueError("batch_size must be greater than 0")
    if optimizer not in {"adam", "sgd"}:
        raise ValueError("optimizer must be one of: adam, sgd")

    if architecture == "cnn":
        if input_data.get("data_format") != "image":
            raise ValueError("CNN architecture requires an image dataset")
        filters = config.get("filters", 32)
        kernel_size = config.get("kernel_size", 3)
        dropout = config.get("dropout", 0.2)
        if filters <= 0:
            raise ValueError("filters must be greater than 0")
        if kernel_size <= 0:
            raise ValueError("kernel_size must be greater than 0")
        if dropout < 0 or dropout > 1:
            raise ValueError( "dropout must be between 0 and 1")
        return run_cnn(input_data, config)
    return run_mlp(input_data, config)