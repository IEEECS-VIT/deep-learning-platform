from app.pipeline.generators.dataset_generator import generate_dataset_code
from app.pipeline.generators.split_generator import generate_split_code
from app.pipeline.generators.preprocess_generator import generate_preprocess_code
from app.pipeline.generators.model_generator import generate_model_code

CODE_GENERATOR_REGISTRY = {
    "dataset": generate_dataset_code,
    "train_test_split": generate_split_code,
    "preprocess": generate_preprocess_code,
    "model": generate_model_code
}