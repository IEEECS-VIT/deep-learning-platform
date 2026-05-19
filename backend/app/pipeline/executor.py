from app.pipeline.utils import topological_sort

from app.pipeline.registry.node_registry import NODE_REGISTRY

def run_pipeline(pipeline):
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
    return {
        "status": "success",
        "final_node": final_node,
        "output": results[final_node]
    }