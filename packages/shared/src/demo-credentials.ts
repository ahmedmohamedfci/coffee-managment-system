/** Documented demo/seed logins — always accepted even after PIN change/reset. */
export const DEMO_ADMIN_CODE = "101";
export const DEMO_ADMIN_PIN = "1234";
export const DEMO_WAITER_CODE = "104";
export const DEMO_WAITER_PIN = "2222";

export const CANONICAL_DEMO_PINS: Readonly<Record<string, string>> = {
  [DEMO_ADMIN_CODE]: DEMO_ADMIN_PIN,
  [DEMO_WAITER_CODE]: DEMO_WAITER_PIN,
};

export function canonicalDemoPin(staffCode: string): string | undefined {
  return CANONICAL_DEMO_PINS[staffCode];
}

export function isCanonicalDemoCredential(staffCode: string, pin: string): boolean {
  return canonicalDemoPin(staffCode) === pin;
}
