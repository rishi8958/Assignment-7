import { inngest } from "./client";
import OpenAI from "openai";
import type { WorkflowNodeData } from "@/lib/types";
import type { Node, Edge } from "@xyflow/react";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type LogEntry = {
  nodeId: string;
  nodeLabel: string;
  prompt: string;
  result: string;
  timestamp: number;
  error?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const workflowFunction = (inngest as any).createFunction(
  { id: "run-workflow", name: "Run AI Workflow", retries: 2, triggers: [{ event: "workflow/run" }] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: { event: any; step: any }) => {
    const { nodes, edges, startNodeId, context } = event.data as {
      nodes: Node<WorkflowNodeData>[];
      edges: Edge[];
      startNodeId: string;
      context: string;
    };

    const logs: LogEntry[] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    let currentNodeId: string | null = startNodeId;
    const visited = new Set<string>();

    while (currentNodeId) {
      if (visited.has(currentNodeId)) break;
      visited.add(currentNodeId);

      const node = nodeMap.get(currentNodeId);
      if (!node) break;

      const nodeId: string = currentNodeId;
      const result: string = await step.run(`node-${nodeId}`, async () => {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a decision engine. Answer ONLY with YES or NO. No punctuation, no explanation.",
              },
              {
                role: "user",
                content: context
                  ? `Context: ${context}\n\nQuestion: ${node.data.prompt}`
                  : node.data.prompt,
              },
            ],
            max_tokens: 5,
            temperature: 0,
          });
          const answer = response.choices[0].message.content?.trim().toUpperCase();
          return answer === "YES" ? "YES" : "NO";
        } catch {
          return "ERROR";
        }
      });

      logs.push({
        nodeId,
        nodeLabel: node.data.label,
        prompt: node.data.prompt,
        result,
        timestamp: Date.now(),
      });

      if (result === "ERROR") break;

      const outgoingEdges: Edge[] = edges.filter((e: Edge) => e.source === nodeId);
      const nextEdge: Edge | undefined = outgoingEdges.find(
        (e: Edge) =>
          (e.data as { label?: string } | undefined)?.label === result ||
          e.label === result
      );
      currentNodeId = nextEdge ? (nextEdge.target as string) : null;
    }

    return { logs };
  }
);
