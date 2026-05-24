"use client";
import { useCallback, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, Panel, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { usePipelineStore } from "@/store/pipelineStore";
import DatasetNode from "./nodes/DatasetNode";
import PreprocessNode from "./nodes/PreprocessNode";
import ModelNode from "./nodes/ModelNode";
import TrainTestSplitNode from "./nodes/TrainTestSplitNode";
import TrashBin from "./TrashBin";

const nodeTypes = {
  dataset: DatasetNode,
  preprocess: PreprocessNode,
  model: ModelNode,
  train_test_split: TrainTestSplitNode,
};

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode, deleteNode, deleteEdge, onNodeDragStop } = usePipelineStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);
  const draggingNodeId = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const trashRef = useRef<HTMLDivElement>(null);

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
    addNode(type, position);
  }, [addNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    deleteNode(node.id);
  }, [deleteNode]);

  const onEdgeDoubleClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    deleteEdge(edge.id);
  }, [deleteEdge]);

  const handleNodeDragStart = useCallback((_: React.MouseEvent, node: Node) => {
    dragStartPosition.current = { x: node.position.x, y: node.position.y };
    draggingNodeId.current = node.id;
  }, []);

  const handleNodeDrag = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const nearBottom = e.clientY >= canvasBounds.bottom - canvasBounds.height * 0.3;
    setIsDragging(nearBottom);

    if (!trashRef.current || !nearBottom) {
      setIsOverTrash(false);
      return;
    }

    const trash = trashRef.current.getBoundingClientRect();
    const padding = 40;
    setIsOverTrash(
      e.clientX >= trash.left - padding &&
      e.clientX <= trash.right + padding &&
      e.clientY >= trash.top - padding &&
      e.clientY <= trash.bottom + padding
    );
  }, []);

  const handleNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    if (isOverTrash && draggingNodeId.current) {
      deleteNode(draggingNodeId.current);
    } else if (dragStartPosition.current) {
      onNodeDragStop(node, dragStartPosition.current);
    }
    dragStartPosition.current = null;
    draggingNodeId.current = null;
    setIsDragging(false);
    setIsOverTrash(false);
  }, [isOverTrash, deleteNode, onNodeDragStop]);

  return (
    <div ref={canvasRef} className="w-full h-full bg-[#0d0d0f]" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        minZoom={0.3}
        maxZoom={2}
        style={{ background: "#0d0d0f" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#2a2a35" />
        <Controls style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }} />
        <MiniMap style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, height: 100, width: 150 }} nodeColor="#444" maskColor="rgba(0,0,0,0.5)" />
        <Panel position="bottom-center">
          <TrashBin ref={trashRef} isDragging={isDragging} isOverTrash={isOverTrash} />
        </Panel>
      </ReactFlow>
    </div>
  );
}