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

    // --- Pattern library: the "block" stamp is a real 2x2 still life ---
    (function () {
      eq(AL.PATTERNS.block.length, 4, 'block stamp has 4 cells');
      var cols = 4, rows = 4, g = AL.makeGrid(cols, rows);
      AL.PATTERNS.block.forEach(function (c) { g[(c[1] + 1) * cols + (c[0] + 1)] = 1; }); // place at (1,1)
      deepEq(AL.step(g, cols, rows).grid, g, 'block stamp is stable');
      checks.push('block stamp is a 2x2 still life');
    })();

    // --- Engine: died set reports only newly-dead cells ---
    (function () {
      var cols = 5, rows = 5, g = AL.makeGrid(cols, rows);
      g[2 * cols + 1] = g[2 * cols + 2] = g[2 * cols + 3] = 1; // horizontal blinker
      var died = AL.step(g, cols, rows).died;
      eq(died.length, 2, 'blinker 2 deaths');
      ok(died.indexOf(2 * cols + 1) >= 0 && died.indexOf(2 * cols + 3) >= 0, 'deaths are the end cells');
      checks.push('died set = newly-dead cells only');
    })();

    // --- Engine: alternate rules ---
    (function () {
      ok(AL.RULES && AL.RULES.life && AL.RULES.seeds && AL.RULES.nodeath, 'RULES table exported');
      // seeds (B2/S): a domino births its 2-neighbor cells and both originals die
      var cols = 5, rows = 5, g = AL.makeGrid(cols, rows);
      g[2 * cols + 1] = g[2 * cols + 2] = 1;
      var s = AL.step(g, cols, rows, AL.RULES.seeds);
      eq(s.grid[2 * cols + 1], 0, 'seeds: original dies');
      eq(s.grid[2 * cols + 2], 0, 'seeds: original dies (2)');
      eq(s.grid[1 * cols + 1], 1, 'seeds: 2-neighbor cell born');
      eq(s.died.length, 2, 'seeds: everything dies each gen');
      // nodeath (B3/S012345678): live cells never die
      var g2 = AL.makeGrid(cols, rows);
      g2[2 * cols + 1] = g2[2 * cols + 2] = g2[2 * cols + 3] = 1;
      var s2 = AL.step(g2, cols, rows, AL.RULES.nodeath);
      eq(s2.grid[2 * cols + 1], 1, 'nodeath: cell survives');
      eq(s2.died.length, 0, 'nodeath: no deaths');
      ok(s2.born.length > 0, 'nodeath: births still happen');
      // no rule argument = classic life (guards every older call site)
      var lifeDefault = AL.step(g2, cols, rows).grid;
      var lifeExplicit = AL.step(g2, cols, rows, AL.RULES.life).grid;
      deepEq(lifeDefault, lifeExplicit, 'default rule is classic life');
      checks.push('alternate rules (seeds, nodeath) + life default');
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
      var custom = { bg: '#010203', live: '#0a0b0c', dying: '#111213', hover: '#171819' };
      var state = { grid: grid, cols: cols, rows: rows, mode: 'sweep', sweepDir: -1, bpm: 137,
        scaleId: 'minpent', root: 7, snap: true, voice: 'pad', theme: 'custom', trigger: 'live', custom: custom };
      var dec = AL.decodeState(AL.encodeState(state));
      deepEq(dec.grid, grid, 'grid round-trip');
      eq(dec.cols, cols); eq(dec.rows, rows); eq(dec.mode, 'sweep'); eq(dec.bpm, 137);
      eq(dec.sweepDir, -1, 'reversed sweep direction round-trips');
      eq(dec.scaleId, 'minpent'); eq(dec.root, 7); eq(dec.snap, true);
      eq(dec.voice, 'pad'); eq(dec.theme, 'custom'); eq(dec.trigger, 'live');
      ok(dec.custom && dec.custom.bg === custom.bg && dec.custom.live === custom.live &&
         dec.custom.dying === custom.dying &&
         dec.custom.hover === custom.hover, 'custom palette round-trips');
      // no-custom case stays null
      var d2 = AL.decodeState(AL.encodeState({ grid: AL.makeGrid(4, 4), cols: 4, rows: 4,
        mode: 'pulse', bpm: 100, scaleId: 'majpent', root: 0, snap: false, voice: 'bell',
        theme: 'green', trigger: 'newborn' }));
      ok(d2.custom === null, 'absent custom palette decodes to null');
      eq(d2.sweepDir, 1, 'absent dir decodes to forward (old links stay valid)');
      checks.push('encode/decode round-trips pattern + settings + custom palette');
    })();

    // --- Persistence: rule + rain round-trip, defaults keep old links valid ---
    (function () {
      var base = { grid: AL.makeGrid(4, 4), cols: 4, rows: 4, mode: 'pulse', bpm: 100,
        scaleId: 'majpent', root: 0, snap: false, voice: 'bell', theme: 'green', trigger: 'newborn' };
      var d = AL.decodeState(AL.encodeState(Object.assign({}, base, { ruleId: 'seeds', rain: true })));
      eq(d.ruleId, 'seeds', 'rule round-trips');
      eq(d.rain, true, 'rain round-trips');
      var d2 = AL.decodeState(AL.encodeState(base));
      eq(d2.ruleId, 'life', 'absent rule decodes to classic life');
      eq(d2.rain, false, 'absent rain decodes to off');
      ok(AL.encodeState(Object.assign({}, base, { ruleId: 'life' })).indexOf('rule=') < 0,
         'classic life omits rule= from links');
      checks.push('rule + rain round-trip (old links stay valid)');
    })();

    // --- Persistence: custom voice round-trips only when voice is custom ---
    (function () {
      var cv = { wave: 'sawtooth', fm: 0.42, bright: 0.8, attack: 0.15, length: 0.6,
        detune: 0.22, drive: 0.33, noise: 0.44, thump: 0.55 };
      var base = { grid: AL.makeGrid(4, 4), cols: 4, rows: 4, mode: 'pulse', bpm: 100,
        scaleId: 'majpent', root: 0, snap: false, theme: 'green', trigger: 'newborn' };
      var withV = AL.decodeState(AL.encodeState(Object.assign({}, base, { voice: 'custom', customVoice: cv })));
      ok(withV.customVoice && withV.customVoice.wave === 'sawtooth' && withV.customVoice.fm === 0.42 &&
         withV.customVoice.bright === 0.8 && withV.customVoice.attack === 0.15 && withV.customVoice.length === 0.6 &&
         withV.customVoice.detune === 0.22 && withV.customVoice.drive === 0.33 &&
         withV.customVoice.noise === 0.44 && withV.customVoice.thump === 0.55,
         'custom voice round-trips');
      var noV = AL.decodeState(AL.encodeState(Object.assign({}, base, { voice: 'bell', customVoice: cv })));
      ok(noV.customVoice === null, 'custom voice omitted when voice is a preset');
      var legacy = AL.decodeState('p=A&c=1&r=1&m=pulse&bpm=100&s=majpent&root=0&snap=0&v=custom&t=green&trig=newborn&cv=sine-0.1-0.2-0.3-0.4');
      ok(legacy.customVoice && legacy.customVoice.wave === 'sine' && legacy.customVoice.fm === 0.1 &&
         legacy.customVoice.bright === 0.2 && legacy.customVoice.attack === 0.3 &&
         legacy.customVoice.length === 0.4 && legacy.customVoice.detune === 0 &&
         legacy.customVoice.drive === 0 && legacy.customVoice.noise === 0 && legacy.customVoice.thump === 0,
         'legacy custom voice decodes with new defaults');
      checks.push('custom voice round-trips (expanded + legacy, only when active)');
    })();

    // --- Persistence: arpeggio settings round-trip, defaults keep old links lean ---
    (function () {
      var base = { grid: AL.makeGrid(4, 4), cols: 4, rows: 4, mode: 'pulse', bpm: 100,
        scaleId: 'majpent', root: 0, snap: false, voice: 'bell', theme: 'green', trigger: 'newborn' };
      var arp = { on: true, notes: 7, sync: false, rate: 5 };
      var d = AL.decodeState(AL.encodeState(Object.assign({}, base, { arp: arp })));
      ok(d.arp && d.arp.on === true && d.arp.notes === 7 && d.arp.sync === false && d.arp.rate === 5,
         'arp settings round-trip');
      var d2 = AL.decodeState(AL.encodeState(Object.assign({}, base, { arp: { on: false, notes: 3, sync: true, rate: 3 } })));
      ok(d2.arp === null, 'default arp settings omit arp= from links');
      var d3 = AL.decodeState('p=A&c=1&r=1&m=pulse&bpm=100&s=majpent&root=0&snap=0&v=bell&t=green&trig=newborn');
      ok(d3.arp === null, 'absent arp decodes to null');
      checks.push('arp settings round-trip (defaults omitted)');
    })();

    // --- Shareable stamps: encode/decode round-trips cells + name ---
    (function () {
      var cells = [[0, 0], [2, 0], [1, 1], [0, 2], [4, 3]]; // arbitrary shape, w=5 h=4
      var name = 'my cool stamp.v2 & co';                   // dots, space, ampersand
      var s = AL.decodeStamp(AL.encodeStamp(name, cells));
      eq(s.name, name, 'stamp name round-trips');
      // order-independent cell comparison
      var norm = function (a) { return a.map(function (c) { return c[0] + ',' + c[1]; }).sort().join(';'); };
      eq(norm(s.cells), norm(cells), 'stamp cells round-trip');
      ok(AL.decodeStamp('garbage') === null, 'bad stamp code returns null');
      checks.push('shareable stamp code round-trips');
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
