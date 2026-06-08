import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import {
  buildDefaultConfig,
  type ConfigSchemaMap,
  type NodeMetadataEntry,
} from "@/lib/configSchema";
import { mergeSchemaExtensions } from "@/lib/schemaExtensions";

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

interface PipelineStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  errorNodeId: string | null;
  nodeTypeCounts: Record<string, number>;
  nodeMetadata: Record<string, NodeMetadataEntry>;
  past: Snapshot[];
  future: Snapshot[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;
  setNodeMetadata: (metadata: Record<string, NodeMetadataEntry>) => void;
  setErrorNodeId: (nodeId: string | null) => void;
  updateNodeConfig: (
    nodeId: string,
    config: Record<string, unknown>,
    options?: { replace?: boolean },
  ) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  onNodeDragStop: (
    node: Node,
    previousPosition: { x: number; y: number },
  ) => void;
  undo: () => void;
  redo: () => void;
}

const getDefaultConfigForType = (
  type: string,
  metadata: Record<string, NodeMetadataEntry>,
) => {
  const schema = metadata[type]?.config_schema;
  if (!schema) return {};
  const merged = mergeSchemaExtensions(type, schema as ConfigSchemaMap);
  return buildDefaultConfig(merged);
};

export const usePipelineStore = create<PipelineStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  errorNodeId: null,
  nodeTypeCounts: {},
  nodeMetadata: {},
  past: [],
  future: [],

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (connection) =>
    set((state) => ({
      past: [...state.past, { nodes: state.nodes, edges: state.edges }],
      future: [],
      edges: addEdge(connection, state.edges),
    })),

  addNode: (type, position) =>
    set((state) => {
      const nextCount = (state.nodeTypeCounts[type] ?? 0) + 1;
      const displayLabel = `${type}-${nextCount}`;
      const nextId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `node-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const defaultConfig = getDefaultConfigForType(type, state.nodeMetadata);
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }],
        future: [],
        nodes: [
          ...state.nodes,
          {
            id: nextId,
            type,
            position,
            data: { label: displayLabel, config: defaultConfig },
          },
        ],
        nodeTypeCounts: { ...state.nodeTypeCounts, [type]: nextCount },
        errorNodeId: null,
      };
    }),

  setNodeMetadata: (metadata) => set(() => ({ nodeMetadata: metadata })),

  setErrorNodeId: (nodeId) =>
    set((state) => ({
      errorNodeId: nodeId,
      nodes: state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          hasError: nodeId !== null && node.id === nodeId,
        },
      })),
    })),

  setSelectedNode: (nodeId) =>
    set(() => ({ selectedNodeId: nodeId, selectedEdgeId: null })),

  setSelectedEdge: (edgeId) =>
    set(() => ({ selectedEdgeId: edgeId, selectedNodeId: null })),

  updateNodeConfig: (nodeId, config, options) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: options?.replace
                  ? config
                  : {
                      ...(((node.data as Record<string, unknown>).config as Record<
                        string,
                        unknown
                      >) ?? {}),
                      ...config,
                    },
              },
            }
          : node,
      ),
    })),

  deleteNode: (nodeId) =>
    set((state) => ({
      past: [...state.past, { nodes: state.nodes, edges: state.edges }],
      future: [],
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
      selectedNodeId:
        state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      selectedEdgeId: null,
    })),

  deleteEdge: (edgeId) =>
    set((state) => ({
      past: [...state.past, { nodes: state.nodes, edges: state.edges }],
      future: [],
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId:
        state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
    })),

  onNodeDragStop: (node, previousPosition) =>
    set((state) => ({
      past: [
        ...state.past,
        {
          nodes: state.nodes.map((n) =>
            n.id === node.id ? { ...n, position: previousPosition } : n,
          ),
          edges: state.edges,
        },
      ],
      future: [],
    })),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.future],
        nodes: previous.nodes,
        edges: previous.edges,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }],
        future: state.future.slice(1),
        nodes: next.nodes,
        edges: next.edges,
      };
    }),
}));
