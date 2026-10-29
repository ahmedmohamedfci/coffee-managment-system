-- Seed tenants: al-baron-pyramid-iv + test-restaurant-n1
-- Applied once via schema_migrations (filename ledger).

DELETE FROM tenants WHERE slug IN ('al-baron-pyramid-iv', 'test-restaurant-n1');

-- Tenant: al-baron-pyramid-iv
INSERT INTO "tenants" ("id", "slug", "name", "currency", "tax_rate", "next_order_number")
VALUES
  ('ten_al_baron', 'al-baron-pyramid-iv', 'AL BARON PYRAMID IV', 'EGP', 0.14, 5001);

INSERT INTO "staff" ("id", "tenant_id", "staff_code", "name", "role", "active", "pin", "is_default_pin")
VALUES
  ('ab_s_admin', 'ten_al_baron', '101', 'Hassan Farouk', 'admin', true, '1234', false),
  ('ab_s_waiter', 'ten_al_baron', '104', 'Nour El-Sayed', 'waiter', true, '2222', false),
  ('ab_s_kitchen', 'ten_al_baron', '201', 'Chef Amira', 'kitchen', true, '0000', true),
  ('ab_s_waiter2', 'ten_al_baron', '105', 'Omar Khalil', 'waiter', true, '5555', false);

INSERT INTO "floor_sections" ("id", "tenant_id", "name")
VALUES
  ('ab_sec_grill', 'ten_al_baron', 'Grill Hall'),
  ('ab_sec_terrace', 'ten_al_baron', 'Pyramid Terrace'),
  ('ab_sec_shisha', 'ten_al_baron', 'Shisha Lounge');

INSERT INTO "floor_fixtures" ("id", "tenant_id", "section_id", "kind", "label", "x", "y", "w", "h")
VALUES
  ('ab_fx_ent', 'ten_al_baron', 'ab_sec_grill', 'entrance', 'Lobby', 4, 88, 20, 8),
  ('ab_fx_grill', 'ten_al_baron', 'ab_sec_grill', 'kitchen', 'Open grill', 78, 12, 18, 40),
  ('ab_fx_bar', 'ten_al_baron', 'ab_sec_shisha', 'bar', 'Hookah bar', 6, 20, 16, 50);

INSERT INTO "floor_tables" ("id", "tenant_id", "section_id", "label", "seats", "shape", "x", "y", "status")
VALUES
  ('ab_t1', 'ten_al_baron', 'ab_sec_grill', 'Grill 1', 4, 'rect', 12, 20, 'empty'),
  ('ab_t2', 'ten_al_baron', 'ab_sec_grill', 'Grill 2', 4, 'rect', 32, 20, 'occupied'),
  ('ab_t3', 'ten_al_baron', 'ab_sec_grill', 'Family 8', 8, 'large', 20, 48, 'empty'),
  ('ab_t4', 'ten_al_baron', 'ab_sec_terrace', 'Terrace A', 2, 'round', 14, 24, 'reserved'),
  ('ab_t5', 'ten_al_baron', 'ab_sec_terrace', 'Terrace B', 6, 'rect', 40, 30, 'empty'),
  ('ab_t6', 'ten_al_baron', 'ab_sec_shisha', 'Lounge 1', 4, 'round', 36, 28, 'occupied');

INSERT INTO "menu_categories" ("id", "tenant_id", "name_key", "name", "sort_order")
VALUES
  ('ab_c_mezze', 'ten_al_baron', 'menu.cat.mezze', 'Mezze', 1),
  ('ab_c_grill', 'ten_al_baron', 'menu.cat.grill', 'Grill', 2),
  ('ab_c_drinks', 'ten_al_baron', 'menu.cat.drinks', 'Drinks', 3);

INSERT INTO "modifier_groups" ("id", "tenant_id", "name", "name_key", "selection")
VALUES
  ('ab_mg_spice', 'ten_al_baron', 'Spice level', 'menu.spice', 'single'),
  ('ab_mg_sides', 'ten_al_baron', 'Side', 'menu.side', 'single');

INSERT INTO "modifier_options" ("id", "tenant_id", "group_id", "name", "name_key", "price_delta")
VALUES
  ('ab_mo_mild', 'ten_al_baron', 'ab_mg_spice', 'Mild', 'menu.mild', 0),
  ('ab_mo_hot', 'ten_al_baron', 'ab_mg_spice', 'Hot', 'menu.hot', 0),
  ('ab_mo_rice', 'ten_al_baron', 'ab_mg_sides', 'Rice', 'menu.rice', 0),
  ('ab_mo_fries', 'ten_al_baron', 'ab_mg_sides', 'Fries', 'menu.fries', 15);

INSERT INTO "menu_items" ("id", "tenant_id", "category_id", "name_key", "name", "base_price", "allergens", "active")
VALUES
  ('ab_mi_hummus', 'ten_al_baron', 'ab_c_mezze', 'menu.hummus', 'Hummus Plate', 65, '["G"]'::jsonb, true),
  ('ab_mi_fattoush', 'ten_al_baron', 'ab_c_mezze', 'menu.fattoush', 'Fattoush Salad', 70, '["G"]'::jsonb, true),
  ('ab_mi_kofta', 'ten_al_baron', 'ab_c_grill', 'menu.kofta', 'Kofta Skewer', 145, '[]'::jsonb, true),
  ('ab_mi_mixed', 'ten_al_baron', 'ab_c_grill', 'menu.mixed', 'Mixed Grill Platter', 320, '[]'::jsonb, true),
  ('ab_mi_mint', 'ten_al_baron', 'ab_c_drinks', 'menu.minttea', 'Mint Tea', 35, '[]'::jsonb, true),
  ('ab_mi_lemonade', 'ten_al_baron', 'ab_c_drinks', 'menu.lemonade', 'Fresh Lemonade', 45, '[]'::jsonb, true);

INSERT INTO "menu_item_modifier_groups" ("id", "tenant_id", "menu_item_id", "modifier_group_id")
VALUES
  ('ab_im1', 'ten_al_baron', 'ab_mi_kofta', 'ab_mg_spice'),
  ('ab_im2', 'ten_al_baron', 'ab_mi_kofta', 'ab_mg_sides'),
  ('ab_im3', 'ten_al_baron', 'ab_mi_mixed', 'ab_mg_spice'),
  ('ab_im4', 'ten_al_baron', 'ab_mi_mixed', 'ab_mg_sides');

-- Tenant: test-restaurant-n1
INSERT INTO "tenants" ("id", "slug", "name", "currency", "tax_rate", "next_order_number")
VALUES
  ('ten_test_n1', 'test-restaurant-n1', 'Test restaurant N.1', 'USD', 0.08, 1000);

INSERT INTO "staff" ("id", "tenant_id", "staff_code", "name", "role", "active", "pin", "is_default_pin")
VALUES
  ('tr_s_admin', 'ten_test_n1', '101', 'John Doe', 'admin', true, '1234', false),
  ('tr_s_waiter', 'ten_test_n1', '104', 'Sarah Smith', 'waiter', true, '2222', false),
  ('tr_s_kitchen', 'ten_test_n1', '201', 'Chef Carlos', 'kitchen', true, '0000', true),
  ('tr_s_waiter2', 'ten_test_n1', '106', 'Mark Evans', 'waiter', true, '4444', false);

INSERT INTO "floor_sections" ("id", "tenant_id", "name")
VALUES
  ('tr_sec_main', 'ten_test_n1', 'Main Floor'),
  ('tr_sec_patio', 'ten_test_n1', 'Patio');

INSERT INTO "floor_fixtures" ("id", "tenant_id", "section_id", "kind", "label", "x", "y", "w", "h")
VALUES
  ('tr_fx_win', 'ten_test_n1', 'tr_sec_main', 'windows', 'Windows', 4, 4, 70, 10),
  ('tr_fx_bar', 'ten_test_n1', 'tr_sec_main', 'bar', 'Espresso bar', 82, 16, 14, 60),
  ('tr_fx_ent', 'ten_test_n1', 'tr_sec_main', 'entrance', 'Entrance', 4, 86, 18, 8);

INSERT INTO "floor_tables" ("id", "tenant_id", "section_id", "label", "seats", "shape", "x", "y", "status")
VALUES
  ('tr_t1', 'ten_test_n1', 'tr_sec_main', 'Window 2', 2, 'round', 8, 18, 'empty'),
  ('tr_t2', 'ten_test_n1', 'tr_sec_main', 'Window 4', 2, 'round', 22, 18, 'occupied'),
  ('tr_t3', 'ten_test_n1', 'tr_sec_main', 'Booth A', 4, 'rect', 8, 42, 'empty'),
  ('tr_t4', 'ten_test_n1', 'tr_sec_main', 'High-top', 2, 'round', 32, 70, 'empty'),
  ('tr_t5', 'ten_test_n1', 'tr_sec_patio', 'Patio 1', 4, 'rect', 16, 30, 'reserved'),
  ('tr_t6', 'ten_test_n1', 'tr_sec_patio', 'Patio 2', 4, 'rect', 40, 30, 'empty');

INSERT INTO "menu_categories" ("id", "tenant_id", "name_key", "name", "sort_order")
VALUES
  ('tr_c_hot', 'ten_test_n1', 'menu.cat.hot', 'Hot drinks', 1),
  ('tr_c_cold', 'ten_test_n1', 'menu.cat.cold', 'Cold drinks', 2),
  ('tr_c_pastries', 'ten_test_n1', 'menu.cat.pastries', 'Pastries', 3);

INSERT INTO "modifier_groups" ("id", "tenant_id", "name", "name_key", "selection")
VALUES
  ('tr_mg_milk', 'ten_test_n1', 'Choose milk', 'menu.milk', 'single'),
  ('tr_mg_shot', 'ten_test_n1', 'Extras', 'menu.extras', 'single');

INSERT INTO "modifier_options" ("id", "tenant_id", "group_id", "name", "name_key", "price_delta")
VALUES
  ('tr_mo_whole', 'ten_test_n1', 'tr_mg_milk', 'Whole milk', 'menu.whole', 0),
  ('tr_mo_oat', 'ten_test_n1', 'tr_mg_milk', 'Oat milk', 'menu.oat', 0.5),
  ('tr_mo_almond', 'ten_test_n1', 'tr_mg_milk', 'Almond milk', 'menu.almond', 0.5),
  ('tr_mo_none', 'ten_test_n1', 'tr_mg_shot', 'No extra', 'menu.noExtra', 0),
  ('tr_mo_shot', 'ten_test_n1', 'tr_mg_shot', 'Extra shot', 'menu.extraShot', 1.5);

INSERT INTO "menu_items" ("id", "tenant_id", "category_id", "name_key", "name", "base_price", "allergens", "active")
VALUES
  ('tr_mi_espresso', 'ten_test_n1', 'tr_c_hot', 'menu.espresso', 'Espresso Double', 3.5, '["D"]'::jsonb, true),
  ('tr_mi_capp', 'ten_test_n1', 'tr_c_hot', 'menu.cappuccino', 'Cappuccino Regular', 4.5, '["D"]'::jsonb, true),
  ('tr_mi_latte', 'ten_test_n1', 'tr_c_hot', 'menu.latte', 'Vanilla Latte', 4.8, '["D"]'::jsonb, true),
  ('tr_mi_iced', 'ten_test_n1', 'tr_c_cold', 'menu.icedlatte', 'Iced Latte', 5, '["D"]'::jsonb, true),
  ('tr_mi_croissant', 'ten_test_n1', 'tr_c_pastries', 'menu.croissant', 'Butter Croissant', 3.25, '["D","G"]'::jsonb, true);

INSERT INTO "menu_item_modifier_groups" ("id", "tenant_id", "menu_item_id", "modifier_group_id")
VALUES
  ('tr_im1', 'ten_test_n1', 'tr_mi_espresso', 'tr_mg_shot'),
  ('tr_im2', 'ten_test_n1', 'tr_mi_capp', 'tr_mg_milk'),
  ('tr_im3', 'ten_test_n1', 'tr_mi_capp', 'tr_mg_shot'),
  ('tr_im4', 'ten_test_n1', 'tr_mi_latte', 'tr_mg_milk'),
  ('tr_im5', 'ten_test_n1', 'tr_mi_iced', 'tr_mg_milk');

