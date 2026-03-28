import type { EditorItem, GlyphDefinition } from '../types';
import { buildTransform, parseSvg, splitGlyphCodes } from './svg';

const DEFAULT_CELL_SIZE = 60;

interface TransformData {
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
  scale?: number;
}

function buildGlyphMap(glyphs: GlyphDefinition[]) {
  return new Map(glyphs.map((glyph) => [glyph.code, glyph]));
}

function createPasteItemId(index: number) {
  return `paste-${Date.now()}-${index}`;
}

function legacyCopyText(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let copied = false;

  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  document.body.removeChild(textArea);

  return copied;
}

function readTransformData(rawValue: string): TransformData {
  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(decodeURIComponent(rawValue)) as TransformData;

    return {
      rotation: typeof parsedValue.rotation === 'number' ? parsedValue.rotation : 0,
      flipX: parsedValue.flipX === true,
      flipY: parsedValue.flipY === true,
      scale: typeof parsedValue.scale === 'number' ? parsedValue.scale : 1,
    };
  } catch {
    return {};
  }
}

function readItemsFromSvgMarkup(markup: string, glyphMap: Map<string, GlyphDefinition>) {
  const document = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const glyphElements = Array.from(document.querySelectorAll('[data-glyph-code]'));
  const items: EditorItem[] = [];

  glyphElements.forEach((element, index) => {
    const code = (element.getAttribute('data-glyph-code') || '').toUpperCase();

    if (!glyphMap.has(code)) {
      return;
    }

    const transformData = readTransformData(element.getAttribute('data-glyph-transform') || '');

    items.push({
      id: createPasteItemId(index),
      code,
      positionIndex: index,
      rotation: typeof transformData.rotation === 'number' ? transformData.rotation : 0,
      flipX: transformData.flipX === true,
      flipY: transformData.flipY === true,
      scale: typeof transformData.scale === 'number' ? transformData.scale : 1,
    });
  });

  return items;
}

function readItemsFromText(text: string, glyphMap: Map<string, GlyphDefinition>) {
  const items: EditorItem[] = [];
  const trimmedText = text.trim();

  if (!trimmedText) {
    return items;
  }

  if (trimmedText.includes('<svg')) {
    return readItemsFromSvgMarkup(trimmedText, glyphMap);
  }

  const codes = splitGlyphCodes(trimmedText);

  codes.forEach((code: string, index: number) => {
    const upperCode = code.toUpperCase();

    if (!glyphMap.has(upperCode)) {
      return;
    }

    items.push({
      id: createPasteItemId(index),
      code: upperCode,
      positionIndex: index,
      rotation: 0,
      flipX: false,
      flipY: false,
      scale: 1,
    });
  });

  return items;
}

export function buildComposedSvg(
  items: EditorItem[],
  glyphs: GlyphDefinition[],
  cellSize = DEFAULT_CELL_SIZE
) {
  if (items.length === 0) {
    return '';
  }

  const totalWidth = items.length * cellSize;
  const totalHeight = cellSize;
  const glyphMap = buildGlyphMap(glyphs);

  const glyphMarkup = items
    .map((item, index) => {
      const glyph = glyphMap.get(item.code);

      if (!glyph) {
        return '';
      }

      const svgData = parseSvg(glyph.svgContent);
      const positionX = index * cellSize;
      const centerX = positionX + cellSize / 2;
      const centerY = cellSize / 2;
      const transform = buildTransform(item, centerX, centerY);
      const transformData = encodeURIComponent(
        JSON.stringify({
          rotation: item.rotation,
          flipX: item.flipX,
          flipY: item.flipY,
          scale: item.scale,
        })
      );

      return `<g data-glyph-code="${item.code}" data-glyph-transform="${transformData}" transform="${transform}"><svg x="${positionX}" y="0" width="${cellSize}" height="${cellSize}" viewBox="${svgData.viewBox}" preserveAspectRatio="xMidYMid meet" overflow="hidden">${svgData.innerMarkup}</svg></g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" data-hieroglyph-editor="true">${glyphMarkup}</svg>`;
}

export async function copyToClipboard(
  items: EditorItem[],
  glyphs: GlyphDefinition[],
  cellSize = DEFAULT_CELL_SIZE
) {
  if (items.length === 0) {
    throw new Error('Nothing to copy');
  }

  if (!navigator.clipboard) {
    throw new Error('Clipboard is not available');
  }

  const svgMarkup = buildComposedSvg(items, glyphs, cellSize);
  const plainText = items.map((item) => item.code).join(' ');

  if (typeof navigator.clipboard.write === 'function' && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
          'text/html': new Blob([svgMarkup], { type: 'text/html' }),
          'image/svg+xml': new Blob([svgMarkup], { type: 'image/svg+xml' }),
        }),
      ]);
      return;
    } catch {
      if (typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(svgMarkup || plainText);
        return;
      }
    }
  }

  if (typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(svgMarkup || plainText);
    return;
  }

  if (legacyCopyText(svgMarkup || plainText)) {
    return;
  }

  throw new Error('Clipboard write failed');
}

export async function pasteFromClipboard(glyphs: GlyphDefinition[]) {
  if (!navigator.clipboard) {
    return [];
  }

  const glyphMap = buildGlyphMap(glyphs);

  if (typeof navigator.clipboard.read === 'function') {
    const clipboardItems = await navigator.clipboard.read();

    for (const clipboardItem of clipboardItems) {
      if (clipboardItem.types.includes('image/svg+xml')) {
        const svgBlob = await clipboardItem.getType('image/svg+xml');
        const svgMarkup = await svgBlob.text();
        const items = readItemsFromSvgMarkup(svgMarkup, glyphMap);

        if (items.length > 0) {
          return items;
        }
      }

      if (clipboardItem.types.includes('text/html')) {
        const htmlBlob = await clipboardItem.getType('text/html');
        const html = await htmlBlob.text();
        const items = readItemsFromSvgMarkup(html, glyphMap);

        if (items.length > 0) {
          return items;
        }
      }
    }

    for (const clipboardItem of clipboardItems) {
      if (clipboardItem.types.includes('text/plain')) {
        const textBlob = await clipboardItem.getType('text/plain');
        const text = await textBlob.text();
        const items = readItemsFromText(text, glyphMap);

        if (items.length > 0) {
          return items;
        }
      }
    }
  }

  if (typeof navigator.clipboard.readText === 'function') {
    const text = await navigator.clipboard.readText();
    return readItemsFromText(text, glyphMap);
  }

  return [];
}
