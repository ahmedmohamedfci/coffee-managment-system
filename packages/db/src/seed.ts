import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DEFAULT_URL = "postgres://saasfood:saasfood@localhost:5432/saasfood";

const SEED_SLUGS = ["al-baron-pyramid-iv", "test-restaurant-n1"] as const;

type Db = ReturnType<typeof drizzle<typeof schema>>;

type TenantSeed = {
  tenant: typeof schema.tenants.$inferInsert;
  staff: (typeof schema.staff.$inferInsert)[];
  sections: (typeof schema.floorSections.$inferInsert)[];
  tables: (typeof schema.floorTables.$inferInsert)[];
  fixtures: (typeof schema.floorFixtures.$inferInsert)[];
  categories: (typeof schema.menuCategories.$inferInsert)[];
  modifierGroups: (typeof schema.modifierGroups.$inferInsert)[];
  modifierOptions: (typeof schema.modifierOptions.$inferInsert)[];
  menuItems: (typeof schema.menuItems.$inferInsert)[];
  itemMods: (typeof schema.menuItemModifierGroups.$inferInsert)[];
};

function alBaronSeed(): TenantSeed {
  const tenantId = "ten_al_baron";
  return {
    tenant: {
      id: tenantId,
      slug: "al-baron-pyramid-iv",
      name: "AL BARON PYRAMID IV",
      currency: "EGP",
      taxRate: 0.14,
      nextOrderNumber: 5001,
    },
    staff: [
      {
        id: "ab_s_admin",
        tenantId,
        staffCode: "101",
        name: "Hassan Farouk",
        role: "admin",
        active: true,
        pin: "1234",
        isDefaultPin: false,
      },
      {
        id: "ab_s_waiter",
        tenantId,
        staffCode: "104",
        name: "Nour El-Sayed",
        role: "waiter",
        active: true,
        pin: "2222",
        isDefaultPin: false,
      },
      {
        id: "ab_s_kitchen",
        tenantId,
        staffCode: "201",
        name: "Chef Amira",
        role: "kitchen",
        active: true,
        pin: "0000",
        isDefaultPin: true,
      },
      {
        id: "ab_s_waiter2",
        tenantId,
        staffCode: "105",
        name: "Omar Khalil",
        role: "waiter",
        active: true,
        pin: "5555",
        isDefaultPin: false,
      },
    ],
    sections: [
      { id: "ab_sec_grill", tenantId, name: "Grill Hall" },
      { id: "ab_sec_terrace", tenantId, name: "Pyramid Terrace" },
      { id: "ab_sec_shisha", tenantId, name: "Shisha Lounge" },
    ],
    fixtures: [
      {
        id: "ab_fx_ent",
        tenantId,
        sectionId: "ab_sec_grill",
        kind: "entrance",
        label: "Lobby",
        x: 4,
        y: 88,
        w: 20,
        h: 8,
      },
      {
        id: "ab_fx_grill",
        tenantId,
        sectionId: "ab_sec_grill",
        kind: "kitchen",
        label: "Open grill",
        x: 78,
        y: 12,
        w: 18,
        h: 40,
      },
      {
        id: "ab_fx_bar",
        tenantId,
        sectionId: "ab_sec_shisha",
        kind: "bar",
        label: "Hookah bar",
        x: 6,
        y: 20,
        w: 16,
        h: 50,
      },
    ],
    tables: [
      {
        id: "ab_t1",
        tenantId,
        sectionId: "ab_sec_grill",
        label: "Grill 1",
        seats: 4,
        shape: "rect",
        x: 12,
        y: 20,
        status: "empty",
      },
      {
        id: "ab_t2",
        tenantId,
        sectionId: "ab_sec_grill",
        label: "Grill 2",
        seats: 4,
        shape: "rect",
        x: 32,
        y: 20,
        status: "occupied",
      },
      {
        id: "ab_t3",
        tenantId,
        sectionId: "ab_sec_grill",
        label: "Family 8",
        seats: 8,
        shape: "large",
        x: 20,
        y: 48,
        status: "empty",
      },
      {
        id: "ab_t4",
        tenantId,
        sectionId: "ab_sec_terrace",
        label: "Terrace A",
        seats: 2,
        shape: "round",
        x: 14,
        y: 24,
        status: "reserved",
      },
      {
        id: "ab_t5",
        tenantId,
        sectionId: "ab_sec_terrace",
        label: "Terrace B",
        seats: 6,
        shape: "rect",
        x: 40,
        y: 30,
        status: "empty",
      },
      {
        id: "ab_t6",
        tenantId,
        sectionId: "ab_sec_shisha",
        label: "Lounge 1",
        seats: 4,
        shape: "round",
        x: 36,
        y: 28,
        status: "occupied",
      },
    ],
    categories: [
      { id: "ab_c_mezze", tenantId, nameKey: "menu.cat.mezze", name: "Mezze", sortOrder: 1 },
      { id: "ab_c_grill", tenantId, nameKey: "menu.cat.grill", name: "Grill", sortOrder: 2 },
      { id: "ab_c_drinks", tenantId, nameKey: "menu.cat.drinks", name: "Drinks", sortOrder: 3 },
    ],
    modifierGroups: [
      {
        id: "ab_mg_spice",
        tenantId,
        name: "Spice level",
        nameKey: "menu.spice",
        selection: "single",
      },
      {
        id: "ab_mg_sides",
        tenantId,
        name: "Side",
        nameKey: "menu.side",
        selection: "single",
      },
    ],
    modifierOptions: [
      {
        id: "ab_mo_mild",
        tenantId,
        groupId: "ab_mg_spice",
        name: "Mild",
        nameKey: "menu.mild",
        priceDelta: 0,
      },
      {
        id: "ab_mo_hot",
        tenantId,
        groupId: "ab_mg_spice",
        name: "Hot",
        nameKey: "menu.hot",
        priceDelta: 0,
      },
      {
        id: "ab_mo_rice",
        tenantId,
        groupId: "ab_mg_sides",
        name: "Rice",
        nameKey: "menu.rice",
        priceDelta: 0,
      },
      {
        id: "ab_mo_fries",
        tenantId,
        groupId: "ab_mg_sides",
        name: "Fries",
        nameKey: "menu.fries",
        priceDelta: 15,
      },
    ],
    menuItems: [
      {
        id: "ab_mi_hummus",
        tenantId,
        categoryId: "ab_c_mezze",
        nameKey: "menu.hummus",
        name: "Hummus Plate",
        basePrice: 65,
        allergens: ["G"],
        active: true,
      },
      {
        id: "ab_mi_fattoush",
        tenantId,
        categoryId: "ab_c_mezze",
        nameKey: "menu.fattoush",
        name: "Fattoush Salad",
        basePrice: 70,
        allergens: ["G"],
        active: true,
      },
      {
        id: "ab_mi_kofta",
        tenantId,
        categoryId: "ab_c_grill",
        nameKey: "menu.kofta",
        name: "Kofta Skewer",
        basePrice: 145,
        allergens: [],
        active: true,
      },
      {
        id: "ab_mi_mixed",
        tenantId,
        categoryId: "ab_c_grill",
        nameKey: "menu.mixed",
        name: "Mixed Grill Platter",
        basePrice: 320,
        allergens: [],
        active: true,
      },
      {
        id: "ab_mi_mint",
        tenantId,
        categoryId: "ab_c_drinks",
        nameKey: "menu.minttea",
        name: "Mint Tea",
        basePrice: 35,
        allergens: [],
        active: true,
      },
      {
        id: "ab_mi_lemonade",
        tenantId,
        categoryId: "ab_c_drinks",
        nameKey: "menu.lemonade",
        name: "Fresh Lemonade",
        basePrice: 45,
        allergens: [],
        active: true,
      },
    ],
    itemMods: [
      {
        id: "ab_im1",
        tenantId,
        menuItemId: "ab_mi_kofta",
        modifierGroupId: "ab_mg_spice",
      },
      {
        id: "ab_im2",
        tenantId,
        menuItemId: "ab_mi_kofta",
        modifierGroupId: "ab_mg_sides",
      },
      {
        id: "ab_im3",
        tenantId,
        menuItemId: "ab_mi_mixed",
        modifierGroupId: "ab_mg_spice",
      },
      {
        id: "ab_im4",
        tenantId,
        menuItemId: "ab_mi_mixed",
        modifierGroupId: "ab_mg_sides",
      },
    ],
  };
}

function testRestaurantSeed(): TenantSeed {
  const tenantId = "ten_test_n1";
  return {
    tenant: {
      id: tenantId,
      slug: "test-restaurant-n1",
      name: "Test restaurant N.1",
      currency: "USD",
      taxRate: 0.08,
      nextOrderNumber: 1000,
    },
    staff: [
      {
        id: "tr_s_admin",
        tenantId,
        staffCode: "101",
        name: "John Doe",
        role: "admin",
        active: true,
        pin: "1234",
        isDefaultPin: false,
      },
      {
        id: "tr_s_waiter",
        tenantId,
        staffCode: "104",
        name: "Sarah Smith",
        role: "waiter",
        active: true,
        pin: "2222",
        isDefaultPin: false,
      },
      {
        id: "tr_s_kitchen",
        tenantId,
        staffCode: "201",
        name: "Chef Carlos",
        role: "kitchen",
        active: true,
        pin: "0000",
        isDefaultPin: true,
      },
      {
        id: "tr_s_waiter2",
        tenantId,
        staffCode: "106",
        name: "Mark Evans",
        role: "waiter",
        active: true,
        pin: "4444",
        isDefaultPin: false,
      },
    ],
    sections: [
      { id: "tr_sec_main", tenantId, name: "Main Floor" },
      { id: "tr_sec_patio", tenantId, name: "Patio" },
    ],
    fixtures: [
      {
        id: "tr_fx_win",
        tenantId,
        sectionId: "tr_sec_main",
        kind: "windows",
        label: "Windows",
        x: 4,
        y: 4,
        w: 70,
        h: 10,
      },
      {
        id: "tr_fx_bar",
        tenantId,
        sectionId: "tr_sec_main",
        kind: "bar",
        label: "Espresso bar",
        x: 82,
        y: 16,
        w: 14,
        h: 60,
      },
      {
        id: "tr_fx_ent",
        tenantId,
        sectionId: "tr_sec_main",
        kind: "entrance",
        label: "Entrance",
        x: 4,
        y: 86,
        w: 18,
        h: 8,
      },
    ],
    tables: [
      {
        id: "tr_t1",
        tenantId,
        sectionId: "tr_sec_main",
        label: "Window 2",
        seats: 2,
        shape: "round",
        x: 8,
        y: 18,
        status: "empty",
      },
      {
        id: "tr_t2",
        tenantId,
        sectionId: "tr_sec_main",
        label: "Window 4",
        seats: 2,
        shape: "round",
        x: 22,
        y: 18,
        status: "occupied",
      },
      {
        id: "tr_t3",
        tenantId,
        sectionId: "tr_sec_main",
        label: "Booth A",
        seats: 4,
        shape: "rect",
        x: 8,
        y: 42,
        status: "empty",
      },
      {
        id: "tr_t4",
        tenantId,
        sectionId: "tr_sec_main",
        label: "High-top",
        seats: 2,
        shape: "round",
        x: 32,
        y: 70,
        status: "empty",
      },
      {
        id: "tr_t5",
        tenantId,
        sectionId: "tr_sec_patio",
        label: "Patio 1",
        seats: 4,
        shape: "rect",
        x: 16,
        y: 30,
        status: "reserved",
      },
      {
        id: "tr_t6",
        tenantId,
        sectionId: "tr_sec_patio",
        label: "Patio 2",
        seats: 4,
        shape: "rect",
        x: 40,
        y: 30,
        status: "empty",
      },
    ],
    categories: [
      { id: "tr_c_hot", tenantId, nameKey: "menu.cat.hot", name: "Hot drinks", sortOrder: 1 },
      { id: "tr_c_cold", tenantId, nameKey: "menu.cat.cold", name: "Cold drinks", sortOrder: 2 },
      { id: "tr_c_pastries", tenantId, nameKey: "menu.cat.pastries", name: "Pastries", sortOrder: 3 },
    ],
    modifierGroups: [
      {
        id: "tr_mg_milk",
        tenantId,
        name: "Choose milk",
        nameKey: "menu.milk",
        selection: "single",
      },
      {
        id: "tr_mg_shot",
        tenantId,
        name: "Extras",
        nameKey: "menu.extras",
        selection: "single",
      },
    ],
    modifierOptions: [
      {
        id: "tr_mo_whole",
        tenantId,
        groupId: "tr_mg_milk",
        name: "Whole milk",
        nameKey: "menu.whole",
        priceDelta: 0,
      },
      {
        id: "tr_mo_oat",
        tenantId,
        groupId: "tr_mg_milk",
        name: "Oat milk",
        nameKey: "menu.oat",
        priceDelta: 0.5,
      },
      {
        id: "tr_mo_almond",
        tenantId,
        groupId: "tr_mg_milk",
        name: "Almond milk",
        nameKey: "menu.almond",
        priceDelta: 0.5,
      },
      {
        id: "tr_mo_none",
        tenantId,
        groupId: "tr_mg_shot",
        name: "No extra",
        nameKey: "menu.noExtra",
        priceDelta: 0,
      },
      {
        id: "tr_mo_shot",
        tenantId,
        groupId: "tr_mg_shot",
        name: "Extra shot",
        nameKey: "menu.extraShot",
        priceDelta: 1.5,
      },
    ],
    menuItems: [
      {
        id: "tr_mi_espresso",
        tenantId,
        categoryId: "tr_c_hot",
        nameKey: "menu.espresso",
        name: "Espresso Double",
        basePrice: 3.5,
        allergens: ["D"],
        active: true,
      },
      {
        id: "tr_mi_capp",
        tenantId,
        categoryId: "tr_c_hot",
        nameKey: "menu.cappuccino",
        name: "Cappuccino Regular",
        basePrice: 4.5,
        allergens: ["D"],
        active: true,
      },
      {
        id: "tr_mi_latte",
        tenantId,
        categoryId: "tr_c_hot",
        nameKey: "menu.latte",
        name: "Vanilla Latte",
        basePrice: 4.8,
        allergens: ["D"],
        active: true,
      },
      {
        id: "tr_mi_iced",
        tenantId,
        categoryId: "tr_c_cold",
        nameKey: "menu.icedlatte",
        name: "Iced Latte",
        basePrice: 5.0,
        allergens: ["D"],
        active: true,
      },
      {
        id: "tr_mi_croissant",
        tenantId,
        categoryId: "tr_c_pastries",
        nameKey: "menu.croissant",
        name: "Butter Croissant",
        basePrice: 3.25,
        allergens: ["D", "G"],
        active: true,
      },
    ],
    itemMods: [
      {
        id: "tr_im1",
        tenantId,
        menuItemId: "tr_mi_espresso",
        modifierGroupId: "tr_mg_shot",
      },
      {
        id: "tr_im2",
        tenantId,
        menuItemId: "tr_mi_capp",
        modifierGroupId: "tr_mg_milk",
      },
      {
        id: "tr_im3",
        tenantId,
        menuItemId: "tr_mi_capp",
        modifierGroupId: "tr_mg_shot",
      },
      {
        id: "tr_im4",
        tenantId,
        menuItemId: "tr_mi_latte",
        modifierGroupId: "tr_mg_milk",
      },
      {
        id: "tr_im5",
        tenantId,
        menuItemId: "tr_mi_iced",
        modifierGroupId: "tr_mg_milk",
      },
    ],
  };
}

async function insertTenant(db: Db, seed: TenantSeed) {
  await db.insert(schema.tenants).values(seed.tenant);
  await db.insert(schema.staff).values(seed.staff);
  await db.insert(schema.floorSections).values(seed.sections);
  if (seed.fixtures.length) await db.insert(schema.floorFixtures).values(seed.fixtures);
  await db.insert(schema.floorTables).values(seed.tables);
  await db.insert(schema.menuCategories).values(seed.categories);
  await db.insert(schema.modifierGroups).values(seed.modifierGroups);
  await db.insert(schema.modifierOptions).values(seed.modifierOptions);
  await db.insert(schema.menuItems).values(seed.menuItems);
  if (seed.itemMods.length) await db.insert(schema.menuItemModifierGroups).values(seed.itemMods);
}

async function main() {
  const url = process.env.DATABASE_URL ?? DEFAULT_URL;
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Clearing previous seed tenants (cascade)…");
  await db.delete(schema.tenants).where(inArray(schema.tenants.slug, [...SEED_SLUGS]));

  const tenants = [alBaronSeed(), testRestaurantSeed()];
  for (const seed of tenants) {
    console.log(`Seeding tenant ${seed.tenant.slug}…`);
    await insertTenant(db, seed);
  }

  console.log("Seed complete:");
  for (const seed of tenants) {
    const staffCount = await db
      .select({ id: schema.staff.id })
      .from(schema.staff)
      .where(eq(schema.staff.tenantId, seed.tenant.id));
    const itemCount = await db
      .select({ id: schema.menuItems.id })
      .from(schema.menuItems)
      .where(eq(schema.menuItems.tenantId, seed.tenant.id));
    const tableCount = await db
      .select({ id: schema.floorTables.id })
      .from(schema.floorTables)
      .where(eq(schema.floorTables.tenantId, seed.tenant.id));
    console.log(
      `  - ${seed.tenant.slug} (${seed.tenant.name}): ${staffCount.length} staff, ${tableCount.length} tables, ${itemCount.length} menu items`,
    );
  }

  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
