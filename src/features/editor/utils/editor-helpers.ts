import type { ProjectRecord } from '../../projects/types';
import type { EditorItem } from '../types';

export const DEFAULT_PROJECT_NAME = 'Untitled project';

function readSavedItem(value: unknown, index: number): EditorItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Partial<EditorItem>;

  if (typeof item.code !== 'string' || item.code.trim().length === 0) {
    return null;
  }

  return {
    id: typeof item.id === 'string' && item.id.length > 0 ? item.id : createItemId(),
    code: item.code.toUpperCase(),
    positionIndex: index,
    rotation: typeof item.rotation === 'number' ? item.rotation : 0,
    flipX: item.flipX === true,
    flipY: item.flipY === true,
    scale: typeof item.scale === 'number' ? item.scale : 1,
  };
}

export function createItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEditorItem(code: string, positionIndex: number): EditorItem {
  return {
    id: createItemId(),
    code,
    positionIndex,
    rotation: 0,
    flipX: false,
    flipY: false,
    scale: 1,
  };
}

export function normalizeItems(items: EditorItem[]) {
  return items.map((item, index) => ({
    ...item,
    positionIndex: index,
  }));
}

export function readProjectItems(projectItems: ProjectRecord['items']) {
  const rawItems = Array.isArray(projectItems)
    ? projectItems
    : typeof projectItems === 'string' && projectItems.trim().length > 0
      ? JSON.parse(projectItems)
      : [];

  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item, index) => readSavedItem(item, index))
    .filter((item): item is EditorItem => item !== null);
}
