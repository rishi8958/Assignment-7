import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { workflowFunction } from "@/inngest/workflow";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [workflowFunction],
});
