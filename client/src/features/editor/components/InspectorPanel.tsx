import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import type { EditorItem, GlyphDefinition } from '../types';

interface InspectorPanelProps {
  selectedItems: EditorItem[];
  glyphs: GlyphDefinition[];
  onTransformSelection: (
    change: Partial<Pick<EditorItem, 'rotation' | 'flipX' | 'flipY' | 'scale'>>
  ) => void;
  onDeleteSelection: () => void;
}

export function InspectorPanel({
  selectedItems,
  glyphs,
  onTransformSelection,
  onDeleteSelection,
}: InspectorPanelProps) {
  const firstSelectedItem = selectedItems[0];
  const selectedGlyph = glyphs.find((glyph) => glyph.code === firstSelectedItem?.code);

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="text-lg">Selection</CardTitle>
        <CardDescription>Adjust rotation, flip, scale, or remove the selected glyphs.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {selectedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
            Select a glyph in the workspace to edit it here.
          </div>
        ) : (
          <>
            <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Code</p>
                <p className="mt-1 text-sm font-semibold text-zinc-100">
                  {selectedItems.length === 1 ? firstSelectedItem.code : `${selectedItems.length} glyphs`}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Label</p>
                <p className="mt-1 text-sm text-zinc-100">
                  {selectedItems.length === 1 ? selectedGlyph?.label || 'Selected glyph' : 'Batch edit mode'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rotation</p>
                <p className="mt-1 text-sm text-zinc-100">{firstSelectedItem.rotation} deg</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Scale</p>
                <p className="mt-1 text-sm text-zinc-100">{firstSelectedItem.scale.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rotation</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    onTransformSelection({
                      rotation: (firstSelectedItem.rotation + 90) % 360,
                    })
                  }
                >
                  Rotate 90
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    onTransformSelection({
                      rotation: (firstSelectedItem.rotation + 180) % 360,
                    })
                  }
                >
                  Rotate 180
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => onTransformSelection({ rotation: 0 })}>
                Reset rotation
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Flip</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={firstSelectedItem.flipX ? 'default' : 'outline'}
                  onClick={() => onTransformSelection({ flipX: !firstSelectedItem.flipX })}
                >
                  Flip horizontal
                </Button>
                <Button
                  variant={firstSelectedItem.flipY ? 'default' : 'outline'}
                  onClick={() => onTransformSelection({ flipY: !firstSelectedItem.flipY })}
                >
                  Flip vertical
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Scale</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    onTransformSelection({
                      scale: Math.min(3, Number((firstSelectedItem.scale + 0.1).toFixed(2))),
                    })
                  }
                >
                  Increase scale
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    onTransformSelection({
                      scale: Math.max(0.2, Number((firstSelectedItem.scale - 0.1).toFixed(2))),
                    })
                  }
                >
                  Decrease scale
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => onTransformSelection({ scale: 1 })}>
                Reset scale
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Remove</p>
              <Button
                variant="outline"
                className="w-full border-rose-800 text-rose-300 hover:bg-rose-950/40"
                onClick={onDeleteSelection}
              >
                Delete selection
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
