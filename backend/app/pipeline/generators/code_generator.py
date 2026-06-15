from app.pipeline.generators.code_registry import CODE_GENERATOR_REGISTRY

def generate_pipeline_code(pipeline):
    all_imports = set()
    all_code = [
        "# Generated ML Pipeline"
    ]

    for node in pipeline["nodes"]:
        node_type = node["type"]
        config = node.get("config", {})

        generator = CODE_GENERATOR_REGISTRY.get(node_type)
        if not generator:
            continue

        imports, code = generator(config)

        all_imports.update(imports)
        all_code.extend(code)
        if node_type == "model":
            metrics_generator = CODE_GENERATOR_REGISTRY["metrics"]

            metric_imports, metric_code = metrics_generator(config)

            all_imports.update(metric_imports)
            all_code.extend(metric_code)


    final_code = sorted(all_imports)
    final_code.extend([
        "",
        ""
    ])
    final_code.extend(all_code)

    return "\n".join(final_code)