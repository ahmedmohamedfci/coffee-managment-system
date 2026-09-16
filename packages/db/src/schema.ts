import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("USD"),
  taxRate: doublePrecision("tax_rate").notNull().default(0.08),
  nextOrderNumber: integer("next_order_number").notNull().default(1000),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staff = pgTable(
  "staff",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffCode: text("staff_code").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    active: boolean("active").notNull().default(true),
    pin: text("pin").notNull(),
    isDefaultPin: boolean("is_default_pin").notNull().default(false),
  },
  (t) => [
    uniqueIndex("staff_tenant_code_uidx").on(t.tenantId, t.staffCode),
    index("staff_tenant_idx").on(t.tenantId),
  ],
);

export const floorSections = pgTable(
  "floor_sections",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (t) => [index("floor_sections_tenant_idx").on(t.tenantId)],
);

export const floorTables = pgTable(
  "floor_tables",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sectionId: text("section_id")
      .notNull()
      .references(() => floorSections.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    seats: integer("seats").notNull(),
    shape: text("shape").notNull(),
    x: doublePrecision("x").notNull(),
    y: doublePrecision("y").notNull(),
    status: text("status").notNull().default("empty"),
  },
  (t) => [index("floor_tables_tenant_idx").on(t.tenantId)],
);

export const floorFixtures = pgTable(
  "floor_fixtures",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sectionId: text("section_id")
      .notNull()
      .references(() => floorSections.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    label: text("label").notNull(),
    x: doublePrecision("x").notNull(),
    y: doublePrecision("y").notNull(),
    w: doublePrecision("w").notNull(),
    h: doublePrecision("h").notNull(),
  },
  (t) => [index("floor_fixtures_tenant_idx").on(t.tenantId)],
);

export const menuCategories = pgTable(
  "menu_categories",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    nameKey: text("name_key").notNull(),
    name: text("name"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("menu_categories_tenant_idx").on(t.tenantId)],
);

export const modifierGroups = pgTable(
  "modifier_groups",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    nameKey: text("name_key"),
    selection: text("selection").notNull().default("single"),
  },
  (t) => [index("modifier_groups_tenant_idx").on(t.tenantId)],
);

export const modifierOptions = pgTable(
  "modifier_options",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    groupId: text("group_id")
      .notNull()
      .references(() => modifierGroups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    nameKey: text("name_key"),
    priceDelta: doublePrecision("price_delta").notNull().default(0),
  },
  (t) => [index("modifier_options_tenant_idx").on(t.tenantId)],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    nameKey: text("name_key").notNull(),
    name: text("name").notNull(),
    basePrice: doublePrecision("base_price").notNull(),
    allergens: jsonb("allergens").$type<string[]>().notNull().default([]),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("menu_items_tenant_idx").on(t.tenantId)],
);

export const menuItemModifierGroups = pgTable(
  "menu_item_modifier_groups",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    menuItemId: text("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    modifierGroupId: text("modifier_group_id")
      .notNull()
      .references(() => modifierGroups.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("menu_item_mod_uidx").on(t.menuItemId, t.modifierGroupId),
    index("menu_item_mod_tenant_idx").on(t.tenantId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    tableId: text("table_id")
      .notNull()
      .references(() => floorTables.id),
    tableLabel: text("table_label").notNull(),
    waiterId: text("waiter_id")
      .notNull()
      .references(() => staff.id),
    waiterName: text("waiter_name").notNull(),
    status: text("status").notNull().default("open"),
    subtotal: doublePrecision("subtotal").notNull().default(0),
    taxRate: doublePrecision("tax_rate").notNull(),
    tax: doublePrecision("tax").notNull().default(0),
    total: doublePrecision("total").notNull().default(0),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("orders_tenant_number_uidx").on(t.tenantId, t.number),
    index("orders_tenant_idx").on(t.tenantId),
    index("orders_tenant_table_status_idx").on(t.tenantId, t.tableId, t.status),
  ],
);

export const orderLines = pgTable(
  "order_lines",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: text("menu_item_id").notNull(),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: doublePrecision("unit_price").notNull(),
    modifierLabels: jsonb("modifier_labels").$type<string[]>().notNull().default([]),
    kitchenNote: text("kitchen_note"),
    allergyNote: boolean("allergy_note").notNull().default(false),
    lineTotal: doublePrecision("line_total").notNull(),
  },
  (t) => [index("order_lines_tenant_order_idx").on(t.tenantId, t.orderId)],
);

export const kitchenTickets = pgTable(
  "kitchen_tickets",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    tableLabel: text("table_label").notNull(),
    waiterName: text("waiter_name").notNull(),
    status: text("status").notNull().default("pending"),
    lines: jsonb("lines")
      .$type<Array<{ qty: number; name: string; note?: string; allergy?: boolean }>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
  },
  (t) => [index("kitchen_tickets_tenant_idx").on(t.tenantId)],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    method: text("method").notNull(),
    amount: doublePrecision("amount").notNull(),
    txnId: text("txn_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payments_tenant_idx").on(t.tenantId)],
);

export const activityItems = pgTable(
  "activity_items",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    titleKey: text("title_key").notNull(),
    title: text("title"),
    actor: text("actor").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    tone: text("tone").notNull().default("info"),
  },
  (t) => [index("activity_items_tenant_idx").on(t.tenantId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    staffId: text("staff_id")
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_tenant_idx").on(t.tenantId)],
);
