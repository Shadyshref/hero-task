export interface EditorItem {
  id: string;
  code: string;
  positionIndex: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  scale: number;
}

export interface GlyphDefinition {
  code: string;
  label: string;
  svgContent: string;
}

export interface StatusState {
  message: string;
  type: 'idle' | 'success' | 'error';
}
