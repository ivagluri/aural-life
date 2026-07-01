// Node smoke test for Aural Life's pure core.
// Extracts the <script id="al-core"> block from index.html, evaluates it, and
// runs the shared assertions in tests/assertions.js.
//
//   node tests/smoke.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(dir, '..', 'index.html'), 'utf8');
const m = html.match(/<script id="al-core">([\s\S]*?)<\/script>/);
if (!m) throw new Error('al-core script block not found in index.html');

// Evaluate the core IIFE (attaches AuralLife to globalThis in node).
(0, eval)(m[1]);
// Load shared assertions (defines globalThis.runTests).
(0, eval)(fs.readFileSync(path.join(dir, 'assertions.js'), 'utf8'));

console.log(globalThis.runTests(globalThis.AuralLife));
