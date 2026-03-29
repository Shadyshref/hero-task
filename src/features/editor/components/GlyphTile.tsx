import { createThumbnailMarkup } from '../utils/svg';
import type { GlyphDefinition } from '../types';

interface GlyphTileProps {
  glyph: GlyphDefinition;
  onAddGlyph: (glyph: GlyphDefinition) => void;
}

export function GlyphTile({ glyph, onAddGlyph }: GlyphTileProps) {
  const thumbnailMarkup = createThumbnailMarkup(glyph.svgContent, 48);

  return (
    <button
      type="button"
      onClick={() => onAddGlyph(glyph)}
      className="group flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-black p-3 text-center transition-colors hover:border-zinc-700 hover:bg-zinc-950"
      title={`${glyph.code} - ${glyph.label}`}
    >
      <div
        className="flex h-20 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100"
        dangerouslySetInnerHTML={{ __html: thumbnailMarkup }}
      />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-zinc-100">{glyph.code}</p>
        <p className="text-xs text-zinc-500">{glyph.label}</p>
      </div>
    </button>
  );
}
