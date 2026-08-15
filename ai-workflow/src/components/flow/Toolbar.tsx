"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore } from "@/lib/store/workflow";
import ImportExport from "./ImportExport";
import { Play, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { ExecutionLog } from "@/lib/types";

export default function Toolbar() {
  const {
    nodes,
    edges,
    addNode,
    isRunning,
    setIsRunning,
    context,
    setContext,
    setNodeStatus,
    resetNodeStatuses,
    addLog,
    clearLogs,
  } = useWorkflowStore();

  const [startNodeId, setStartNodeId] = useState<string>("");

  const effectiveStart = startNodeId || nodes[0]?.id;

  const runWorkflow = async () => {
    if (!effectiveStart) return toast.error("Add at least one node");
    if (isRunning) return;

    resetNodeStatuses();
    clearLogs();
    setIsRunning(true);

    // Mark start node as running
    setNodeStatus(effectiveStart, "running");

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges, startNodeId: effectiveStart, context }),
      });

      if (!res.ok) throw new Error("Failed to start workflow");

      // Poll Inngest dev server for results
      const { eventId } = await res.json();
      toast.info("Workflow started, polling for results...");

      // Simulate step-by-step execution locally for visual feedback
      await simulateExecution(effectiveStart);
    } catch (err) {
      toast.error("Workflow failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsRunning(false);
    }
  };

  // Local simulation that mirrors Inngest execution for visual feedback
  const simulateExecution = async (startId: string) => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    let currentId: string | null = startId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const node = nodeMap.get(currentId);
      if (!node) break;

      setNodeStatus(currentId, "running");
      await new Promise((r) => setTimeout(r, 400));

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: node.data.prompt, context }),
        });

        const { result, error } = await res.json();

        if (result === "YES" || result === "NO") {
          setNodeStatus(currentId, result === "YES" ? "yes" : "no", result);
          const log: ExecutionLog = {
            nodeId: currentId,
            nodeLabel: node.data.label,
            prompt: node.data.prompt,
            result,
            timestamp: Date.now(),
          };
          addLog(log);

          const nextEdge = edges.find(
            (e) =>
              e.source === currentId &&
              ((e.data as { label?: string } | undefined)?.label === result || e.label === result)
          );
          currentId = nextEdge ? (nextEdge.target as string) : null;
        } else {
          setNodeStatus(currentId, "error", undefined, error || "AI error");
          addLog({
            nodeId: currentId,
            nodeLabel: node.data.label,
            prompt: node.data.prompt,
            result: "ERROR",
            timestamp: Date.now(),
            error: error || "AI error",
          });
          break;
        }
      } catch {
        if (currentId) setNodeStatus(currentId, "error", undefined, "Network error");
        break;
      }
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Context (optional)</label>
        <Textarea
          className="text-xs min-h-[60px] resize-none"
          placeholder="e.g. User message: I need help with my bill"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Start Node</label>
        <select
          className="w-full text-xs border rounded-md px-2 py-1.5 bg-background"
          value={startNodeId}
          onChange={(e) => setStartNodeId(e.target.value)}
        >
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.data.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-1">
        <Button
          className="flex-1 h-8 text-xs"
          onClick={runWorkflow}
          disabled={isRunning}
        >
          <Play className="w-3 h-3 mr-1" />
          {isRunning ? "Running..." : "Run"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => { resetNodeStatuses(); clearLogs(); }}
          disabled={isRunning}
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full h-8 text-xs"
        onClick={() => addNode({ x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 })}
      >
        <Plus className="w-3 h-3 mr-1" /> Add Node
      </Button>

      <ImportExport />
    </div>
  );
}
