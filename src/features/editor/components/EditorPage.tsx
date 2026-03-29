'use client';

import { useEffect, useState } from 'react';
import { GLYPH_LIBRARY } from '../data/glyph-library';
import { EditorCanvasPanel } from './EditorCanvasPanel';
import { EditorHeader } from './EditorHeader';
import { GlyphLibraryPanel } from './GlyphLibraryPanel';
import { InspectorPanel } from './InspectorPanel';
import {
  DEFAULT_PROJECT_NAME,
  createEditorItem,
  createItemId,
  normalizeItems,
  readProjectItems,
} from '../utils/editor-helpers';
import { copyToClipboard, pasteFromClipboard } from '../utils/clipboard';
import type { EditorItem, StatusState } from '../types';
import { createProject, fetchProject, updateProject } from '../../projects/api/projects';
import { ProjectsDialog } from '../../projects/components/ProjectsDialog';

export default function EditorPage() {
  const [items, setItems] = useState<EditorItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [status, setStatus] = useState<StatusState>({ message: '', type: 'idle' });

  const glyphs = GLYPH_LIBRARY;
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const itemsToCopy = selectedItems.length > 0 ? selectedItems : items;

  useEffect(() => {
    if (!status.message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatus({ message: '', type: 'idle' });
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [status.message]);

  function showStatus(message: string, type: 'success' | 'error') {
    setStatus({ message, type });
  }

  function handleAddGlyph(code: string) {
    setItems((currentItems) => [...currentItems, createEditorItem(code, currentItems.length)]);
  }

  function handleSelectItem(itemId: string, allowMultiple: boolean) {
    if (allowMultiple) {
      setSelectedIds((currentIds) => {
        if (currentIds.includes(itemId)) {
          return currentIds.filter((currentId) => currentId !== itemId);
        }

        return [...currentIds, itemId];
      });
      return;
    }

    setSelectedIds((currentIds) => {
      if (currentIds.length === 1 && currentIds[0] === itemId) {
        return [];
      }

      return [itemId];
    });
  }

  function handleTransformSelection(
    change: Partial<Pick<EditorItem, 'rotation' | 'flipX' | 'flipY' | 'scale'>>
  ) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }

        return {
          ...item,
          ...change,
        };
      })
    );
  }

  function handleDeleteSelection() {
    setItems((currentItems) => normalizeItems(currentItems.filter((item) => !selectedIds.includes(item.id))));
    setSelectedIds([]);
  }

  async function handleSaveProject() {
    const nextProjectName = projectName.trim();

    if (!nextProjectName) {
      showStatus('Enter a project name before saving.', 'error');
      return;
    }

    try {
      if (projectId) {
        await updateProject(projectId, nextProjectName, items);
        setProjectName(nextProjectName);
        showStatus('Project updated.', 'success');
        return;
      }

      const createdProject = await createProject(nextProjectName, items);
      setProjectId(createdProject.id);
      setProjectName(nextProjectName);
      showStatus('Project saved.', 'success');
    } catch {
      showStatus('Project save failed.', 'error');
    }
  }

  async function handleLoadProject(projectToLoadId: number) {
    try {
      const project = await fetchProject(projectToLoadId);
      const loadedItems = readProjectItems(project.items);

      setItems(loadedItems);
      setSelectedIds([]);
      setProjectId(project.id);
      setProjectName(project.name);
      setIsProjectsOpen(false);
      showStatus(`Loaded ${project.name}.`, 'success');
    } catch {
      showStatus('Project load failed.', 'error');
    }
  }

  function handleNewProject() {
    if (items.length > 0 && !window.confirm('Start a new project? Unsaved changes will be lost.')) {
      return;
    }

    setItems([]);
    setSelectedIds([]);
    setProjectId(null);
    setProjectName(DEFAULT_PROJECT_NAME);
    showStatus('Started a new project.', 'success');
  }

  async function handleCopy(cellSize: number, label: string) {
    if (itemsToCopy.length === 0) {
      showStatus('Add or select glyphs before copying.', 'error');
      return;
    }

    try {
      await copyToClipboard(itemsToCopy, glyphs, cellSize);
      showStatus(`Copied ${itemsToCopy.length} glyphs with the ${label} preset.`, 'success');
    } catch {
      showStatus('Copy failed. Check clipboard permissions.', 'error');
    }
  }

  async function handlePaste() {
    try {
      const pastedItems = await pasteFromClipboard(glyphs);

      if (pastedItems.length === 0) {
        showStatus('Nothing to paste.', 'error');
        return;
      }

      setItems((currentItems) =>
        normalizeItems([
          ...currentItems,
          ...pastedItems.map((item) => ({
            ...item,
            id: createItemId(),
          })),
        ])
      );
      showStatus(`Pasted ${pastedItems.length} glyphs.`, 'success');
    } catch {
      showStatus('Paste failed. Check clipboard permissions.', 'error');
    }
  }

  return (
    <div className="min-h-screen bg-black pb-8">
      <EditorHeader
        projectId={projectId}
        projectName={projectName}
        status={status}
        canCopy={itemsToCopy.length > 0}
        onProjectNameChange={setProjectName}
        onSave={handleSaveProject}
        onNew={handleNewProject}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onCopySmall={() => void handleCopy(40, 'small')}
        onCopyLarge={() => void handleCopy(80, 'large')}
        onPaste={handlePaste}
      />

      <main className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="min-h-0 xl:col-span-3">
            <GlyphLibraryPanel glyphs={glyphs} onAddGlyph={(glyph) => handleAddGlyph(glyph.code)} />
          </div>

          <div className="min-h-0 xl:col-span-6">
            <EditorCanvasPanel
              items={items}
              glyphs={glyphs}
              selectedIds={selectedIds}
              onSelectItem={handleSelectItem}
              onClearSelection={() => setSelectedIds([])}
            />
          </div>

          <div className="min-h-0 xl:col-span-3">
            <InspectorPanel
              selectedItems={selectedItems}
              glyphs={glyphs}
              onTransformSelection={handleTransformSelection}
              onDeleteSelection={handleDeleteSelection}
            />
          </div>
        </div>
      </main>

      {isProjectsOpen ? (
        <ProjectsDialog
          onClose={() => setIsProjectsOpen(false)}
          onLoadProject={handleLoadProject}
        />
      ) : null}
    </div>
  );
}
