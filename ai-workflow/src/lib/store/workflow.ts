import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import type { WorkflowNodeData, ExecutionLog, NodeStatus } from "@/lib/types";

interface WorkflowStore {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  logs: ExecutionLog[];
  isRunning: boolean;
  context: string;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  setNodeStatus: (id: string, status: NodeStatus, result?: "YES" | "NO", error?: string) => void;
  resetNodeStatuses: () => void;
  addLog: (log: ExecutionLog) => void;
  clearLogs: () => void;
  setIsRunning: (v: boolean) => void;
  setContext: (v: string) => void;
  loadWorkflow: (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
}

const defaultNodes: Node<WorkflowNodeData>[] = [
  {
    id: "1",
    type: "decisionNode",
    position: { x: 250, y: 100 },
    data: { label: "Support Request?", prompt: "Is this a support request?", status: "idle" },
  },
  {
    id: "2",
    type: "decisionNode",
    position: { x: 100, y: 280 },
    data: { label: "Support Node", prompt: "Is this a billing issue?", status: "idle" },
  },
  {
    id: "3",
    type: "decisionNode",
    position: { x: 400, y: 280 },
    data: { label: "Sales Node", prompt: "Is this a new customer inquiry?", status: "idle" },
  },
];

const defaultEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", label: "YES", data: { label: "YES" }, type: "yesNoEdge" },
  { id: "e1-3", source: "1", target: "3", label: "NO", data: { label: "NO" }, type: "yesNoEdge" },
];

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set) => ({
      nodes: defaultNodes,
      edges: defaultEdges,
      logs: [],
      isRunning: false,
      context: "",

      onNodesChange: (changes) =>
        set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as Node<WorkflowNodeData>[] })),

      onEdgesChange: (changes) =>
        set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

      onConnect: (connection) =>
        set((s) => ({
          edges: addEdge(
            { ...connection, type: "yesNoEdge", label: "YES", data: { label: "YES" } },
            s.edges
          ),
        })),

      addNode: (position = { x: 200, y: 200 }) =>
        set((s) => ({
          nodes: [
            ...s.nodes,
            {
              id: uuidv4(),
              type: "decisionNode",
              position,
              data: { label: "New Node", prompt: "Enter your yes/no question here", status: "idle" },
            },
          ],
        })),

      updateNodeData: (id, data) =>
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        })),

      setNodeStatus: (id, status, result, error) =>
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, status, result, error } } : n
          ),
        })),

      resetNodeStatuses: () =>
        set((s) => ({
          nodes: s.nodes.map((n) => ({
            ...n,
            data: { ...n.data, status: "idle" as NodeStatus, result: undefined, error: undefined },
          })),
        })),

      addLog: (log) => set((s) => ({ logs: [...s.logs, log] })),
      clearLogs: () => set({ logs: [] }),
      setIsRunning: (v) => set({ isRunning: v }),
      setContext: (v) => set({ context: v }),
      loadWorkflow: (nodes, edges) => set({ nodes, edges }),
    }),
    {
      name: "ai-workflow-storage",
      partialize: (s) => ({ nodes: s.nodes, edges: s.edges }),
    }
  )
);
