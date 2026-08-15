"use client";
import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore } from "@/lib/store/workflow";
import type { WorkflowNodeData } from "@/lib/types";
import { CheckCircle, XCircle, Loader2, AlertCircle, Pencil, Trash2 } from "lucide-react";

const statusStyles: Record<string, string> = {
  idle: "border-border bg-card",
  running: "border-blue-400 bg-blue-50 dark:bg-blue-950 animate-pulse",
  yes: "border-green-400 bg-green-50 dark:bg-green-950",
  no: "border-red-400 bg-red-50 dark:bg-red-950",
  error: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "running") return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
  if (status === "yes") return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === "no") return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === "error") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  return null;
};

function DecisionNode({ id, data, selected }: NodeProps) {
  const nodeData = data as WorkflowNodeData;
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(nodeData.label);
  const [prompt, setPrompt] = useState(nodeData.prompt);
  const { updateNodeData, onNodesChange } = useWorkflowStore();

  const save = () => {
    updateNodeData(id, { label, prompt });
    setEditing(false);
  };

  const deleteNode = () => {
    onNodesChange([{ type: "remove", id }]);
  };

  return (
    <div
      className={`rounded-xl border-2 shadow-md w-56 transition-all ${statusStyles[nodeData.status]} ${selected ? "ring-2 ring-primary" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          {editing ? (
            <input
              className="text-sm font-semibold bg-transparent border-b border-border outline-none w-full"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
          ) : (
            <span className="text-sm font-semibold truncate">{nodeData.label}</span>
          )}
          <div className="flex gap-1 ml-1 shrink-0">
            <StatusIcon status={nodeData.status} />
            {!editing && (
              <>
                <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={deleteNode} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              className="text-xs min-h-[60px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Yes/No question..."
            />
            <div className="flex gap-1">
              <Button size="sm" className="h-6 text-xs flex-1" onClick={save}>Save</Button>
              <Button size="sm" variant="outline" className="h-6 text-xs flex-1" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground line-clamp-2">{nodeData.prompt}</p>
        )}

        {nodeData.result && (
          <Badge
            className="mt-2 text-xs"
            variant={nodeData.result === "YES" ? "default" : "destructive"}
          >
            {nodeData.result}
          </Badge>
        )}
        {nodeData.error && (
          <p className="text-xs text-yellow-600 mt-1 truncate">{nodeData.error}</p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "30%" }}
        className="!bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "70%" }}
        className="!bg-red-500"
      />
    </div>
  );
}

export default memo(DecisionNode);
