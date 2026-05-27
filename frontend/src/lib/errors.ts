export type ErrorContext = {
  nodeId?: string;
  nodeType?: string;
};

type ErrorDetail = {
  message?: unknown;
  error?: unknown;
  node_id?: unknown;
  node_type?: unknown;
  nodeId?: unknown;
  nodeType?: unknown;
};

type ErrorShape = {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  node_id?: unknown;
  node_type?: unknown;
  nodeId?: unknown;
  nodeType?: unknown;
};

type BackendError = {
  message?: unknown;
  node_id?: unknown;
  node_type?: unknown;
};

export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const typedError = error as ErrorShape;
    if (typeof typedError.detail === "string") return typedError.detail;

    if (typedError.error && typeof typedError.error === "object") {
      const backendError = typedError.error as BackendError;
      if (typeof backendError.message === "string") return backendError.message;
    }

    if (typedError.detail && typeof typedError.detail === "object") {
      const detail = typedError.detail as ErrorDetail;
      if (typeof detail.message === "string") return detail.message;
      if (detail.error && typeof detail.error === "object") {
        const nested = detail.error as BackendError;
        if (typeof nested.message === "string") return nested.message;
      }
    }

    if (typeof typedError.message === "string") return typedError.message;
  }

  return "Unknown error";
};

export const extractErrorContext = (error: unknown): ErrorContext => {
  if (!error || typeof error !== "object") return {};

  const typedError = error as ErrorShape;
  if (typedError.error && typeof typedError.error === "object") {
    const backendError = typedError.error as BackendError;
    const backendNodeId = typeof backendError.node_id === "string" ? backendError.node_id : undefined;
    const backendNodeType = typeof backendError.node_type === "string" ? backendError.node_type : undefined;
    if (backendNodeId || backendNodeType) return { nodeId: backendNodeId, nodeType: backendNodeType };
  }
  const directNodeId = typeof typedError.nodeId === "string" ? typedError.nodeId : undefined;
  const directNodeType = typeof typedError.nodeType === "string" ? typedError.nodeType : undefined;
  if (directNodeId || directNodeType) return { nodeId: directNodeId, nodeType: directNodeType };

  const legacyNodeId = typeof typedError.node_id === "string" ? typedError.node_id : undefined;
  const legacyNodeType = typeof typedError.node_type === "string" ? typedError.node_type : undefined;
  if (legacyNodeId || legacyNodeType) return { nodeId: legacyNodeId, nodeType: legacyNodeType };

  if (typedError.detail && typeof typedError.detail === "object") {
    const detail = typedError.detail as ErrorDetail;
    const detailNodeId =
      typeof detail.nodeId === "string"
        ? detail.nodeId
        : typeof detail.node_id === "string"
          ? detail.node_id
          : undefined;
    const detailNodeType =
      typeof detail.nodeType === "string"
        ? detail.nodeType
        : typeof detail.node_type === "string"
          ? detail.node_type
          : undefined;
    if (detailNodeId || detailNodeType) return { nodeId: detailNodeId, nodeType: detailNodeType };

    if (detail.error && typeof detail.error === "object") {
      const nested = detail.error as BackendError;
      const nestedNodeId = typeof nested.node_id === "string" ? nested.node_id : undefined;
      const nestedNodeType = typeof nested.node_type === "string" ? nested.node_type : undefined;
      if (nestedNodeId || nestedNodeType) return { nodeId: nestedNodeId, nodeType: nestedNodeType };
    }
  }

  return {};
};

export const parseErrorResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  let body: unknown = null;

  if (contentType.includes("application/json")) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    try {
      const text = await response.text();
      body = text || null;
    } catch {
      body = null;
    }
  }

  const message = extractErrorMessage(body ?? response.statusText);
  const context = extractErrorContext(body);

  return { message, ...context, detail: body };
};
