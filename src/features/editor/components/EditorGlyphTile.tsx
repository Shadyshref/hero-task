import type { MouseEvent } from 'react';
import { createEditorGlyphMarkup } from '../utils/svg';
import type { EditorItem, GlyphDefinition } from '../types';

interface EditorGlyphTileProps {
  item: EditorItem;
  glyph: GlyphDefinition | undefined;
  isSelected: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function EditorGlyphTile({ item, glyph, isSelected, onClick }: EditorGlyphTileProps) {
  if (!glyph) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-40 flex-col items-center gap-3 rounded-xl border border-rose-800 bg-black p-4 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-rose-800 bg-zinc-950 text-sm font-semibold text-rose-300">
          Missing
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-rose-300">{item.code}</p>
          <p className="text-xs text-rose-400">This glyph could not be loaded.</p>
        </div>
      </button>
    );
  }

  const glyphMarkup = createEditorGlyphMarkup(glyph.svgContent, item, 56);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`flex w-40 flex-col items-center gap-3 rounded-xl border p-4 text-center transition-colors ${
        isSelected
          ? 'border-white bg-zinc-950'
          : 'border-zinc-800 bg-black hover:border-zinc-700 hover:bg-zinc-950'
      }`}
      title={`${item.code} - ${glyph.label}`}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
        dangerouslySetInnerHTML={{ __html: glyphMarkup }}
      />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-zinc-100">{item.code}</p>
        <p className="text-xs text-zinc-400">{glyph.label}</p>
        <p className="text-xs text-zinc-500">
          Rot {item.rotation} | Scale {item.scale.toFixed(1)}
        </p>
      </div>
    </button>
  );
}
