"server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { Project, projectTable, Template, templatesTable } from "./db/schema";

export function getProjectsForUser(): Promise<Project[]> {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const projects = db.query.projectTable.findMany({
    where: eq(projectTable.userId, userId),
    orderBy: (projects, {desc}) => [desc(projects.updatedAt)],
  });

  return projects;
}

export async function getProject(projectId: string) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const project = await db.query.projectTable.findFirst({
    where: (project, { eq, and }) =>
      and (eq(project.id, projectId), eq(project.userId, userId)),
  });

  return project;
}

export async function getTemplatesForUser(): Promise<Template[]> {
  // Figure out who the user is
  const { userId } = auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch templates from database
  const templates = await db.query.templatesTable.findMany({
    where: eq(templatesTable.userId, userId),
    orderBy: (templates, { desc }) => [desc(templates.updatedAt)],
  });

  return templates;
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  // Figure out who the user is
  const { userId } = auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  const template = await db.query.templatesTable.findFirst({
    where: (template, { eq, and }) =>
      and(eq(template.id, id), eq(template.userId, userId)),
  });

  return template;
}
