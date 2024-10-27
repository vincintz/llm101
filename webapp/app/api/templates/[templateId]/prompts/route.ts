import { db } from "@/server/db";
import { templatePromptsTable } from "@/server/db/schema";
import { getPromptTokenCount } from "@/utils/token-helper";
import { getAuth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const newPromptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  prompt: z.string().optional(),
  order: z.number().int().nonnegative(),
});

const updatePromptSchema = newPromptSchema.extend({
  id: z.string().uuid(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const prompts = await db.query.templatePromptsTable.findMany({
      where: eq(templatePromptsTable.templateId, params.templateId),
      orderBy: templatePromptsTable.order,
    });
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts", error);
    return NextResponse.json(
      { error: "Error fetching prompts" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templateId = params.templateId;

  try {
    const json = await req.json();

    const parseResult = newPromptSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors },
        { status: 400 }
      );
    }
    const { name, order, prompt } = parseResult.data;

    // Calculate token count
    const tokenCount = getPromptTokenCount(prompt || "");

    const newPrompt = await db
      .insert(templatePromptsTable)
      .values({
        templateId,
        name,
        prompt,
        order,
        tokenCount: tokenCount,
      })
      .returning();

    return NextResponse.json(newPrompt[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to create template prompt:", error);
    return NextResponse.json(
      { error: "Failed to create template prompt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const promptId = searchParams.get("id");

  if (!promptId) {
    return NextResponse.json(
      { error: "Prompt ID is required" },
      { status: 400 }
    );
  }

  try {
    const deletedPrompt = await db
      .delete(templatePromptsTable)
      .where(
        and(
          eq(templatePromptsTable.id, promptId),
          eq(templatePromptsTable.templateId, params.templateId)
        )
      )
      .returning();

    if (deletedPrompt.length === 0) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Failed to delete template prompt:", error);
    return NextResponse.json(
      { error: "Failed to delete template prompt" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templateId = params.templateId;

  try {
    const json = await req.json();
    const prompt = updatePromptSchema.parse(json);

    const { id, name, prompt: promptText, order } = prompt;

    // Calculate token count
    const tokenCount = getPromptTokenCount(promptText || "");

    const updatedPrompt = await db
      .update(templatePromptsTable)
      .set({
        name,
        prompt: promptText,
        order,
        tokenCount: tokenCount,
      })
      .where(
        and(
          eq(templatePromptsTable.id, id),
          eq(templatePromptsTable.templateId, templateId)
        )
      )
      .returning();

    if (updatedPrompt.length === 0) {
      return NextResponse.json(
        { error: `Prompt with id ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPrompt[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to update template prompt:", error);
    return NextResponse.json(
      { error: "Failed to update template prompt" },
      { status: 500 }
    );
  }
}
