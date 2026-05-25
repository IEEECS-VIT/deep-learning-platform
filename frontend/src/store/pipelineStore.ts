import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

interface PipelineStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  nodeTypeCounts: Record<string, number>;
  past: Snapshot[];
  future: Snapshot[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  onNodeDragStop: (
    node: Node,
    previousPosition: { x: number; y: number },
  ) => void;
  undo: () => void;
  redo: () => void;
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  nodeTypeCounts: {},
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
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }],
        future: [],
        nodes: [
          ...state.nodes,
          { id: nextId, type, position, data: { label: displayLabel } },
        ],
        nodeTypeCounts: { ...state.nodeTypeCounts, [type]: nextCount },
      };
    }),

  setSelectedNode: (nodeId) =>
    set(() => ({ selectedNodeId: nodeId, selectedEdgeId: null })),

  setSelectedEdge: (edgeId) =>
    set(() => ({ selectedEdgeId: edgeId, selectedNodeId: null })),

  updateNodeConfig: (nodeId, config) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
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
