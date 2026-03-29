import { NextResponse } from "next/server";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "@/lib/project-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readProjectId(value: string) {
  const projectId = Number.parseInt(value, 10);

  if (Number.isNaN(projectId)) {
    return null;
  }

  return projectId;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projectId = readProjectId(id);

    if (projectId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Could not fetch project", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projectId = readProjectId(id);

    if (projectId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const items = Array.isArray(body.items) ? body.items : [];
    const svgSnapshot =
      typeof body.svg_snapshot === "string" ? body.svg_snapshot : undefined;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const project = await updateProject(projectId, name, items, svgSnapshot);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Could not update project", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projectId = readProjectId(id);

    if (projectId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const deletedProject = await deleteProject(projectId);

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: deletedProject.id,
      message: "Project deleted",
    });
  } catch (error) {
    console.error("Could not delete project", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
