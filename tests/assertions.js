// Environment-agnostic assertions for Aural Life's pure core.
// Defines global runTests(AL): returns a summary string, throws Error on failure.
// Runs under Node, browsers, and JavaScriptCore (osascript) alike — no imports.
(function (root) {
  "use strict";
  function eq(a, b, m) { if (a !== b) throw new Error((m || 'eq') + ': expected ' + b + ', got ' + a); }
  function ne(a, b, m) { if (a === b) throw new Error((m || 'ne') + ': did not expect ' + b); }
  function ok(c, m) { if (!c) throw new Error(m || 'assertion failed'); }
  function deepEq(a, b, m) {
    a = Array.prototype.slice.call(a); b = Array.prototype.slice.call(b);
    if (a.length !== b.length) throw new Error((m || 'deepEq') + ': length ' + a.length + ' vs ' + b.length);
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) throw new Error((m || 'deepEq') + ': index ' + i);
  }

  root.runTests = function (AL) {
    ok(AL, 'AuralLife core not loaded');
    var checks = [];

    // --- Engine: blinker oscillates with period 2 ---
    (function () {
      var cols = 5, rows = 5, g = AL.makeGrid(cols, rows);
      g[2 * cols + 1] = g[2 * cols + 2] = g[2 * cols + 3] = 1; // horizontal
      var s1 = AL.step(g, cols, rows).grid;
      eq(s1[1 * cols + 2], 1, 'blinker vertical top');
      eq(s1[2 * cols + 2], 1, 'blinker vertical mid');
      eq(s1[3 * cols + 2], 1, 'blinker vertical bot');
      eq(s1[2 * cols + 1], 0, 'blinker rotated');
      var s2 = AL.step(s1, cols, rows).grid;
      deepEq(s2, g, 'blinker period 2');
      checks.push('blinker oscillates (period 2)');
    })();

    // --- Engine: 2x2 block is a still life ---
    (function () {
      var cols = 4, rows = 4, g = AL.makeGrid(cols, rows);
      g[1 * cols + 1] = g[1 * cols + 2] = g[2 * cols + 1] = g[2 * cols + 2] = 1;
      var next = AL.step(g, cols, rows);
      deepEq(next.grid, g, 'block stable');
      eq(next.born.length, 0, 'block no births');
      checks.push('block is a still life');
    })();

    // --- Engine: born set reports only new cells ---
    (function () {
      var cols = 5, rows = 5, g = AL.makeGrid(cols, rows);
      g[2 * cols + 1] = g[2 * cols + 2] = g[2 * cols + 3] = 1;
      var born = AL.step(g, cols, rows).born;
      eq(born.length, 2, 'blinker 2 births');
      ok(born.indexOf(1 * cols + 2) >= 0 && born.indexOf(3 * cols + 2) >= 0, 'births are the new cells');
      checks.push('born set = newly-alive cells only');
    })();

    // --- Music: A2 bottom, A440, chromatic octaves ---
    (function () {
      eq(AL.rowToMidi(0, 'chromatic', 0, false), 45, 'bottom = A2 (midi 45)');
      eq(AL.rowToMidi(12, 'chromatic', 0, false), 57, 'octave up = +12');
      ok(Math.abs(AL.midiToFreq(69) - 440) < 1e-9, 'midi 69 = 440Hz');
      ok(Math.abs(AL.midiToFreq(45) - 110) < 1e-6, 'A2 = 110Hz');
      checks.push('chromatic row->midi->freq');
    })();

    // --- Music: pentatonic spans an octave every 5 rows ---
    (function () {
      eq(AL.rowToMidi(5, 'majpent', 0, false) - AL.rowToMidi(0, 'majpent', 0, false), 12, 'pentatonic octave');
      checks.push('pentatonic octave every 5 rows');
    })();

    // --- Music: snap-to-scale rounds chromatic to pentatonic ---
    (function () {
      var raw = AL.rowToMidi(1, 'chromatic', 0, false);
      var snapped = AL.rowToMidi(1, 'chromatic', 0, true);
      ne(snapped, raw, 'off-scale note moved by snap');
      var rel = ((snapped - AL.BASE_MIDI) % 12 + 12) % 12;
      ok(AL.SCALES.majpent.indexOf(rel) >= 0, 'snapped lands on pentatonic degree');
      checks.push('snap-to-scale quantizes to pentatonic');
    })();

    // --- Persistence: encode/decode round-trip ---
    (function () {
      var cols = 48, rows = 24, grid = AL.makeGrid(cols, rows);
      for (var i = 0; i < grid.length; i++) grid[i] = (i * 2654435761 % 10) < 3 ? 1 : 0; // deterministic
      var state = { grid: grid, cols: cols, rows: rows, mode: 'sweep', bpm: 137,
        scaleId: 'minpent', root: 7, snap: true, voice: 'pad', theme: 'cyan', trigger: 'live' };
      var dec = AL.decodeState(AL.encodeState(state));
      deepEq(dec.grid, grid, 'grid round-trip');
      eq(dec.cols, cols); eq(dec.rows, rows); eq(dec.mode, 'sweep'); eq(dec.bpm, 137);
      eq(dec.scaleId, 'minpent'); eq(dec.root, 7); eq(dec.snap, true);
      eq(dec.voice, 'pad'); eq(dec.theme, 'cyan'); eq(dec.trigger, 'live');
      checks.push('encode/decode round-trips pattern + settings');
    })();

    // --- Persistence: bit pack/unpack lossless across byte boundary ---
    (function () {
      var g = AL.makeGrid(50, 1);
      g[0] = g[7] = g[8] = g[49] = 1;
      deepEq(AL.unpackGrid(AL.packGrid(g), g.length), g, 'bit-pack lossless');
      checks.push('grid bit-pack/unpack lossless');
    })();

    return checks.length + ' checks passed:\n  - ' + checks.join('\n  - ');
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
