import type { EditorItem } from '../types';

export interface ParsedSvgData {
  innerMarkup: string;
  viewBox: string;
  width: number;
  height: number;
}

function readSvgElement(svgContent: string) {
  const document = new DOMParser().parseFromString(svgContent, 'image/svg+xml');
  return document.querySelector('svg');
}

function readDimension(value: string | null, fallbackValue: number) {
  if (!value) {
    return fallbackValue;
  }

  const parsedValue = Number.parseFloat(value);

  if (Number.isFinite(parsedValue)) {
    return parsedValue;
  }

  return fallbackValue;
}

function normalizeSpaces(text: string) {
  let cleanText = text
    .split('\r')
    .join(' ')
    .split('\n')
    .join(' ')
    .split('\t')
    .join(' ')
    .split(',')
    .join(' ')
    .trim();

  while (cleanText.includes('  ')) {
    cleanText = cleanText.split('  ').join(' ');
  }

  return cleanText;
}

function getViewBoxValues(viewBox: string) {
  const parts = normalizeSpaces(viewBox)
    .split(' ')
    .filter((value: string) => value.length > 0)
    .map((value: string) => Number.parseFloat(value));

  if (parts.length === 4 && parts.every((value) => Number.isFinite(value))) {
    return parts as [number, number, number, number];
  }

  return [0, 0, 18, 18] as const;
}

export function parseSvg(svgContent: string): ParsedSvgData {
  const svgElement = readSvgElement(svgContent);

  if (!svgElement) {
    return {
      innerMarkup: '',
      viewBox: '0 0 18 18',
      width: 18,
      height: 18,
    };
  }

  const width = readDimension(svgElement.getAttribute('width'), 18);
  const height = readDimension(svgElement.getAttribute('height'), 18);
  const viewBox = svgElement.getAttribute('viewBox') || `0 0 ${width} ${height}`;

  return {
    innerMarkup: svgElement.innerHTML,
    viewBox,
    width,
    height,
  };
}

export function buildTransform(
  item: Pick<EditorItem, 'rotation' | 'flipX' | 'flipY' | 'scale'>,
  centerX: number,
  centerY: number
) {
  const transformParts = [`translate(${centerX}, ${centerY})`];

  if (item.rotation !== 0) {
    transformParts.push(`rotate(${item.rotation})`);
  }

  if (item.flipX) {
    transformParts.push('scale(-1, 1)');
  }

  if (item.flipY) {
    transformParts.push('scale(1, -1)');
  }

  transformParts.push(`scale(${item.scale})`);
  transformParts.push(`translate(${-centerX}, ${-centerY})`);

  return transformParts.join(' ');
}

export function createThumbnailMarkup(svgContent: string, size = 48) {
  const svgData = parseSvg(svgContent);

  return `<svg width="${size}" height="${size}" viewBox="${svgData.viewBox}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${svgData.innerMarkup}</svg>`;
}

export function createEditorGlyphMarkup(
  svgContent: string,
  item: Pick<EditorItem, 'rotation' | 'flipX' | 'flipY' | 'scale'>,
  size = 56
) {
  const svgData = parseSvg(svgContent);
  const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = getViewBoxValues(svgData.viewBox);
  const centerX = viewBoxX + viewBoxWidth / 2;
  const centerY = viewBoxY + viewBoxHeight / 2;
  const transform = buildTransform(item, centerX, centerY);

  return `<svg width="${size}" height="${size}" viewBox="${svgData.viewBox}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><g transform="${transform}">${svgData.innerMarkup}</g></svg>`;
}

export function splitGlyphCodes(text: string) {
  const cleanText = normalizeSpaces(text);

  if (!cleanText) {
    return [];
  }

  return cleanText.split(' ').filter((value: string) => value.length > 0);
}
