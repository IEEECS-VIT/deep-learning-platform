const BASE_URL = "http://localhost:8000";

interface Node {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

interface Edge {
  source: string;
  target: string;
}

interface PipelinePayload {
  nodes: Node[];
  edges: Edge[];
}

export async function runPipeline(payload: PipelinePayload) {
  const response = await fetch(`${BASE_URL}/run_pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Pipeline execution failed");
  }

  return response.json();
}

export async function getNodes() {
  const response = await fetch(`${BASE_URL}/nodes`);
  if (!response.ok) throw new Error("Failed to fetch nodes");
  return response.json();
}