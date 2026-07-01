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

## Making it sound good

- **Pentatonic** scale (default) can't play a wrong note. Switch to full **Chromatic** piano
  for authenticity + dissonance, with an optional snap-to-scale safety net.
- Notes trigger on **newly born** cells by default (note onsets), not every live cell — toggle
  to "all live" for denser textures.
- Four built-in **voices** (bell, pad, pluck, sine) plus a **custom** voice: a 5-slider
  synth (waveform, bell/FM amount, brightness, attack, length). Reverb and volume sliders
  shape the mix.
- Repeating Life patterns (blinkers, pulsars) become musical loops; gliders become moving
  melodies; a glider gun becomes an evolving stream. Use the stamp palette.

## Stamps

Beyond the classics (box, blinker, pulsar, glider, gun), you can save the current grid as a
named **custom stamp**, place it anywhere (with a footprint preview before you click), and
**share** it as a compact code or link that others can import.

## Look

Four glow themes (green, amber, cyan, magenta) plus a **custom** palette with separate
background / live / dying / hover colors. Optional dreamy **trails** fade cells out as
they die.

## Sharing & saving

The **Copy link** button encodes your whole session — pattern, mode, tempo, scale, voice,
theme, sweep direction — into the URL; **load code** restores from a pasted link or code.
Save slots persist locally in the browser.

## Keys

`space` play/pause · `s` step one generation · `c` clear · `r` random fill

## Tech

Single self-contained `index.html`: vanilla JS, Canvas 2D for visuals, Web Audio API for
live sound synthesis (no samples or MIDI files). Core pure functions are exposed on
`window.AuralLife` for console tinkering and testing. Run the headless test suite with
`sh tests/run.sh` (works with Node or macOS JavaScriptCore).
