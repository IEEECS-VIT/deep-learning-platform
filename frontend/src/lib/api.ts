import { extractErrorMessage, parseErrorResponse } from "./errors";

const BASE_URL = "/api";

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
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/run_pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw { message: extractErrorMessage(error), isNetworkError: true };
  }

  if (!response.ok) {
    const parsed = await parseErrorResponse(response);
    throw {
      message: parsed.message,
      nodeId: parsed.nodeId,
      nodeType: parsed.nodeType,
      detail: parsed.detail,
      status: parsed.status ?? response.status,
    };
  }

  const data = await response.json();
  return data.results ?? data;
}

export async function getNodes() {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/nodes`);
  } catch (error) {
    throw { message: extractErrorMessage(error), isNetworkError: true };
  }
  if (!response.ok) {
    const parsed = await parseErrorResponse(response);
    throw { message: parsed.message, detail: parsed.detail, status: response.status };
  }
  return response.json();
}