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
- **Sweep** — a playhead scans columns left→right like a step sequencer; the grid advances one
  generation per full sweep. Rhythmic, arpeggiated.

## Making it sound good

- **Pentatonic** scale (default) can't play a wrong note. Switch to full **Chromatic** piano
  for authenticity + dissonance, with an optional snap-to-scale safety net.
- Notes trigger on **newly born** cells by default (note onsets), not every live cell — toggle
  to "all live" for denser textures.
- Repeating Life patterns (blinkers, pulsars) become musical loops; gliders become moving
  melodies; a glider gun becomes an evolving stream. Use the stamp palette.

## Sharing

The **Copy link** button encodes your pattern + settings into the URL. Save slots persist
locally in the browser.

## Tech

Single self-contained `index.html`: vanilla JS, Canvas 2D for visuals, Web Audio API for
live sound synthesis (no samples or MIDI files). Core pure functions are exposed on
`window.AuralLife` for console tinkering and testing.
