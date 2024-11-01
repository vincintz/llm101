"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { projectsTable, templatesTable } from "./db/schema";
import { redirect } from "next/navigation";

export async function createProject() {
  const { userId } = auth();

  if (!userId) {
    throw Error("User not found");
  }

  const [newProject] = await db
    .insert(projectsTable)
    .values({
      title: "New Project",
      userId,
    })
    .returning();

  redirect(`/project/${newProject.id}`);
}

export async function createTemplate() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not found");
  }

  const [newTemplate] = await db
    .insert(templatesTable)
    .values({ title: "New Template", userId })
    .returning();

  redirect(`/template/${newTemplate.id}`);
}
