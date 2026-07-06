# Aural Life

Conway's Game of Life as a musical instrument — a Tenori-on-style step sequencer where a
cellular automaton generates the music. The vertical axis is pitch (a piano-style scale),
live cells make sound as the simulation evolves, and the "life cycle" rate is the tempo.

Glowing terminal / audio-visualizer aesthetic. Zero setup, no dependencies, no build.

## Run it

Open `index.html` in any modern browser. Double-click the file, or:

```
open index.html        # macOS
```

Click on the grid to draw cells (or stamp classic patterns), press **Play**, and listen.

## Two ways it plays

- **Pulse** — each generation is one beat; all triggering cells sound together. Ambient, evolving chords.
- **Sweep** — a playhead scans columns like a step sequencer; the grid advances one
  generation per full sweep. Rhythmic, arpeggiated. The **→/←** toggle reverses the
  scan direction at will, even mid-play — the playhead keeps its place and walks back
  the other way.

## Beyond Conway

The **rule** picker swaps in other cellular automata, each with its own musical personality:
**highlife** (B36/S23, self-replicating), **seeds** (B2/S — everything dies each generation;
explosive, crackly), **day & night**, and **no death** (drones that only ever grow). Turn on
**rain** and the sim trickles in random cells whenever the population runs low, so it never
dies out — an infinite ambient generator. The **mutate** button lightly nudges cells around
the current pattern when you want a variation without wiping the board.

## Making it sound good

- **Pentatonic** scale (default) can't play a wrong note. Switch to full **Chromatic** piano
  for authenticity + dissonance, with an optional snap-to-scale safety net.
- Notes trigger on **newly born** cells by default (note onsets), not every live cell — toggle
  to "all live" for denser textures.
- Five built-in **voices** (bell, pad, pluck, drum, sine) plus a **custom** voice:
  waveform/FM, brightness, envelope, detune, drive, noise, and thump controls. Custom
  presets (dust, glass, rubber, laser, soft, kick) and the randomize button are good
  for finding odd little sweet spots quickly. Reverb,
  tempo-synced **echo** (dotted-eighth repeats), and volume sliders shape the mix.
- Turn on **arp** to make each triggering cell play a scale-based broken chord. The
  note count picks 1/3/5/7-note patterns, and the rate can run synced to the main
  tempo or free for looser motion.
- The **deaths** toggle gives dying cells their own voice — a dark, quiet tone an octave
  down. Call-and-response for free.
- Repeating Life patterns (blinkers, pulsars) become musical loops; gliders become moving
  melodies; a glider gun becomes an evolving stream. Use the stamp palette.

## Stamps

Beyond the classics (box, blinker, pulsar, glider, gun), you can save the current grid as a
named **custom stamp**, place it anywhere (with a footprint preview before you click), and
**share** it as a compact code or link that others can import.

The **sym** buttons mirror everything you draw or stamp (left-right, top-bottom, or both) —
symmetric seeds evolve symmetrically, so you get kaleidoscope patterns that sound structured.
Four gliders converging on the center is a good time.

## Look

Four glow themes (green, amber, cyan, magenta) plus a **custom** palette with separate
background / live / dying / hover colors. Optional dreamy **trails** fade cells out as
they die, and **drift** slowly cycles every color through the spectrum, lava-lamp style.

**Zen mode** (the `zen` button, or `z`) hides the whole panel and fills the window with just
the grid; if the pattern settles into a still life or dies out, it quietly reseeds itself.
Pair with rain + drift and leave it running.

## Sharing & saving

The **Copy link** button encodes your whole session — pattern, mode, tempo, scale, voice,
theme, sweep direction, rule, rain — into the URL; **load code** restores from a pasted link
or code. Save slots persist locally in the browser. **Moment** pads are short-form local
performance snapshots: click an empty pad to capture the current grid and sound settings,
click a filled pad to recall it, or option-click to overwrite.

Control groups can collapse down to their labels with the chevrons. Option-click a chevron
to solo one section when you only want the arp, voice, color, or stamp controls in view.

## Keys

`space` play/pause · `s` step one generation · `c` clear · `r` random fill · `m` mutate · `z` zen mode
(`esc` exits)

## Tech

Single self-contained `index.html`: vanilla JS, Canvas 2D for visuals, Web Audio API for
live sound synthesis (no samples or MIDI files). Core pure functions are exposed on
`window.AuralLife` for console tinkering and testing. Run the headless test suite with
`sh tests/run.sh` (works with Node or macOS JavaScriptCore).
