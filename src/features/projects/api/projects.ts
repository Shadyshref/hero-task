import type { EditorItem } from "../../editor/types";
import type { ProjectRecord, ProjectSummary } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

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
    body: JSON.stringify({ name, items, svg_snapshot: svgSnapshot }),
  });
}

export async function deleteProject(projectId: number) {
  const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }
}
