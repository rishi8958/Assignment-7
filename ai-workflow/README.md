# AI Workflow

A visual AI workflow system where each node represents an AI decision step that returns **YES** or **NO**. Built with Next.js, React Flow, Inngest, and OpenAI.

## Features

- 🎨 **Visual flow editor** — drag, connect, and edit nodes on a React Flow canvas
- 🤖 **AI-powered branching** — each node sends its prompt to GPT-4o-mini and routes YES/NO
- ⚡ **Inngest execution** — workflow steps run as durable Inngest functions
- 📋 **Execution logs panel** — real-time log of each node's result
- 💾 **Save/load workflows** — persisted to localStorage automatically
- 📤 **JSON export/import** — share workflows as `.json` files
- 🎯 **Visual execution state** — nodes animate and color-code during execution
- 🔁 **Animated active edges** — edges animate as execution flows through them

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Add your OPENAI_API_KEY
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Start Inngest dev server** (in a separate terminal)
   ```bash
   npx inngest-cli@latest dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Add nodes** — click "Add Node" or drag onto the canvas
2. **Edit nodes** — click the pencil icon on any node to edit its label and prompt
3. **Connect nodes** — drag from the green (YES) or red (NO) handle at the bottom of a node to another node's top handle
4. **Toggle edge labels** — click the YES/NO badge on any edge to toggle between YES and NO
5. **Set context** — add optional context (e.g. a user message) in the sidebar
6. **Run** — select a start node and click Run

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── ask/route.ts       # Direct OpenAI call for visual feedback
│   │   ├── run/route.ts       # Triggers Inngest workflow event
│   │   └── inngest/route.ts   # Inngest serve handler
│   └── page.tsx
├── components/flow/
│   ├── FlowCanvas.tsx         # Main React Flow canvas
│   ├── DecisionNode.tsx       # Custom YES/NO decision node
│   ├── YesNoEdge.tsx          # Custom labeled edge
│   ├── Toolbar.tsx            # Run controls + context input
│   ├── LogsPanel.tsx          # Execution logs
│   └── ImportExport.tsx       # JSON import/export
├── inngest/
│   ├── client.ts              # Inngest client
│   └── workflow.ts            # Inngest workflow function
└── lib/
    ├── store/workflow.ts      # Zustand store
    └── types.ts               # Shared types
```
