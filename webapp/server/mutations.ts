"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { projectTable } from "./db/schema";

export async function createProject() {
  const { userId } = auth();

  if (!userId) {
    throw Error("User not found");
  }

  await db
    .insert(projectTable)
    .values({
      title: "New Project",
      userId,
    })
    .returning();

}
