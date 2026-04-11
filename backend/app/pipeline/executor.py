from app.pipeline.utils import topological_sort

from app.pipeline.nodes import dataset_node, preprocess_node, model_node

NODE_REGISTRY = {
    'dataset': dataset_node.run,
    'preprocess': preprocess_node.run,
    'model': model_node.run,
}

def run_pipeline(pipeline):
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
            
        output = NODE_REGISTRY[node_type](input_data)
        results[node_id] = output
    return results