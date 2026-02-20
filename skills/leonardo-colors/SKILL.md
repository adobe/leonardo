---
name: leonardo-colors
description: Generate accessible color themes using @adobe/leonardo-contrast-colors. Use when the user needs help building contrast-based color palettes, checking WCAG accessibility, creating adaptive themes, or using the Leonardo API.
---

# Leonardo Contrast Colors — Agent Skill

When helping users with **@adobe/leonardo-contrast-colors**, follow these steps. For full API details (parameters, types, setters), load `references/api.md` on demand.

## 1. Installation

```bash
npm i @adobe/leonardo-contrast-colors
```

ESM (recommended):

```js
import { Theme, Color, BackgroundColor, contrast, convertColorValue, luminance, createScale } from '@adobe/leonardo-contrast-colors';
```

## 2. Creating Color and BackgroundColor

### BackgroundColor

One per theme. Defines the background and the scale of grays (or other neutrals) at target ratios.

```js
const gray = new BackgroundColor({
  name: 'gray',
  colorKeys: ['#cacaca'],   // one or more keys to interpolate
  ratios: [2, 3, 4.5, 8]   // target contrast ratios (positive = darker than background)
});
```

### Color (foreground)

Defines a semantic color (e.g. blue, red) at specific contrast ratios.

```js
const blue = new Color({
  name: 'blue',
  colorKeys: ['#5CDBFF', '#0000FF'],  // interpolated in colorspace
  colorspace: 'LCH',                  // optional; default 'RGB'
  ratios: [3, 4.5]                    // e.g. large text (3:1), normal text (4.5:1)
});
```

**Parameters:**

- **name** — Used to prefix output names (e.g. `blue100`, `blue200`).
- **colorKeys** — Array of CSS color strings; the scale is interpolated between them.
- **colorspace** (or **colorSpace**) — Interpolation space: `'LCH'`, `'LAB'`, `'RGB'`, `'HSL'`, `'HSV'`, `'HSLuv'`, `'CAM02'`, `'CAM02p'`, `'OKLAB'`, `'OKLCH'`. Default `'RGB'`.
- **ratios** — Either an array of numbers (e.g. `[3, 4.5, 7]`) or an object mapping custom names to ratios (e.g. `{ 'blue--largeText': 3, 'blue--normalText': 4.5 }`).
- **smooth** — Optional boolean; bezier smoothing for interpolation (default `false`).
- **output** — Optional output format (default `'HEX'`); usually overridden by Theme.

**Negative ratios** — Use negative values (e.g. `-1.5`, `-3`) for colors lighter than the background (e.g. text on dark mode). Naming for negatives uses fractional increments (e.g. gray25, gray50).

## 3. Creating a Theme

Combine one BackgroundColor and one or more Colors with a lightness and optional contrast/saturation.

```js
const theme = new Theme({
  colors: [gray, blue, red],   // gray is BackgroundColor; blue, red are Color
  backgroundColor: gray,       // required; must be the BackgroundColor instance
  lightness: 97,               // 0–100; background lightness (e.g. 97 = light, 8 = dark)
  contrast: 1,                 // optional; multiplier for all ratios (default 1)
  saturation: 100,            // optional; 0–100 (default 100)
  output: 'HEX',               // optional; default 'HEX'
  formula: 'wcag2'             // optional; 'wcag2' (default) or 'wcag3' (APCA)
});
```

**Note:** `colors` should include the same BackgroundColor as the first element (or at least include it in the list) plus all foreground Colors. The Theme requires `backgroundColor` to be set to that BackgroundColor instance.

## 4. Reading theme output

Three getters:

- **theme.contrastColors** — Array: first element `{ background: '#...' }`, then one object per color with `name` and `values: [{ name, contrast, value }]`. Use for design tokens or CSS variable generation.
- **theme.contrastColorPairs** — Flat object: `{ gray100: '#e0e0e0', blue100: '#b18cff', ... }`. Use for quick lookups.
- **theme.contrastColorValues** — Flat array of color strings only.

Example iteration for CSS variables:

```js
for (const item of theme.contrastColors) {
  if (item.background) {
    document.documentElement.style.setProperty('--background', item.background);
  } else {
    for (const v of item.values) {
      document.documentElement.style.setProperty(`--${v.name}`, v.value);
    }
  }
}
```

## 5. Mutating a theme at runtime

After construction you can change:

- **theme.lightness = 8** — e.g. switch to dark background.
- **theme.contrast = 1.2** — increase contrast globally.
- **theme.saturation = 80** — reduce saturation.
- **theme.output = 'RGB'** — change output format.
- **theme.backgroundColor = otherBackgroundColor** — swap background (pass BackgroundColor instance).
- **theme.colors = [gray, blue, red, green]** — replace color list.

Adding/removing/updating colors:

- **theme.addColor = newColor** — Add a Color instance.
- **theme.removeColor = { name: 'red' }** or **theme.removeColor = redColorInstance** — Remove by name or by instance.
- **theme.updateColor = { name: 'red', ratios: [3, 4.5, 7] }** — Update a color’s ratios (or colorKeys, name, etc.) by name.

After any setter, re-read `theme.contrastColors` (or pairs/values); they are computed on access.

## 6. Utility functions

- **contrast(foregroundRgbArray, backgroundRgbArray, baseV?, method?)** — Returns contrast ratio. `method`: `'wcag2'` (default) or `'wcag3'`. RGB arrays are `[r, g, b]` (0–255). Use to check two colors without building a full theme.
- **convertColorValue(colorString, format, object?)** — Convert any supported color string to `format` (e.g. `'HEX'`, `'RGB'`, `'LCH'`). If `object === true`, returns channel object instead of string.
- **luminance(r, g, b)** — Relative luminance (0–1) for sRGB.
- **createScale({ swatches, colorKeys, colorSpace?, shift?, fullScale?, smooth?, distributeLightness?, sortColor?, asFun? })** — Build an interpolated scale (no contrast targeting). Returns array of color strings unless `asFun: true` (returns scale function). Useful for non-accessible palettes or stepping between keys.

## 7. Common accessibility recipes

- **WCAG 2 AA (normal text)** — Minimum 4.5:1. Use `ratios: [4.5]` or include 4.5 in ratios.
- **WCAG 2 AAA (normal text)** — Minimum 7:1. Use `ratios: [7]` or include 7.
- **WCAG 2 large text** — Minimum 3:1. Use `ratios: [3]` or include 3 for large text tokens.
- **WCAG 2 AA + large text** — Use `ratios: [3, 4.5]` and name via object if desired: `{ 'brand--large': 3, 'brand--normal': 4.5 }`.
- **WCAG 3 / APCA** — Set `formula: 'wcag3'` on Theme. Interpret APCA Lc values per WCAG 3 guidance; the library returns Lc for contrast when method is `'wcag3'`.

Recommendation: Prefer LCH or LAB for interpolation (`colorspace: 'LCH'`) for perceptually even scales.

## 8. Supported colorspaces and output formats

**Interpolation colorspaces (Color/BackgroundColor colorSpace, createScale):**  
LCH, LAB, RGB, HSL, HSV, HSLuv, CAM02, CAM02p, OKLAB, OKLCH.

**Output formats (Theme output, Color output, convertColorValue):**  
HEX, RGB, HSL, HSV, HSLuv, LAB, LCH, CAM02, CAM02p, OKLAB, OKLCH.

Values follow W3C CSS Color Module Level 4 (e.g. `lch(100% 0 360deg)`, `rgb(255 255 255)`).

---

For full parameter tables, setter lists, and type details, see **references/api.md**.
