import type { MouseEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import type { EditorItem, GlyphDefinition } from '../types';
import { EditorGlyphTile } from './EditorGlyphTile';

interface EditorCanvasPanelProps {
  items: EditorItem[];
  glyphs: GlyphDefinition[];
  selectedIds: string[];
  onSelectItem: (itemId: string, allowMultiple: boolean) => void;
  onClearSelection: () => void;
}

export function EditorCanvasPanel({
  items,
  glyphs,
  selectedIds,
  onSelectItem,
  onClearSelection,
}: EditorCanvasPanelProps) {
  const sortedItems = [...items].sort((firstItem, secondItem) => {
    return firstItem.positionIndex - secondItem.positionIndex;
  });

  const glyphMap = new Map(glyphs.map((glyph) => [glyph.code, glyph]));

  function handleClick(itemId: string, event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onSelectItem(itemId, event.ctrlKey || event.metaKey);
  }

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="border-b border-zinc-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Workspace</CardTitle>
            <CardDescription>
              Click a glyph to select it. Hold Ctrl or Command to select more than one.
            </CardDescription>
          </div>
          <p className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-zinc-400">
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : `${items.length} ${items.length === 1 ? 'glyph' : 'glyphs'}`}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 p-4">
        <div
          className="flex h-full min-h-full w-full flex-wrap content-start gap-4 overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
          onClick={onClearSelection}
        >
          {sortedItems.length === 0 ? (
            <div className="flex h-full min-h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-black p-8 text-center">
              <p className="text-base font-semibold text-zinc-100">Start by adding a glyph</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Pick one from the library to begin building your layout.
              </p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <EditorGlyphTile
                key={item.id}
                item={item}
                glyph={glyphMap.get(item.code)}
                isSelected={selectedIds.includes(item.id)}
                onClick={(event) => handleClick(item.id, event)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
