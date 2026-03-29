import type { EditorItem } from "@/features/editor/types";
import pool, { ensureDatabase } from "@/lib/db";

export async function getProjects() {
  await ensureDatabase();

  const result = await pool.query(
    "SELECT id, name, created_at, updated_at FROM projects ORDER BY updated_at DESC"
  );

  return result.rows;
}

export async function getProjectById(projectId: number) {
  await ensureDatabase();

  const result = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);

  return result.rows[0] ?? null;
}

export async function createProject(
  name: string,
  items: EditorItem[],
  svgSnapshot?: string
) {
  await ensureDatabase();

  const result = await pool.query(
    `INSERT INTO projects (name, items, svg_snapshot)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, JSON.stringify(items), svgSnapshot ?? null]
  );

  return result.rows[0];
}

export async function updateProject(
  projectId: number,
  name: string,
  items: EditorItem[],
  svgSnapshot?: string
) {
  await ensureDatabase();

  const result = await pool.query(
    `UPDATE projects
     SET name = $1, items = $2, svg_snapshot = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, JSON.stringify(items), svgSnapshot ?? null, projectId]
  );

  return result.rows[0] ?? null;
}

export async function deleteProject(projectId: number) {
  await ensureDatabase();

  const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING id", [projectId]);

  return result.rows[0] ?? null;
}
