import { NextResponse } from "next/server";
import { createProject, getProjects } from "@/lib/project-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Could not fetch projects", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const items = Array.isArray(body.items) ? body.items : [];
    const svgSnapshot =
      typeof body.svg_snapshot === "string" ? body.svg_snapshot : undefined;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const project = await createProject(name, items, svgSnapshot);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Could not create project", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
