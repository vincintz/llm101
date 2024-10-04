import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const projectTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: varchar("user_id", { length: 50 }).notNull(),
});

export type InsertProject = typeof projectTable.$inferInsert;
export type Project = typeof projectTable.$inferSelect;
