import { and, eq, inArray } from "drizzle-orm";
import {
  menuCategories,
  menuItemModifierGroups,
  menuItems,
  modifierGroups,
  modifierOptions,
  tenants,
} from "@saasfood/db";
import type { Allergen, ModifierGroup } from "@saasfood/shared";
import { getDb } from "@/lib/db";
import { ApiError, uid } from "@/lib/api-helpers";

export async function listMenu(tenantId: string) {
  const db = getDb();
  const [categories, items, groups, options, links] = await Promise.all([
    db.select().from(menuCategories).where(eq(menuCategories.tenantId, tenantId)),
    db.select().from(menuItems).where(eq(menuItems.tenantId, tenantId)),
    db.select().from(modifierGroups).where(eq(modifierGroups.tenantId, tenantId)),
    db.select().from(modifierOptions).where(eq(modifierOptions.tenantId, tenantId)),
    db
      .select()
      .from(menuItemModifierGroups)
      .where(eq(menuItemModifierGroups.tenantId, tenantId)),
  ]);

  const linksByItem = new Map<string, string[]>();
  for (const link of links) {
    const arr = linksByItem.get(link.menuItemId) ?? [];
    arr.push(link.modifierGroupId);
    linksByItem.set(link.menuItemId, arr);
  }

  const optionsByGroup = new Map<string, typeof options>();
  for (const opt of options) {
    const arr = optionsByGroup.get(opt.groupId) ?? [];
    arr.push(opt);
    optionsByGroup.set(opt.groupId, arr);
  }

  return {
    categories: categories
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        id: c.id,
        nameKey: c.nameKey,
        name: c.name ?? undefined,
        sortOrder: c.sortOrder,
      })),
    items: items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      nameKey: item.nameKey,
      name: item.name,
      basePrice: item.basePrice,
      allergens: (item.allergens ?? []) as Allergen[],
      active: item.active,
      modifierGroupIds: linksByItem.get(item.id) ?? [],
    })),
    modifierGroups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      nameKey: g.nameKey ?? undefined,
      selection: g.selection as "single",
      options: (optionsByGroup.get(g.id) ?? []).map((o) => ({
        id: o.id,
        name: o.name,
        nameKey: o.nameKey ?? undefined,
        priceDelta: o.priceDelta,
      })),
    })),
  };
}

export type MenuItemInput = {
  categoryId: string;
  nameKey: string;
  name: string;
  basePrice: number;
  allergens?: Allergen[];
  active?: boolean;
  modifierGroupIds?: string[];
};

async function setItemModifierLinks(
  tenantId: string,
  menuItemId: string,
  modifierGroupIds: string[],
) {
  const db = getDb();
  await db
    .delete(menuItemModifierGroups)
    .where(
      and(
        eq(menuItemModifierGroups.tenantId, tenantId),
        eq(menuItemModifierGroups.menuItemId, menuItemId),
      ),
    );

  if (modifierGroupIds.length === 0) return;

  if (modifierGroupIds.length > 0) {
    const existing = await db
      .select({ id: modifierGroups.id })
      .from(modifierGroups)
      .where(
        and(
          eq(modifierGroups.tenantId, tenantId),
          inArray(modifierGroups.id, modifierGroupIds),
        ),
      );
    const valid = new Set(existing.map((g) => g.id));
    const rows = modifierGroupIds
      .filter((id) => valid.has(id))
      .map((modifierGroupId) => ({
        id: uid("mim"),
        tenantId,
        menuItemId,
        modifierGroupId,
      }));
    if (rows.length) await db.insert(menuItemModifierGroups).values(rows);
  }
}

export async function createMenuItem(tenantId: string, input: MenuItemInput) {
  const db = getDb();
  const [cat] = await db
    .select()
    .from(menuCategories)
    .where(
      and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.id, input.categoryId)),
    )
    .limit(1);
  if (!cat) throw new ApiError(400, "Category not found", "CATEGORY_NOT_FOUND");

  const id = uid("mi");
  const [row] = await db
    .insert(menuItems)
    .values({
      id,
      tenantId,
      categoryId: input.categoryId,
      nameKey: input.nameKey,
      name: input.name,
      basePrice: input.basePrice,
      allergens: input.allergens ?? [],
      active: input.active ?? true,
    })
    .returning();

  await setItemModifierLinks(tenantId, id, input.modifierGroupIds ?? []);

  return {
    id: row.id,
    categoryId: row.categoryId,
    nameKey: row.nameKey,
    name: row.name,
    basePrice: row.basePrice,
    allergens: (row.allergens ?? []) as Allergen[],
    active: row.active,
    modifierGroupIds: input.modifierGroupIds ?? [],
  };
}

export async function updateMenuItem(
  tenantId: string,
  itemId: string,
  input: Partial<MenuItemInput>,
) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.id, itemId)))
    .limit(1);
  if (!existing) throw new ApiError(404, "Menu item not found", "ITEM_NOT_FOUND");

  if (input.categoryId) {
    const [cat] = await db
      .select()
      .from(menuCategories)
      .where(
        and(eq(menuCategories.tenantId, tenantId), eq(menuCategories.id, input.categoryId)),
      )
      .limit(1);
    if (!cat) throw new ApiError(400, "Category not found", "CATEGORY_NOT_FOUND");
  }

  const [row] = await db
    .update(menuItems)
    .set({
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.nameKey !== undefined ? { nameKey: input.nameKey } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.basePrice !== undefined ? { basePrice: input.basePrice } : {}),
      ...(input.allergens !== undefined ? { allergens: input.allergens } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    })
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.id, itemId)))
    .returning();

  if (input.modifierGroupIds !== undefined) {
    await setItemModifierLinks(tenantId, itemId, input.modifierGroupIds);
  }

  const links = await db
    .select()
    .from(menuItemModifierGroups)
    .where(
      and(
        eq(menuItemModifierGroups.tenantId, tenantId),
        eq(menuItemModifierGroups.menuItemId, itemId),
      ),
    );

  return {
    id: row.id,
    categoryId: row.categoryId,
    nameKey: row.nameKey,
    name: row.name,
    basePrice: row.basePrice,
    allergens: (row.allergens ?? []) as Allergen[],
    active: row.active,
    modifierGroupIds: links.map((l) => l.modifierGroupId),
  };
}

export async function deleteMenuItem(tenantId: string, itemId: string) {
  const db = getDb();
  const deleted = await db
    .delete(menuItems)
    .where(and(eq(menuItems.tenantId, tenantId), eq(menuItems.id, itemId)))
    .returning({ id: menuItems.id });
  if (deleted.length === 0) {
    throw new ApiError(404, "Menu item not found", "ITEM_NOT_FOUND");
  }
  return { ok: true };
}

export async function saveModifierGroups(tenantId: string, groups: ModifierGroup[]) {
  const db = getDb();

  await db.transaction(async (tx) => {
    const existingLinks = await tx
      .select()
      .from(menuItemModifierGroups)
      .where(eq(menuItemModifierGroups.tenantId, tenantId));

    await tx.delete(modifierOptions).where(eq(modifierOptions.tenantId, tenantId));
    await tx.delete(modifierGroups).where(eq(modifierGroups.tenantId, tenantId));

    const keptGroupIds = new Set<string>();
    for (const g of groups) {
      const groupId = g.id || uid("mg");
      keptGroupIds.add(groupId);
      await tx.insert(modifierGroups).values({
        id: groupId,
        tenantId,
        name: g.name,
        nameKey: g.nameKey ?? null,
        selection: g.selection ?? "single",
      });
      for (const o of g.options ?? []) {
        await tx.insert(modifierOptions).values({
          id: o.id || uid("mo"),
          tenantId,
          groupId,
          name: o.name,
          nameKey: o.nameKey ?? null,
          priceDelta: o.priceDelta ?? 0,
        });
      }
    }

    const restore = existingLinks
      .filter((l) => keptGroupIds.has(l.modifierGroupId))
      .map((l) => ({
        id: uid("mim"),
        tenantId,
        menuItemId: l.menuItemId,
        modifierGroupId: l.modifierGroupId,
      }));
    if (restore.length) await tx.insert(menuItemModifierGroups).values(restore);
  });

  const menu = await listMenu(tenantId);
  return menu.modifierGroups;
}

export async function updateTenantSettings(
  tenantId: string,
  input: { name?: string; taxRate?: number },
) {
  if (input.taxRate !== undefined && (input.taxRate < 0 || input.taxRate > 1)) {
    throw new ApiError(400, "taxRate must be between 0 and 1", "INVALID_TAX");
  }

  const db = getDb();
  const [row] = await db
    .update(tenants)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.taxRate !== undefined ? { taxRate: input.taxRate } : {}),
    })
    .where(eq(tenants.id, tenantId))
    .returning();

  if (!row) throw new ApiError(404, "Tenant not found", "TENANT_NOT_FOUND");

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    currency: row.currency,
    taxRate: row.taxRate,
  };
}
