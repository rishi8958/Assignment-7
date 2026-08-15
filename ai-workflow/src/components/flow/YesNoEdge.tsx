"use client";
import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";
import { useWorkflowStore } from "@/lib/store/workflow";

function YesNoEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as { label?: string } | undefined;
  const label = edgeData?.label ?? "YES";
  const isYes = label === "YES";
  const isActive = (data as { active?: boolean } | undefined)?.active;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { onEdgesChange } = useWorkflowStore();
  const { getEdges } = useReactFlow();

  const toggleLabel = () => {
    const edges = getEdges();
    const edge = edges.find((e) => e.id === id);
    if (!edge) return;
    const newLabel = label === "YES" ? "NO" : "YES";
    onEdgesChange([
      {
        type: "replace",
        id,
        item: { ...edge, data: { ...edge.data, label: newLabel } },
      },
    ]);
  };

  const deleteEdge = () => onEdgesChange([{ type: "remove", id }]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: isYes ? "#22c55e" : "#ef4444",
          strokeWidth: isActive ? 3 : selected ? 2.5 : 1.5,
          strokeDasharray: isActive ? "6 3" : undefined,
          animation: isActive ? "dashdraw 0.5s linear infinite" : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1"
        >
          <button
            onClick={toggleLabel}
            className={`text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm transition-colors ${
              isYes
                ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
            }`}
          >
            {label}
          </button>
          {selected && (
            <button
              onClick={deleteEdge}
              className="text-xs text-muted-foreground hover:text-destructive bg-background border rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(YesNoEdge);
