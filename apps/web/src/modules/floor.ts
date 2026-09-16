import { eq } from "drizzle-orm";
import { floorFixtures, floorSections, floorTables } from "@saasfood/db";
import { getDb } from "@/lib/db";

export async function listFloor(tenantId: string) {
  const db = getDb();
  const [sections, tables, fixtures] = await Promise.all([
    db.select().from(floorSections).where(eq(floorSections.tenantId, tenantId)),
    db.select().from(floorTables).where(eq(floorTables.tenantId, tenantId)),
    db.select().from(floorFixtures).where(eq(floorFixtures.tenantId, tenantId)),
  ]);

  return {
    sections: sections.map((s) => ({ id: s.id, name: s.name })),
    tables: tables.map((t) => ({
      id: t.id,
      sectionId: t.sectionId,
      label: t.label,
      seats: t.seats,
      shape: t.shape,
      x: t.x,
      y: t.y,
      status: t.status,
    })),
    fixtures: fixtures.map((f) => ({
      id: f.id,
      sectionId: f.sectionId,
      kind: f.kind,
      label: f.label,
      x: f.x,
      y: f.y,
      w: f.w,
      h: f.h,
    })),
  };
}
