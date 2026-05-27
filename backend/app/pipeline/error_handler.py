class PipelineError(Exception):
    def __init__(self, error_type, message, node_id=None):
        self.error_type = error_type
        self.message = message
        self.node_id = node_id
        super().__init__(message)

    def to_dict(self):
        return {
            "status": "error",
            "error": {
                "type": self.error_type,
                "node_id": self.node_id,
                "message": self.message
            }
        }