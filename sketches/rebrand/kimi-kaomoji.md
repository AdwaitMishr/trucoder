# TruCoder — `>_<` kaomoji mascot (kimi batch)

3 variants of the approved `>_<` grimace concept — chevron eyes (`>` left, `<` right, symmetric about the vertical axis), underscore mouth. All are raw inline SVGs, `viewBox="0 0 24 24"`, `stroke-width="1.8"`, round caps/joins, `fill="none"`, **`stroke="currentColor"` only** (no solid details, no gradients) — they inherit the theme accent. Each was XML-validated, programmatically verified symmetric about `x=12`, and render-tested at 16px / 24px / 192px on the dark theme.

Distinct from prior concepts (blink, caret, promptd, chevcat, window, cyclops) — these are the single `>_<` face, refined.

---

## 1. grimace

The bare face, normalized: two crisp straight-arm chevrons (round-joined at the apex, marker-like) as the eyes, one centered underscore as the mouth. No container — the glyphs are the whole mark.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6.6 7.2 L9.4 9.5 L6.6 11.8"/>
  <path d="M17.4 7.2 L14.6 9.5 L17.4 11.8"/>
  <path d="M8.4 15.6 H15.6"/>
</svg>
```

**Why it works at 16px:** Only three strokes — two chevrons and one bar — with generous negative space between them, so the face reads instantly even at favicon size; nothing to blur or collide.

---

## 2. chip

The `>_<` face set inside the old logo's rounded-square chip (`rect`, `rx=5.5`, same container the current mark uses). The face is compressed and nudged down slightly to sit optically centered in the frame.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="2.5" width="20" height="19" rx="5.5"/>
  <path d="M7.3 8.4 L9.7 10.3 L7.3 12.2"/>
  <path d="M16.7 8.4 L14.3 10.3 L16.7 12.2"/>
  <path d="M9.2 15.2 H14.8"/>
</svg>
```

**Why it works at 16px:** The chip is a single unbroken silhouette with the face cut out of it, so it reads as one solid logo tile — the most legible and most "app icon" of the three at the smallest size.

---

## 3. grounds

The `>_<` face lifted up, with a short wide bar below it — a ground / block-cursor "floor" the face stands on. The bar is deliberately wider than the mouth and dropped well clear of it, so it reads as a platform, not a second mouth.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6.6 5.4 L9.4 7.7 L6.6 10"/>
  <path d="M17.4 5.4 L14.6 7.7 L17.4 10"/>
  <path d="M8.6 12.8 H15.4"/>
  <path d="M7.4 17.6 H16.6"/>
</svg>
```

**Why it works at 16px:** The mouth (short) and the ground bar (wide) are far enough apart vertically that they stay two separate strokes at 16px — the face reads as a character standing on a terminal cursor, not as an equals sign. (An earlier tighter version merged into "=" at 16px; this spacing fixes that.)

---

## Recommendation: **chip**

It's the strongest trade of the three. The rounded-square container is the old logo's DNA, so `chip` evolves the current mark instead of replacing it — the same tile, now with a face in it. It's the most legible at 16px (one closed silhouette reads better tiny than three floating strokes), it drops straight into the existing topbar chip / favicon slot with zero layout changes, and it still keeps the `>_<` grimace as the unmistakable identity. `grimace` is the pick if you want the purest, most terminal-native glyph version for inline use (e.g. next to the wordmark in text); `grounds` is the most characterful but the busiest, and its ground bar is the first thing to get muddy at small sizes.
