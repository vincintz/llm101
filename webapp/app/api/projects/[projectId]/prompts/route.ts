import { db } from "@/server/db";
import { promptsTable } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const newPromptSchema = z.object({
  name: z.string().default("New Prompt"),
  prompt: z.string().default(""),
  order: z.number().default(0),
  tokenCount: z.number().default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;

    const json = await request.json();
    const parsedPrompt = newPromptSchema.safeParse(json);

    if (!parsedPrompt.success) {
      return NextResponse.json({ error: parsedPrompt.error }, { status: 400 });
    }

    const promptData = parsedPrompt.data;

    const [newPrompt] = await db
      .insert(promptsTable)
      .values({ ...promptData, projectId })
      .returning();

    return NextResponse.json(newPrompt);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
