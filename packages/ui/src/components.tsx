import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  PointerEvent,
  PropsWithChildren,
  ReactNode,
} from "react";
import type { FloorFixture, FloorTable, TableShape } from "@saasfood/shared";

export function Button({
  variant = "primary",
  block,
  lg,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "strong" | "ghost" | "dark" | "cta";
  block?: boolean;
  lg?: boolean;
}) {
  const v =
    variant === "cta"
      ? "sf-btn-cta"
      : variant === "strong"
        ? "sf-btn-strong"
        : variant === "ghost"
          ? "sf-btn-ghost"
          : variant === "dark"
            ? "sf-btn-dark"
            : "sf-btn-primary";
  return (
    <button
      className={`sf-btn ${v} ${block ? "sf-btn-block" : ""} ${lg ? "sf-btn-lg" : ""} ${className}`}
      {...props}
    />
  );
}

export function Chip({
  tone = "info",
  children,
}: PropsWithChildren<{ tone?: "success" | "danger" | "warning" | "info" | "muted" }>) {
  return <span className={`sf-chip sf-chip-${tone}`}>{children}</span>;
}

export function TextField({
  label,
  dark,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; dark?: boolean }) {
  return (
    <label style={{ display: "block" }}>
      {label ? <span className="sf-label">{label}</span> : null}
      <input className={`sf-input ${dark ? "sf-input-dark" : ""}`} {...props} />
    </label>
  );
}

export function AdminShell({
  brand,
  nav,
  user,
  children,
}: {
  brand: ReactNode;
  nav: ReactNode;
  user?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sf-admin-shell">
      <aside className="sf-sidebar">
        <div style={{ padding: "8px 10px 20px", fontWeight: 800, fontSize: 18 }}>{brand}</div>
        {nav}
        <div style={{ flex: 1 }} />
        {user}
      </aside>
      <main className="sf-main">{children}</main>
    </div>
  );
}

export function NavItem({
  active,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }) {
  return (
    <a className={`sf-nav-item ${active ? "active" : ""}`} {...props}>
      {children}
    </a>
  );
}

export function StatCard({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="sf-card">
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </div>
      <div className="sf-stat-value">{value}</div>
      {meta ? <div style={{ color: "var(--muted)", fontSize: 13 }}>{meta}</div> : null}
    </div>
  );
}

export function ShapePicker({
  value,
  onChange,
  labels,
}: {
  value: TableShape;
  onChange: (shape: TableShape) => void;
  labels: Record<TableShape, string>;
}) {
  const shapes: TableShape[] = ["round", "rect", "large"];
  return (
    <div className="sf-shape-picker">
      {shapes.map((shape) => (
        <button
          key={shape}
          type="button"
          className={`sf-shape-option ${value === shape ? "active" : ""}`}
          onClick={() => onChange(shape)}
        >
          <span className={`sf-shape-preview ${shape}`} />
          {labels[shape]}
        </button>
      ))}
    </div>
  );
}

export function FloorMap({
  tables,
  fixtures = [],
  light,
  editable,
  selectedId,
  seatsLabel,
  onTableClick,
  onTablePointerDown,
  onFixtureClick,
  onFixturePointerDown,
}: {
  tables: FloorTable[];
  fixtures?: FloorFixture[];
  light?: boolean;
  editable?: boolean;
  selectedId?: string | null;
  seatsLabel: (n: number) => string;
  onTableClick?: (table: FloorTable) => void;
  onTablePointerDown?: (table: FloorTable, e: PointerEvent<HTMLButtonElement>) => void;
  onFixtureClick?: (fixture: FloorFixture) => void;
  onFixturePointerDown?: (fixture: FloorFixture, e: PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className={`sf-floor-map ${light ? "light" : ""}`}>
      {fixtures.map((fx) => (
        <button
          key={fx.id}
          type="button"
          className={`sf-zone sf-zone-${fx.kind} ${editable ? "interactive" : ""} ${selectedId === fx.id ? "selected" : ""}`}
          style={{
            left: `${fx.x}%`,
            top: `${fx.y}%`,
            width: `${fx.w}%`,
            height: `${fx.h}%`,
            pointerEvents: editable ? "auto" : "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onFixtureClick?.(fx);
          }}
          onPointerDown={(e) => {
            if (!editable) return;
            e.stopPropagation();
            onFixturePointerDown?.(fx, e);
          }}
        >
          {fx.label}
        </button>
      ))}
      {tables.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`sf-table-node ${t.shape} ${t.status} ${selectedId === t.id ? "selected" : ""}`}
          style={{ left: `${t.x}%`, top: `${t.y}%` }}
          onClick={(e) => {
            e.stopPropagation();
            onTableClick?.(t);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onTablePointerDown?.(t, e);
          }}
        >
          <span className="code">{t.label}</span>
          <span className="seats">{seatsLabel(t.seats)}</span>
        </button>
      ))}
    </div>
  );
}

export function Keypad({
  onDigit,
  onClear,
  onEnter,
  clearLabel,
  enterLabel,
}: {
  onDigit: (d: string) => void;
  onClear: () => void;
  onEnter: () => void;
  clearLabel: string;
  enterLabel: string;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="sf-keypad">
      {keys.map((k) => (
        <button key={k} type="button" className="sf-key" onClick={() => onDigit(k)}>
          {k}
        </button>
      ))}
      <button type="button" className="sf-key" style={{ fontSize: 14 }} onClick={onClear}>
        {clearLabel}
      </button>
      <button type="button" className="sf-key" onClick={() => onDigit("0")}>
        0
      </button>
      <button type="button" className="sf-key enter" onClick={onEnter}>
        {enterLabel}
      </button>
    </div>
  );
}

export function TerminalFrame({ header, children }: PropsWithChildren<{ header: ReactNode }>) {
  return (
    <div className="sf-terminal">
      <header className="sf-term-header">{header}</header>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>{children}</div>
    </div>
  );
}
