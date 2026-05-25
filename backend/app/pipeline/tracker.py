def create_execution_record(node_id, node_type):
    return {
        "node_id": node_id,
        "node_type": node_type,
        "status": "running",
        "execution_time": 0,
        "error": None
    }

def mark_execution_success(record, execution_time):
    record["status"] = "success"
    record["execution_time"] = execution_time
    return record

def mark_execution_failed(record, execution_time, error):
    record["status"] = "failed"
    record["execution_time"] = execution_time
    record["error"] = str(error)
    return record