def generate_dataset_code(config):
    dataset_name = config.get("dataset", "iris")
    data_dir = config.get("data_dir", "data")
    max_samples = config.get("max_samples", 2000) if dataset_name in ["mnist", "fashion_mnist", "cifar10"] else None

    image_metadata = {
        "digits": (1, 8, 8),
        "mnist": (1, 28, 28),
        "fashion_mnist": (1, 28, 28),
        "cifar10": (3, 32, 32),
    }

    if dataset_name in ["mnist", "fashion_mnist", "cifar10"]:
        channels, height, width = image_metadata[dataset_name]
        imports = {f"from app.services.modal_service import get_{dataset_name}"}
        code = [
            "# Load Dataset From Modal",
            f"dataset = get_{dataset_name}({max_samples})",
            "X = dataset['X']",
            "y = dataset['y']",
            "data_format = 'image'",
            f"image_channels = {channels}",
            f"image_height = {height}",
            f"image_width = {width}"
            ""
        ]
    return imports, code