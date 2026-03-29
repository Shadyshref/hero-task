import type { EditorItem } from '../editor/types';

export interface ProjectRecord {
  id: number;
  name: string;
  items: EditorItem[] | string;
  svg_snapshot?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectSummary {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
