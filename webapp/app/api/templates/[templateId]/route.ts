import { db } from "@/server/db";
import { templatePromptsTable, templatesTable } from "@/server/db/schema";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templateId = params.templateId;

  try {
    const { title } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updatedTemplate = await db
      .update(templatesTable)
      .set({ title })
      .where(
        and(
          eq(templatesTable.id, templateId),
          eq(templatesTable.userId, userId)
        )
      )
      .returning();

    if (updatedTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error("Error updating template", error);
    return NextResponse.json(
      { error: "Failed to update template" },
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
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templateId = params.templateId;

  try {
    const deletedTemplate = await db
      .delete(templatesTable)
      .where(
        and(
          eq(templatesTable.id, templateId),
          eq(templatesTable.userId, userId)
        )
      )
      .returning();

    if (deletedTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedTemplate[0]);
  } catch (error) {
    console.error("Error deleting template", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
