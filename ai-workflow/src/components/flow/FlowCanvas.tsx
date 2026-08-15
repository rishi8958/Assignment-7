"use client";
import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/lib/store/workflow";
import DecisionNode from "./DecisionNode";
import YesNoEdge from "./YesNoEdge";
import Toolbar from "./Toolbar";
import LogsPanel from "./LogsPanel";
import type { WorkflowNodeData } from "@/lib/types";

const nodeTypes = { decisionNode: DecisionNode };
const edgeTypes = { yesNoEdge: YesNoEdge };

function Flow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useWorkflowStore();

  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode(position);
    },
    [screenToFlowPosition, addNode]
  );

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: n.data as WorkflowNodeData,
      })),
    [nodes]
  );

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col shrink-0">
        <div className="p-3 border-b">
          <h1 className="font-bold text-sm">AI Workflow</h1>
          <p className="text-xs text-muted-foreground">Visual decision engine</p>
        </div>
        <Toolbar />
        <div className="flex-1 border-t overflow-hidden">
          <LogsPanel />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
        <ReactFlow
          nodes={styledNodes as Node[]}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          deleteKeyCode="Delete"
        >
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
