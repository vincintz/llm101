import { relations } from 'drizzle-orm';
import { bigint, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';


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

export const assetTable = pgTable("asset", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references( () => projectTable.id, {
      onDelete: "cascade",
    } ),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  content: text("content").default(""),
  tokenCount: integer("token_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const assetProcessingJobTable = pgTable("asset_processing_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .notNull()
    .unique()
    .references(() => assetTable.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectTable.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  attempts: integer("attempts").notNull().default(0),
  lastHeartBeat: timestamp("last_heart_beat").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const assetRelations = relations(assetTable, ({one}) => ({
  project: one(projectTable, {
    fields: [assetTable.projectId],
    references: [projectTable.id],
  }),
}));

export const projectRelations = relations(projectTable, ({many}) => ({
  asset: many(assetTable),
}));

export const assetProcessingJobRelations = relations(
  assetProcessingJobTable,
  ({one}) => ({
    asset: one(assetTable, {
      fields: [assetProcessingJobTable.assetId],
      references: [assetTable.id],
    }),
    project: one(projectTable, {
      fields: [assetProcessingJobTable.projectId],
      references: [projectTable.id],
    }),
  }),
);

// Types
export type InsertProject = typeof projectTable.$inferInsert;
export type Project = typeof projectTable.$inferSelect;
export type InsertAsset = typeof assetTable.$inferInsert;
export type Asset = typeof assetTable.$inferSelect;
export type InsertAssetProcessingJob = typeof assetProcessingJobTable.$inferInsert;
export type AssetProcessingJob = typeof assetProcessingJobTable.$inferSelect;

