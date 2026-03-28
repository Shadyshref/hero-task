import pool from '../db';

export interface GlyphItem {
  id: string;
  code: string;
  positionIndex: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  scale: number;
}

export async function getAllProjects() {
  const result = await pool.query(
    'SELECT id, name, created_at, updated_at FROM projects ORDER BY updated_at DESC'
  );
  return result.rows;
}

export async function getProjectById(id: number) {
  const result = await pool.query(
    'SELECT * FROM projects WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createProject(name: string, items: GlyphItem[], svgSnapshot?: string) {
  const result = await pool.query(
    `INSERT INTO projects (name, items, svg_snapshot)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, JSON.stringify(items), svgSnapshot || null]
  );
  return result.rows[0];
}

export async function updateProject(
  id: number,
  name: string,
  items: GlyphItem[],
  svgSnapshot?: string
) {
  const result = await pool.query(
    `UPDATE projects
     SET name = $1, items = $2, svg_snapshot = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, JSON.stringify(items), svgSnapshot || null, id]
  );
  return result.rows[0] || null;
}

export async function deleteProject(id: number) {
  const result = await pool.query(
    'DELETE FROM projects WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}
