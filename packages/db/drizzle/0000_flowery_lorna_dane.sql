CREATE TABLE "activity_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"title_key" text NOT NULL,
	"title" text,
	"actor" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"tone" text DEFAULT 'info' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floor_fixtures" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"section_id" text NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"w" double precision NOT NULL,
	"h" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floor_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floor_tables" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"section_id" text NOT NULL,
	"label" text NOT NULL,
	"seats" integer NOT NULL,
	"shape" text NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"status" text DEFAULT 'empty' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kitchen_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" text NOT NULL,
	"table_label" text NOT NULL,
	"waiter_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"lines" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name_key" text NOT NULL,
	"name" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_item_modifier_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"menu_item_id" text NOT NULL,
	"modifier_group_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"category_id" text NOT NULL,
	"name_key" text NOT NULL,
	"name" text NOT NULL,
	"base_price" double precision NOT NULL,
	"allergens" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modifier_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"name_key" text,
	"selection" text DEFAULT 'single' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modifier_options" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"group_id" text NOT NULL,
	"name" text NOT NULL,
	"name_key" text,
	"price_delta" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" text NOT NULL,
	"menu_item_id" text NOT NULL,
	"name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" double precision NOT NULL,
	"modifier_labels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"kitchen_note" text,
	"allergy_note" boolean DEFAULT false NOT NULL,
	"line_total" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"number" integer NOT NULL,
	"table_id" text NOT NULL,
	"table_label" text NOT NULL,
	"waiter_id" text NOT NULL,
	"waiter_name" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"subtotal" double precision DEFAULT 0 NOT NULL,
	"tax_rate" double precision NOT NULL,
	"tax" double precision DEFAULT 0 NOT NULL,
	"total" double precision DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" text NOT NULL,
	"method" text NOT NULL,
	"amount" double precision NOT NULL,
	"txn_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"staff_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"staff_code" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"pin" text NOT NULL,
	"is_default_pin" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"tax_rate" double precision DEFAULT 0.08 NOT NULL,
	"next_order_number" integer DEFAULT 1000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "activity_items" ADD CONSTRAINT "activity_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_fixtures" ADD CONSTRAINT "floor_fixtures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_fixtures" ADD CONSTRAINT "floor_fixtures_section_id_floor_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."floor_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_sections" ADD CONSTRAINT "floor_sections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_tables" ADD CONSTRAINT "floor_tables_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_tables" ADD CONSTRAINT "floor_tables_section_id_floor_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."floor_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_tickets" ADD CONSTRAINT "kitchen_tickets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_tickets" ADD CONSTRAINT "kitchen_tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_modifier_groups" ADD CONSTRAINT "menu_item_modifier_groups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_modifier_groups" ADD CONSTRAINT "menu_item_modifier_groups_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_modifier_groups" ADD CONSTRAINT "menu_item_modifier_groups_modifier_group_id_modifier_groups_id_fk" FOREIGN KEY ("modifier_group_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifier_options" ADD CONSTRAINT "modifier_options_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modifier_options" ADD CONSTRAINT "modifier_options_group_id_modifier_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_floor_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."floor_tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_waiter_id_staff_id_fk" FOREIGN KEY ("waiter_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_items_tenant_idx" ON "activity_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "floor_fixtures_tenant_idx" ON "floor_fixtures" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "floor_sections_tenant_idx" ON "floor_sections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "floor_tables_tenant_idx" ON "floor_tables" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "kitchen_tickets_tenant_idx" ON "kitchen_tickets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "menu_categories_tenant_idx" ON "menu_categories" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "menu_item_mod_uidx" ON "menu_item_modifier_groups" USING btree ("menu_item_id","modifier_group_id");--> statement-breakpoint
CREATE INDEX "menu_item_mod_tenant_idx" ON "menu_item_modifier_groups" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "menu_items_tenant_idx" ON "menu_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "modifier_groups_tenant_idx" ON "modifier_groups" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "modifier_options_tenant_idx" ON "modifier_options" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "order_lines_tenant_order_idx" ON "order_lines" USING btree ("tenant_id","order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_tenant_number_uidx" ON "orders" USING btree ("tenant_id","number");--> statement-breakpoint
CREATE INDEX "orders_tenant_idx" ON "orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "orders_tenant_table_status_idx" ON "orders" USING btree ("tenant_id","table_id","status");--> statement-breakpoint
CREATE INDEX "payments_tenant_idx" ON "payments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sessions_tenant_idx" ON "sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_tenant_code_uidx" ON "staff" USING btree ("tenant_id","staff_code");--> statement-breakpoint
CREATE INDEX "staff_tenant_idx" ON "staff" USING btree ("tenant_id");