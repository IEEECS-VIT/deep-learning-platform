"use client";
import { useCallback } from "react";
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { usePipelineStore } from "@/store/pipelineStore";
import DatasetNode from "./nodes/DatasetNode";
import PreprocessNode from "./nodes/PreprocessNode";
import ModelNode from "./nodes/ModelNode";
import TrainTestSplitNode from "./nodes/TrainTestSplitNode";

const nodeTypes = {
  dataset: DatasetNode,
  preprocess: PreprocessNode,
  model: ModelNode,
  train_test_split: TrainTestSplitNode,
};

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = usePipelineStore();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("nodeType");
    if (!type) return;
    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = { x: e.clientX - bounds.left - 80, y: e.clientY - bounds.top - 40 };
    addNode({ id: `${type}-${Date.now()}`, type, position, data: { label: type } });
  }, [addNode]);

  return (
    <div style={{ width: "100%", height: "100%" }} onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        
        minZoom={0.3}
        maxZoom={2}
        style={{ background: "#0d0d0f" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#2a2a35" style={{ background: "#0d0d0f" }} />
        <Controls style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }} />
        <MiniMap style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, height: 100, width: 150 }} nodeColor="#444" maskColor="rgba(0,0,0,0.5)" />
      </ReactFlow>
    </div>
  );
}