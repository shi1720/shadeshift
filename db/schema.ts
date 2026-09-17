import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const plans = sqliteTable(
  "plans",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    scenario: text("scenario").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [index("plans_owner_updated").on(t.owner, t.updatedAt)],
);
