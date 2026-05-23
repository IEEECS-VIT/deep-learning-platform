import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, Connection, NodeChange, EdgeChange } from "@xyflow/react";

interface PipelineStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  nodeTypeCounts: Record<string, number>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  setSelectedNode: (nodeId: string | null) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  nodeTypeCounts: {},

  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set((state) => ({ edges: addEdge(connection, state.edges) })),

  addNode: (type, position) =>
    set((state) => {
      const nextCount = (state.nodeTypeCounts[type] ?? 0) + 1;
      const displayLabel = `${type}-${nextCount}`;
      const nextId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `node-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      return {
        nodes: [...state.nodes, { id: nextId, type, position, data: { label: displayLabel } }],
        nodeTypeCounts: { ...state.nodeTypeCounts, [type]: nextCount },
      };
    }),

  setSelectedNode: (nodeId) => set(() => ({ selectedNodeId: nodeId })),

  updateNodeConfig: (nodeId, config) =>
    set((state) => ({nodes: state.nodes.map((node) => node.id === nodeId ? {...node, data: {...node.data,config: {...(((node.data as Record<string, unknown>).config as Record<string, unknown>) ?? {}), ...config,},},} : node),})),
}));