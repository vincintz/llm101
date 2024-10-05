import { db } from "@/server/db";
import { projectTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from 'zod';

const updateProjectSchema = z.object({
  title: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: {projectId: string} },
) {
  console.log("Updating>", params)
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, {status: 401});
  }
  const body = await request.json();
  const validatedData = updateProjectSchema.safeParse(body);
  if (!validatedData.success) {
    return NextResponse.json(
      { error: validatedData.error.errors },
      { status: 400 },
    );
  }
  const { title } = validatedData.data;

  console.log("Updating>", title, userId)
  const updatedProject = await db.update(projectTable).set({
    title,
  }).where(
    and(
      eq(projectTable.userId, userId),
      eq(projectTable.id, params.projectId),
    )
  )
  .returning();

  if (updatedProject.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 204 });
  }

  return NextResponse.json(updatedProject[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deletedProject = await db
    .delete(projectTable)
    .where(
      and(
        eq(projectTable.userId, userId),
        eq(projectTable.id, params.projectId)
      )
    )
    .returning();

  if (deletedProject.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(deletedProject[0]);
}
