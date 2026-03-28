import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import type { GlyphDefinition } from '../types';
import { GlyphTile } from './GlyphTile';

interface GlyphLibraryPanelProps {
  glyphs: GlyphDefinition[];
  onAddGlyph: (glyph: GlyphDefinition) => void;
}

export function GlyphLibraryPanel({ glyphs, onAddGlyph }: GlyphLibraryPanelProps) {
  const [searchText, setSearchText] = useState('');
  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredGlyphs = glyphs.filter((glyph) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      glyph.code.toLowerCase().includes(normalizedSearch) ||
      glyph.label.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="border-b border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">Glyph library</CardTitle>
            <CardDescription>Search by code or label, then click a glyph to add it.</CardDescription>
          </div>
          <div className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-400">
            {filteredGlyphs.length} results
          </div>
        </div>
        <Input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search glyphs"
          className="mt-3"
        />
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col pt-4">
        <ScrollArea className="h-full">
          {filteredGlyphs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
              No glyphs match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-2">
              {filteredGlyphs.map((glyph) => (
                <GlyphTile key={glyph.code} glyph={glyph} onAddGlyph={onAddGlyph} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
