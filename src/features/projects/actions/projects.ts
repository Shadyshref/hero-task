'use server';

import { revalidatePath } from 'next/cache';
import type { EditorItem } from '../../editor/types';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '@/lib/project-service';

export async function fetchProjects() {
  return getProjects();
}

export async function fetchProject(projectId: number) {
  return getProjectById(projectId);
}

export async function createProjectAction(
  name: string,
  items: EditorItem[],
  svgSnapshot?: string
) {
  const project = await createProject(name, items, svgSnapshot);
  revalidatePath('/');
  return project;
}

export async function updateProjectAction(
  projectId: number,
  name: string,
  items: EditorItem[],
  svgSnapshot?: string
) {
  const project = await updateProject(projectId, name, items, svgSnapshot);
  revalidatePath('/');
  return project;
}

export async function deleteProjectAction(projectId: number) {
  const deletedProject = await deleteProject(projectId);
  revalidatePath('/');
  return deletedProject;
}
