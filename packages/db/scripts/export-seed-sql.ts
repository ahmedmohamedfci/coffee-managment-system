import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { alBaronSeed, testRestaurantSeed } from "../src/seed";

function lit(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (Array.isArray(v) || (typeof v === "object" && v !== null)) {
    return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

function insertRows(table: string, cols: string[], rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const lines = rows.map((row) => `  (${cols.map((c) => lit(row[c])).join(", ")})`);
  return `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")})\nVALUES\n${lines.join(",\n")};\n`;
}

function tenantToSql(seed: ReturnType<typeof alBaronSeed>) {
  const parts: string[] = [];
  parts.push(`-- Tenant: ${seed.tenant.slug}`);
  parts.push(
    insertRows(
      "tenants",
      ["id", "slug", "name", "currency", "tax_rate", "next_order_number"],
      [
        {
          id: seed.tenant.id,
          slug: seed.tenant.slug,
          name: seed.tenant.name,
          currency: seed.tenant.currency,
          tax_rate: seed.tenant.taxRate,
          next_order_number: seed.tenant.nextOrderNumber,
        },
      ],
    ),
  );
  parts.push(
    insertRows(
      "staff",
      ["id", "tenant_id", "staff_code", "name", "role", "active", "pin", "is_default_pin"],
      seed.staff.map((s) => ({
        id: s.id,
        tenant_id: s.tenantId,
        staff_code: s.staffCode,
        name: s.name,
        role: s.role,
        active: s.active,
        pin: s.pin,
        is_default_pin: s.isDefaultPin,
      })),
    ),
  );
  parts.push(
    insertRows(
      "floor_sections",
      ["id", "tenant_id", "name"],
      seed.sections.map((s) => ({ id: s.id, tenant_id: s.tenantId, name: s.name })),
    ),
  );
  if (seed.fixtures.length) {
    parts.push(
      insertRows(
        "floor_fixtures",
        ["id", "tenant_id", "section_id", "kind", "label", "x", "y", "w", "h"],
        seed.fixtures.map((f) => ({
          id: f.id,
          tenant_id: f.tenantId,
          section_id: f.sectionId,
          kind: f.kind,
          label: f.label,
          x: f.x,
          y: f.y,
          w: f.w,
          h: f.h,
        })),
      ),
    );
  }
  parts.push(
    insertRows(
      "floor_tables",
      ["id", "tenant_id", "section_id", "label", "seats", "shape", "x", "y", "status"],
      seed.tables.map((t) => ({
        id: t.id,
        tenant_id: t.tenantId,
        section_id: t.sectionId,
        label: t.label,
        seats: t.seats,
        shape: t.shape,
        x: t.x,
        y: t.y,
        status: t.status,
      })),
    ),
  );
  parts.push(
    insertRows(
      "menu_categories",
      ["id", "tenant_id", "name_key", "name", "sort_order"],
      seed.categories.map((c) => ({
        id: c.id,
        tenant_id: c.tenantId,
        name_key: c.nameKey,
        name: c.name ?? null,
        sort_order: c.sortOrder ?? 0,
      })),
    ),
  );
  parts.push(
    insertRows(
      "modifier_groups",
      ["id", "tenant_id", "name", "name_key", "selection"],
      seed.modifierGroups.map((g) => ({
        id: g.id,
        tenant_id: g.tenantId,
        name: g.name,
        name_key: g.nameKey ?? null,
        selection: g.selection ?? "single",
      })),
    ),
  );
  parts.push(
    insertRows(
      "modifier_options",
      ["id", "tenant_id", "group_id", "name", "name_key", "price_delta"],
      seed.modifierOptions.map((o) => ({
        id: o.id,
        tenant_id: o.tenantId,
        group_id: o.groupId,
        name: o.name,
        name_key: o.nameKey ?? null,
        price_delta: o.priceDelta ?? 0,
      })),
    ),
  );
  parts.push(
    insertRows(
      "menu_items",
      ["id", "tenant_id", "category_id", "name_key", "name", "base_price", "allergens", "active"],
      seed.menuItems.map((m) => ({
        id: m.id,
        tenant_id: m.tenantId,
        category_id: m.categoryId,
        name_key: m.nameKey,
        name: m.name,
        base_price: m.basePrice,
        allergens: m.allergens ?? [],
        active: m.active ?? true,
      })),
    ),
  );
  if (seed.itemMods.length) {
    parts.push(
      insertRows(
        "menu_item_modifier_groups",
        ["id", "tenant_id", "menu_item_id", "modifier_group_id"],
        seed.itemMods.map((im) => ({
          id: im.id,
          tenant_id: im.tenantId,
          menu_item_id: im.menuItemId,
          modifier_group_id: im.modifierGroupId,
        })),
      ),
    );
  }
  return parts.filter(Boolean).join("\n");
}

const out = [
  "-- Seed tenants: al-baron-pyramid-iv + test-restaurant-n1",
  "-- Applied once via schema_migrations (filename ledger).",
  "",
  "DELETE FROM tenants WHERE slug IN ('al-baron-pyramid-iv', 'test-restaurant-n1');",
  "",
  tenantToSql(alBaronSeed()),
  tenantToSql(testRestaurantSeed()),
].join("\n");

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "DB_UPDATES");
writeFileSync(join(dir, "002_seed.sql"), out + "\n", "utf8");
console.log(`Wrote ${join(dir, "002_seed.sql")}`);
