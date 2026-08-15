"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/lib/store/workflow";
import { CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";

export default function LogsPanel() {
  const { logs, clearLogs } = useWorkflowStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-semibold">Execution Logs</span>
        {logs.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearLogs}>
            <Trash2 className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground p-3">No executions yet.</p>
        ) : (
          <div className="p-2 space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="rounded-lg border p-2 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{log.nodeLabel}</span>
                  {log.result === "YES" && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                  {log.result === "NO" && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                  {log.result === "ERROR" && <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                </div>
                <p className="text-muted-foreground line-clamp-2">{log.prompt}</p>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={log.result === "YES" ? "default" : log.result === "NO" ? "destructive" : "secondary"}
                    className="text-xs h-4"
                  >
                    {log.result}
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {log.error && <p className="text-yellow-600">{log.error}</p>}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
