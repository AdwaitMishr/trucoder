# TruCoder — mascot concepts (kimi batch)

3 new terminal-native mascot candidates, 24×24 stroke SVGs, `currentColor`-ready.
Distinct from existing: prompt, cursor, chevcat, window, cyclops.

---

## 1. blink

A single underscore cursor with two dot eyes floating above it — the command line waiting for input, personified.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 19h14"/>
  <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none"/>
  <circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none"/>
</svg>
```

**Why it works at 16px:** Only three elements — a horizontal bar and two dots — so it stays crisp and readable even when scaled down; the underscore reads as a cursor instantly.

---

## 2. caret

A blinking caret (text-insertion beam) with a subtle smile underneath — the friendliest possible "type here" symbol.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 4v10"/>
  <path d="M8 16.5c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5"/>
</svg>
```

**Why it works at 16px:** Just two strokes — a vertical line and a shallow curve — forming an unmistakable face-with-cursor silhouette that survives extreme reduction.

---

## 3. promptd

The `>_` prompt reimagined as a face: the `>` is a winking eye, the `_` is a straight mouth. Pure terminal, no extra chrome.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 8l4 4-4 4"/>
  <path d="M13 16h6"/>
</svg>
```

**Why it works at 16px:** Two glyphs that every developer recognizes instantly; the negative space between them reads as a face at small sizes without any extra detail to blur.

---

## Strongest pick: **blink**

It’s the most ownable — the underscore cursor is TruCoder’s current logo DNA, and adding two dot eyes gives it character without losing the minimal, terminal-native feel. At 16px it reduces to a clean, memorable mark that works as favicon, topbar chip, or app icon.
