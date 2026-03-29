import type { EditorItem } from "../../editor/types";
import type { ProjectRecord, ProjectSummary } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const response = await fetch(`${baseUrl}/api${path}`, options);

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
}

export function fetchProjects() {
  return requestJson<ProjectSummary[]>("/projects");
}

export function fetchProject(projectId: number) {
  return requestJson<ProjectRecord>(`/projects/${projectId}`);
}

export function createProject(
  name: string,
  items: EditorItem[],
  svgSnapshot?: string,
) {
  return requestJson<ProjectRecord>("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, items, svg_snapshot: svgSnapshot }),
  });
}

export function updateProject(
  projectId: number,
  name: string,
  items: EditorItem[],
  svgSnapshot?: string,
) {
  return requestJson<ProjectRecord>(`/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, items, svg_snapshot: svgSnapshot }),
  });
}

export async function deleteProject(projectId: number) {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }
}
