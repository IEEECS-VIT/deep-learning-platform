def generate_dataset_code(config):
    dataset_name = config.get("dataset", "iris")
    data_dir = config.get("data_dir", "data")

    image_metadata = {
        "digits": (1, 8, 8),
        "mnist": (1, 28, 28),
        "fashion_mnist": (1, 28, 28),
        "cifar10": (3, 32, 32),
    }

    torchvision_loaders = {
        "mnist": "MNIST",
        "fashion_mnist": "FashionMNIST",
        "cifar10": "CIFAR10",
    }

    if dataset_name in torchvision_loaders:
        loader_name = torchvision_loaders[dataset_name]
        channels, height, width = image_metadata[dataset_name]
        imports = {"from torchvision import datasets"}
        code = [
            "# Load Dataset",
            f"dataset = datasets.{loader_name}(",
            f"    root={data_dir!r},",
            "    train=True,",
            "    download=True",
            ")",
            "X = dataset.data",
            "if hasattr(X, 'numpy'):",
            "    X = X.numpy()",
            "X = X.tolist()",
            "y = dataset.targets",
            "if hasattr(y, 'tolist'):",
            "    y = y.tolist()",
            "data_format = 'image'",
            f"image_channels = {channels}",
            f"image_height = {height}",
            f"image_width = {width}",
            ""
        ]
        return imports, code

    loaders = {
        "california_housing": "fetch_california_housing",
        "digits": "load_digits"
    }
    loader_name = loaders.get(dataset_name, f"load_{dataset_name}")
    imports = {f"from sklearn.datasets import {loader_name}"}
    data_attribute = "images" if dataset_name == "digits" else "data"

    code = [
        "# Load Dataset",
        f"dataset = {loader_name}()",
        f"X = dataset.{data_attribute}",
        "y = dataset.target",
    ]

    if dataset_name == "digits":
        channels, height, width = image_metadata[dataset_name]
        code.extend([
            "data_format = 'image'",
            f"image_channels = {channels}",
            f"image_height = {height}",
            f"image_width = {width}",
        ])

    code.append("")

    return imports, code
