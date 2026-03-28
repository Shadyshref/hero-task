const fs = require('node:fs/promises');
const path = require('node:path');

const OWNER = 'rosmord';
const REPO = 'jsesh';
const REF = 'master';
const DIRECTORY_PATH = 'jseshGlyphs/src/main/resources/jseshGlyphs';
const TREE_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${REF}?recursive=1`;
const RAW_CONTENT_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}`;
const OUTPUT_PATH = path.join(__dirname, 'client', 'src', 'glyphLibrary.ts');
const FETCH_CONCURRENCY = 8;

// Optional curated subset if you want a smaller generated file.
const COMMON_CODES = [
  'A1',
  'A2',
  'A13',
  'A40',
  'B1',
  'D1',
  'D4',
  'D21',
  'D28',
  'D36',
  'D46',
  'E1',
  'E17',
  'F4',
  'G1',
  'G17',
  'G43',
  'M1',
  'M17',
  'N1',
  'N5',
  'N35',
  'O1',
  'O4',
  'Q3',
  'R8',
  'S29',
  'X1',
  'Z1',
  'Z2',
  'Z3',
  'Z4',
];

const SHOULD_FETCH_ALL = !process.argv.includes('--subset');

if (typeof fetch !== 'function') {
  throw new Error('This script requires Node.js 18+ because it uses the native fetch API.');
}

function buildHeaders(accept = 'application/vnd.github+json') {
  const headers = {
    Accept: accept,
    'User-Agent': 'hero-task-fetch-glyphs',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: buildHeaders('application/vnd.github+json'),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(formatHttpError(url, response.status, response.statusText, body));
  }

  return response.json();
}

async function fetchRawText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'hero-task-fetch-glyphs',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(formatHttpError(url, response.status, response.statusText, body));
  }

  return response.text();
}

function formatHttpError(url, status, statusText, body) {
  const details = body ? `\n${body}` : '';
  return `GitHub request failed for ${url}\n${status} ${statusText}${details}`;
}

function encodeRepoPath(filePath) {
  return filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function escapeForTemplateLiteral(value) {
  return value
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function compareGlyphCodes(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function buildTypeScriptModule(entries) {
  const lines = [
    "import type { GlyphDef } from './types';",
    '',
    'export const GLYPH_LIBRARY: GlyphDef[] = [',
  ];

  for (const entry of entries) {
    lines.push('  {');
    lines.push(`    code: '${entry.code}',`);
    lines.push(`    label: '${entry.label}',`);
    lines.push(`    svgContent: \`${escapeForTemplateLiteral(entry.svgContent)}\`,`);
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');

  return lines.join('\n');
}

async function listDirectorySvgFiles() {
  console.log(`Listing SVG files from ${OWNER}/${REPO} (${REF})...`);

  // The GitHub "contents" endpoint only returns up to 1,000 directory entries.
  // This folder is larger than that, so we list the repo tree and filter down.
  const treeResponse = await fetchJson(TREE_API_URL);

  if (!Array.isArray(treeResponse.tree)) {
    throw new Error('Unexpected Git tree response: missing "tree" array.');
  }

  if (treeResponse.truncated) {
    throw new Error(
      'GitHub returned a truncated repository tree. Re-run with a GITHUB_TOKEN or narrow the search.'
    );
  }

  const directoryPrefix = `${DIRECTORY_PATH}/`;

  return treeResponse.tree.filter((entry) => {
    if (entry.type !== 'blob') {
      return false;
    }

    if (!entry.path.startsWith(directoryPrefix) || !entry.path.endsWith('.svg')) {
      return false;
    }

    const relativePath = entry.path.slice(directoryPrefix.length);
    return !relativePath.includes('/');
  });
}

function mapEntriesByCode(svgEntries) {
  const entriesByCode = new Map();

  for (const entry of svgEntries) {
    const code = path.basename(entry.path, '.svg').toUpperCase();
    entriesByCode.set(code, entry);
  }

  return entriesByCode;
}

async function fetchGlyphSvg(entry) {
  const fileUrl = `${RAW_CONTENT_BASE}/${encodeRepoPath(entry.path)}`;
  const svgContent = (await fetchRawText(fileUrl)).replace(/\r\n/g, '\n').trim();

  return {
    code: path.basename(entry.path, '.svg').toUpperCase(),
    label: `${path.basename(entry.path, '.svg').toUpperCase()} glyph`,
    svgContent,
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function main() {
  const directoryEntries = await listDirectorySvgFiles();
  const entriesByCode = mapEntriesByCode(directoryEntries);

  let selectedCodes;

  if (SHOULD_FETCH_ALL) {
    selectedCodes = Array.from(entriesByCode.keys()).sort(compareGlyphCodes);
    console.log(`Found ${selectedCodes.length} SVG files in ${DIRECTORY_PATH}. Fetching all of them...`);
  } else {
    const foundCodes = COMMON_CODES.filter((code) => entriesByCode.has(code));
    const missingCodes = COMMON_CODES.filter((code) => !entriesByCode.has(code));

    console.log(`Requested ${COMMON_CODES.length} common glyphs; found ${foundCodes.length} matching SVG files.`);

    if (missingCodes.length > 0) {
      console.warn(`Missing glyphs: ${missingCodes.join(', ')}`);
    }

    selectedCodes = foundCodes;
  }

  const libraryEntries = await mapWithConcurrency(selectedCodes, FETCH_CONCURRENCY, async (code, index) => {
    console.log(`Fetching ${code}.svg (${index + 1}/${selectedCodes.length})...`);
    const entry = entriesByCode.get(code);
    return fetchGlyphSvg(entry);
  });

  const fileContents = buildTypeScriptModule(libraryEntries);

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, fileContents, 'utf8');

  console.log(`Wrote ${libraryEntries.length} glyphs to ${OUTPUT_PATH}`);
  console.log(`Mode: ${SHOULD_FETCH_ALL ? 'all glyphs' : 'common subset (--subset)'}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
