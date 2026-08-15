export type NodeStatus = "idle" | "running" | "yes" | "no" | "error";

export interface WorkflowNodeData {
  label: string;
  prompt: string;
  status: NodeStatus;
  result?: "YES" | "NO";
  error?: string;
  [key: string]: unknown;
}

export interface ExecutionLog {
  nodeId: string;
  nodeLabel: string;
  prompt: string;
  result: "YES" | "NO" | "ERROR";
  timestamp: number;
  error?: string;
}

export interface WorkflowState {
  nodes: import("@xyflow/react").Node<WorkflowNodeData>[];
  edges: import("@xyflow/react").Edge[];
}
