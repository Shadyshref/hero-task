'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { deleteProjectAction, fetchProjects } from '../actions/projects';
import type { ProjectSummary } from '../types';

interface ProjectsDialogProps {
  onClose: () => void;
  onLoadProject: (projectId: number) => void;
}

export function ProjectsDialog({ onClose, onLoadProject }: ProjectsDialogProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');

  const normalizedSearch = searchText.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    if (!normalizedSearch) {
      return true;
    }

    return project.name.toLowerCase().includes(normalizedSearch);
  });

  function formatProjectDate(value: string) {
    return new Date(value).toLocaleString('en-US');
  }

  useEffect(() => {
    let isMounted = true;

    void fetchProjects()
      .then((loadedProjects) => {
        if (isMounted) {
          setProjects(loadedProjects);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage('Could not load saved projects.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDelete(projectId: number) {
    if (!window.confirm('Delete this project?')) {
      return;
    }

    try {
      await deleteProjectAction(projectId);
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
    } catch {
      window.alert('Project delete failed.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="flex max-h-screen w-full max-w-3xl flex-col rounded-2xl border border-zinc-800 bg-black"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-zinc-100">Saved projects</h2>
            <p className="text-sm text-zinc-400">
              Open an existing project or delete the ones you do not need.
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-3 overflow-auto px-6 py-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-300">Find a project</p>
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by project name"
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
              Loading projects...
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="rounded-xl border border-rose-800 bg-black p-4 text-sm text-rose-300">
              {errorMessage}
            </div>
          ) : null}

          {!loading && !errorMessage && projects.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
              No saved projects yet.
            </div>
          ) : null}

          {!loading && !errorMessage && projects.length > 0 && visibleProjects.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
              No saved projects match this search.
            </div>
          ) : null}

          {!loading && !errorMessage
            ? visibleProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-100">{project.name}</p>
                    <div className="space-y-1 text-xs text-zinc-500">
                      <p>Created {formatProjectDate(project.created_at)}</p>
                      <p>Updated {formatProjectDate(project.updated_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => onLoadProject(project.id)}>Load project</Button>
                    <Button
                      variant="outline"
                      className="border-rose-800 text-rose-300 hover:bg-rose-950/40"
                      onClick={() => void handleDelete(project.id)}
                    >
                      Delete project
                    </Button>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
