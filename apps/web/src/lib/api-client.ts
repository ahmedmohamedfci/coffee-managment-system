import type {
  FloorFixture,
  FloorSection,
  FloorTable,
  KitchenTicket,
  MenuCategory,
  MenuItem,
  ModifierGroup,
  Order,
  Payment,
  PaymentMethod,
  Staff,
  StaffRole,
  TicketStatus,
} from "@saasfood/shared";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type TenantInfo = {
  id: string;
  slug: string;
  name: string;
  currency: string;
  taxRate: number;
};

export type StaffSession = {
  staffId: string;
  name: string;
  role: StaffRole;
  staffCode?: string;
  isDefaultPin?: boolean;
};

export type FloorPayload = {
  sections: FloorSection[];
  tables: FloorTable[];
  fixtures: FloorFixture[];
};

export type MenuPayload = {
  categories: Array<MenuCategory & { name?: string | null }>;
  menuItems: MenuItem[];
  modifierGroups: ModifierGroup[];
};

export type StaffPublic = Omit<Staff, "pin">;

export type CreateMenuItemInput = {
  categoryId: string;
  name: string;
  basePrice: number;
  allergens?: string[];
  modifierGroupIds?: string[];
  active?: boolean;
};

export type UpdateMenuItemInput = Partial<CreateMenuItemInput> & {
  nameKey?: string;
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string };
    return body.error || body.message || res.statusText || "Request failed";
  } catch {
    return res.statusText || "Request failed";
  }
}

export async function apiFetch<T>(
  tenantSlug: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api/t/${encodeURIComponent(tenantSlug)}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function createTenantApi(tenantSlug: string) {
  const slug = tenantSlug;

  return {
    getTenant: () => apiFetch<TenantInfo>(slug, "/tenant"),

    login: (staffCode: string, pin: string) =>
      apiFetch<StaffSession>(slug, "/auth/staff/login", {
        method: "POST",
        body: JSON.stringify({ staffCode, pin }),
      }),

    me: () => apiFetch<StaffSession>(slug, "/auth/me"),

    logout: () =>
      apiFetch<void>(slug, "/auth/logout", {
        method: "POST",
      }),

    getFloor: () => apiFetch<FloorPayload>(slug, "/floor"),

    openOrder: (tableId: string) =>
      apiFetch<Order>(slug, "/orders/open", {
        method: "POST",
        body: JSON.stringify({ tableId }),
      }),

    getOrder: (orderId: string) => apiFetch<Order>(slug, `/orders/${orderId}`),

    addLine: (
      orderId: string,
      body: {
        menuItemId: string;
        quantity: number;
        modifierOptionIds: string[];
        kitchenNote?: string;
        allergyNote?: boolean;
      },
    ) =>
      apiFetch<Order>(slug, `/orders/${orderId}/lines`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    updateLineQty: (orderId: string, lineId: string, quantity: number) =>
      apiFetch<Order>(slug, `/orders/${orderId}/lines/${lineId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      }),

    submitOrder: (orderId: string) =>
      apiFetch<Order>(slug, `/orders/${orderId}/submit`, {
        method: "POST",
      }),

    checkout: (orderId: string) =>
      apiFetch<Order>(slug, `/orders/${orderId}/checkout`, {
        method: "POST",
      }),

    pay: (orderId: string, method: PaymentMethod) =>
      apiFetch<Payment>(slug, `/orders/${orderId}/pay`, {
        method: "POST",
        body: JSON.stringify({ method }),
      }),

    getKitchenTickets: () => apiFetch<KitchenTicket[]>(slug, "/kitchen/tickets"),

    updateTicketStatus: (ticketId: string, status: TicketStatus) =>
      apiFetch<KitchenTicket>(slug, `/kitchen/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    getMenu: () => apiFetch<MenuPayload>(slug, "/menu"),

    createMenuItem: (body: CreateMenuItemInput) =>
      apiFetch<MenuItem>(slug, "/menu/items", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    updateMenuItem: (itemId: string, body: UpdateMenuItemInput) =>
      apiFetch<MenuItem>(slug, `/menu/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),

    deleteMenuItem: (itemId: string) =>
      apiFetch<void>(slug, `/menu/items/${itemId}`, {
        method: "DELETE",
      }),

    saveModifiers: (groups: ModifierGroup[]) =>
      apiFetch<ModifierGroup[]>(slug, "/menu/modifiers", {
        method: "PUT",
        body: JSON.stringify({ groups }),
      }),

    updateSettings: (body: { name?: string; taxRate?: number; currency?: string }) =>
      apiFetch<TenantInfo>(slug, "/settings", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),

    getStaff: () => apiFetch<StaffPublic[]>(slug, "/staff"),

    resetPin: (staffId: string) =>
      apiFetch<StaffPublic>(slug, `/staff/${staffId}/reset-pin`, {
        method: "POST",
      }),
  };
}

export type TenantApi = ReturnType<typeof createTenantApi>;

export function money(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

const PAYMENT_KEY = "sf_last_payment";

export function stashPaymentSuccess(payload: {
  payment: Payment;
  order: Pick<Order, "id" | "tableLabel" | "waiterName" | "total">;
}) {
  try {
    sessionStorage.setItem(PAYMENT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readPaymentSuccess(paymentId: string) {
  try {
    const raw = sessionStorage.getItem(PAYMENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      payment: Payment;
      order: Pick<Order, "id" | "tableLabel" | "waiterName" | "total">;
    };
    if (data.payment?.id !== paymentId) return null;
    return data;
  } catch {
    return null;
  }
}
