from app.pipeline.generators.code_registry import CODE_GENERATOR_REGISTRY

def generate_pipeline_code(pipeline):
    all_imports = set()
    all_code = []

    for node in pipeline["nodes"]:
        node_type = node["type"]
        config = node.get("config", {})

        generator = CODE_GENERATOR_REGISTRY.get(node_type)

        if not generator:
            continue

        imports, code = generator(config)

        all_imports.update(imports)
        all_code.extend(code)

    final_code = sorted(all_imports)
    final_code.append("")
    final_code.extend(all_code)

    return "\n".join(final_code)