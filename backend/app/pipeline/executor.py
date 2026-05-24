import time
from app.pipeline.utils import topological_sort
from app.pipeline.registry.node_registry import NODE_REGISTRY
from app.pipeline.generators.code_generator import generate_pipeline_code

def run_pipeline(pipeline):
    start_time = time.time()
    if "nodes" not in pipeline:
        raise ValueError("Pipeline missing nodes")

    if "edges" not in pipeline:
        raise ValueError("Pipeline missing edges")
    order = topological_sort(pipeline)
    node_map = {node['id']: node for node in pipeline["nodes"]}
    results = {}
    parents = {node_id: [] for node_id in node_map}
    for edge in pipeline["edges"]:
        parents[edge['target']].append(edge['source'])
        
    for node_id in order:
        node = node_map[node_id]
        node_type = node['type']
        if node_type not in NODE_REGISTRY:
            raise ValueError(f"Unknown node type: {node_type}")
        
        input_data = {}
        for parent in parents[node_id]:
            input_data.update(results[parent])
            
        config = node.get('config', {})
            
        executor = NODE_REGISTRY[node_type]['executor']
        output = executor(input_data, config)
        results[node_id] = output
        
    final_node = order[-1]
    execution_time = round(time.time() - start_time, 4)
    generated_code = generate_pipeline_code(pipeline)
    return {
        "status": "success",
        "execution_time": execution_time,
        "final_node": final_node,
        "pipeline_summary": {
            "total_nodes": len(pipeline["nodes"]),
            "total_edges": len(pipeline["edges"]),
        },
        "output": results[final_node],
        "generated_code": generated_code
    }