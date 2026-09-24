import { DemoHud } from "@/components/demo-hud";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoHud />
      <div style={{ minHeight: "calc(100vh - 56px)" }}>{children}</div>
    </>
  );
}
