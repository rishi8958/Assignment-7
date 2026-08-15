"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/lib/store/workflow";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";
import type { WorkflowNodeData } from "@/lib/types";

export default function ImportExport() {
  const { nodes, edges, loadWorkflow } = useWorkflowStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const exportWorkflow = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Workflow exported");
  };

  const importWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { nodes: n, edges: ed } = JSON.parse(ev.target?.result as string);
        loadWorkflow(
          (n as Node<WorkflowNodeData>[]).map((node) => ({
            ...node,
            data: { ...node.data, status: "idle" as const },
          })),
          ed as Edge[]
        );
        toast.success("Workflow imported");
      } catch {
        toast.error("Invalid workflow file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex gap-1">
      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportWorkflow}>
        <Download className="w-3 h-3 mr-1" /> Export
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => inputRef.current?.click()}>
        <Upload className="w-3 h-3 mr-1" /> Import
      </Button>
      <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={importWorkflow} />
    </div>
  );
}
