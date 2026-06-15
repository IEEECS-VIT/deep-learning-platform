from app.services.modal_service import run_mlp, run_cnn, run_split_and_train_mlp, run_split_and_train_cnn

IMAGE_DATASETS = {"mnist", "fashion_mnist", "cifar10"}

def run(input_data, config):
    architecture = config.get("architecture", "mlp")
    if architecture not in {"mlp", "cnn"}:
        raise ValueError(f"Unknown architecture: {architecture}")

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

    dataset_name = input_data.get("dataset_name", "")
    is_image_dataset = dataset_name in IMAGE_DATASETS

    if is_image_dataset:
        max_samples = input_data.get("max_samples", 2000)
        split_config = {
            "test_size": input_data.get("split_test_size", 0.2),
            "random_state": input_data.get("split_random_state", 42),
        }
        if architecture == "cnn":
            filters = config.get("filters", 32)
            kernel_size = config.get("kernel_size", 3)
            dropout = config.get("dropout", 0.2)
            if filters <= 0:
                raise ValueError("filters must be greater than 0")
            if kernel_size <= 0:
                raise ValueError("kernel_size must be greater than 0")
            if dropout < 0 or dropout > 1:
                raise ValueError("dropout must be between 0 and 1")
            return run_split_and_train_cnn(dataset_name, max_samples, split_config, config)
        return run_split_and_train_mlp(dataset_name, max_samples, split_config, config)

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
            raise ValueError("dropout must be between 0 and 1")
        return run_cnn(input_data, config)
    return run_mlp(input_data, config)