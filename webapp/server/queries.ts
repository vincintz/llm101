"server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { Project, projectTable } from "./db/schema";

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
