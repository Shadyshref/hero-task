import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { StatusState } from '../types';

interface EditorHeaderProps {
  projectId: number | null;
  projectName: string;
  status: StatusState;
  canCopy: boolean;
  onProjectNameChange: (value: string) => void;
  onSave: () => void;
  onNew: () => void;
  onOpenProjects: () => void;
  onCopySmall: () => void;
  onCopyLarge: () => void;
  onPaste: () => void;
}

function getStatusClassName(statusType: StatusState['type']) {
  if (statusType === 'error') {
    return 'border border-rose-800 bg-black text-rose-300';
  }

  if (statusType === 'success') {
    return 'border border-emerald-800 bg-black text-emerald-300';
  }

  return 'border border-zinc-700 bg-black text-zinc-300';
}

export function EditorHeader({
  projectId,
  projectName,
  status,
  canCopy,
  onProjectNameChange,
  onSave,
  onNew,
  onOpenProjects,
  onCopySmall,
  onCopyLarge,
  onPaste,
}: EditorHeaderProps) {
  const statusMessage = status.message || 'Ready';

  return (
    <header className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-800 bg-black p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">Editor</p>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">Glyph Workspace</h1>
                <p className="max-w-2xl text-sm text-zinc-400">
                  Simple black workspace for arranging glyphs, saving projects, and copying SVG output.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusClassName(status.type)}`}>
                {statusMessage}
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                {projectId ? `Project #${projectId}` : 'Unsaved draft'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="space-y-2 xl:col-span-4">
              <p className="text-sm font-medium text-zinc-300">Project name</p>
              <Input
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2 xl:col-span-4">
              <p className="text-sm font-medium text-zinc-300">Project</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={onSave}>{projectId ? 'Update project' : 'Save project'}</Button>
                <Button variant="outline" onClick={onNew}>
                  New project
                </Button>
                <Button variant="outline" onClick={onOpenProjects}>
                  Saved projects
                </Button>
              </div>
            </div>

            <div className="space-y-2 xl:col-span-4">
              <p className="text-sm font-medium text-zinc-300">Clipboard</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={onCopySmall} disabled={!canCopy}>
                  Copy small SVG
                </Button>
                <Button variant="outline" onClick={onCopyLarge} disabled={!canCopy}>
                  Copy large SVG
                </Button>
                <Button variant="outline" onClick={onPaste}>
                  Paste
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
