export type Lang = "en" | "cs" | "ar";
export type StaffRole = "admin" | "waiter" | "kitchen";
export type TableStatus = "empty" | "occupied" | "reserved";
export type TableShape = "round" | "rect" | "large";
export type FixtureKind = "entrance" | "bar" | "windows" | "kitchen" | "restroom" | "counter" | "other";
export type TicketStatus = "pending" | "preparing" | "ready" | "dismissed";
export type OrderStatus = "open" | "submitted" | "awaiting_payment" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "manual_card" | "tap";

export type Staff = {
  id: string;
  staffCode: string;
  name: string;
  role: StaffRole;
  active: boolean;
  pin: string;
  isDefaultPin: boolean;
};

export type FloorSection = {
  id: string;
  name: string;
};

export type FloorTable = {
  id: string;
  sectionId: string;
  label: string;
  seats: number;
  shape: TableShape;
  x: number;
  y: number;
  status: TableStatus;
};

/** Stable room features (not seats) — entrance, bar, windows, etc. */
export type FloorFixture = {
  id: string;
  sectionId: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type MenuCategory = {
  id: string;
  nameKey: string;
};

export type Allergen = "D" | "N" | "G";

export type ModifierOption = {
  id: string;
  name: string;
  nameKey?: string;
  /** Flat surcharge added to the item base price (e.g. 0.5 = +$0.50). */
  priceDelta: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  nameKey?: string;
  selection: "single";
  options: ModifierOption[];
};

export type MenuItem = {
  id: string;
  categoryId: string;
  nameKey: string;
  name: string;
  basePrice: number;
  allergens: Allergen[];
  modifierGroupIds: string[];
};

export type OrderLine = {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifierLabels: string[];
  kitchenNote?: string;
  lineTotal: number;
  allergyNote?: boolean;
};

export type Order = {
  id: string;
  number: number;
  tableId: string;
  tableLabel: string;
  waiterId: string;
  waiterName: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  createdAt: string;
  submittedAt?: string;
};

export type KitchenTicket = {
  id: string;
  orderId: string;
  tableLabel: string;
  waiterName: string;
  status: TicketStatus;
  lines: Array<{ qty: number; name: string; note?: string; allergy?: boolean }>;
  createdAt: string;
  startedAt?: string;
};

export type Payment = {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  txnId: string;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  titleKey: string;
  title?: string;
  actor: string;
  at: string;
  tone: "success" | "danger" | "warning" | "info";
};

export type Session =
  | { kind: "admin"; name: string; email: string }
  | { kind: "staff"; staffId: string; name: string; role: StaffRole }
  | null;

export type DemoState = {
  staff: Staff[];
  sections: FloorSection[];
  tables: FloorTable[];
  fixtures: FloorFixture[];
  categories: MenuCategory[];
  modifierGroups: ModifierGroup[];
  menuItems: MenuItem[];
  orders: Order[];
  tickets: KitchenTicket[];
  payments: Payment[];
  activity: ActivityItem[];
  nextOrderNumber: number;
  taxRate: number;
  tenantName: string;
  currency: string;
};

export function lineTotal(basePrice: number, modifierDeltas: number[], quantity: number) {
  const unit = basePrice + modifierDeltas.reduce((a, b) => a + b, 0);
  return roundMoney(unit * quantity);
}

export function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function computeOrderTotals(lines: OrderLine[], taxRate: number) {
  const subtotal = roundMoney(lines.reduce((s, l) => s + l.lineTotal, 0));
  const tax = roundMoney(subtotal * taxRate);
  return { subtotal, tax, total: roundMoney(subtotal + tax) };
}
