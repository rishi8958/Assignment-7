import { inngest } from "@/inngest/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { nodes, edges, startNodeId, context } = await req.json();

  if (!startNodeId) {
    return NextResponse.json({ error: "startNodeId is required" }, { status: 400 });
  }

  const { ids } = await inngest.send({
    name: "workflow/run",
    data: { nodes, edges, startNodeId, context: context || "" },
  });

  return NextResponse.json({ eventId: ids[0] });
}
