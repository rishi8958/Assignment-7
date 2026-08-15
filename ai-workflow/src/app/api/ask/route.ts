import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt, context } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

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
          content: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt,
        },
      ],
      max_tokens: 5,
      temperature: 0,
    });

    const answer = response.choices[0].message.content?.trim().toUpperCase();
    const result = answer === "YES" ? "YES" : "NO";
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI error";
    return NextResponse.json({ result: "ERROR", error: message }, { status: 500 });
  }
}
