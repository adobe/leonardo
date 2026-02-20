# @adobe/leonardo-contrast-colors — Full API Reference

This document is the detailed API reference for the Leonardo Contrast Colors library. Use it when you need parameter types, setters, or output shapes.

---

## Theme

Class that generates adaptive contrast-based colors from a background and a list of colors with target ratios.

### Constructor

`new Theme({ colors, backgroundColor, lightness, contrast?, saturation?, output?, formula? })`

| Parameter         | Type             | Required | Description                                                                 |
| ----------------- | ---------------- | -------- | --------------------------------------------------------------------------- |
| `colors`          | `Color[]`        | Yes      | List of Color instances (typically includes one BackgroundColor plus foreground Colors). |
| `backgroundColor` | `BackgroundColor`| Yes      | The theme background; must be a BackgroundColor instance.                  |
| `lightness`       | `number`         | Yes      | 0–100; lightness of the generated background.                              |
| `contrast`        | `number`         | No       | Multiplier for all contrast ratios (default `1`).                           |
| `saturation`      | `number`         | No       | 0–100; saturation of generated colors (default `100`).                      |
| `output`          | `Colorspace`     | No       | Output format (default `'HEX'`).                                            |
| `formula`         | `'wcag2' \| 'wcag3'` | No   | Contrast formula (default `'wcag2'`). `'wcag3'` = APCA.                      |

### Getters (read-only)

| Getter                | Return type | Description |
| --------------------- | ----------- | ----------- |
| `theme.contrastColors`| Array       | First element `{ background: CssColor }`; rest `{ name: string, values: Array<{ name, contrast, value }> }`. |
| `theme.contrastColorPairs` | `Record<string, CssColor>` | Key = token name, value = color string. |
| `theme.contrastColorValues` | `CssColor[]` | Flat array of all color strings. |
| `theme.backgroundColorValue` | `number` | Internal background value (for advanced use). |

### Setters

| Setter                 | Description |
| ---------------------- | ----------- |
| `theme.lightness = n`  | Set background lightness (0–100). |
| `theme.contrast = n`   | Set contrast multiplier. |
| `theme.saturation = n` | Set saturation (0–100). |
| `theme.output = format`| Set output Colorspace. |
| `theme.backgroundColor = bg` | Set background (BackgroundColor instance). |
| `theme.colors = arr`   | Set full color list (Color[]). |
| `theme.addColor = color` | Add one Color instance. |
| `theme.removeColor = { name: string }` or `Color` | Remove by name or by Color instance. |
| `theme.updateColor = { name: string, ...props }` | Update existing color by name; props can be `ratios`, `colorKeys`, `name`, etc. |

### Theme.updateColor options

Pass an object with:

- **name** (or **color**) — Current name of the color to update.
- **ratios** — New ratios (array or object).
- **colorKeys** — New color key array.
- **name** (as target) — New name for the color (rename).

Multiple updates: pass an array of such objects to `theme.updateColor`.

---

## Color

Class that defines a single color scale with target contrast ratios (foreground or background).

### Constructor

`new Color({ name, colorKeys, colorspace?, colorSpace?, ratios, smooth?, output?, saturation? })`

| Parameter    | Type                    | Required | Description |
| ------------ | ----------------------- | -------- | ----------- |
| `name`       | `string`                | Yes      | Prefix for output names (e.g. `blue` → `blue100`, `blue200`). |
| `colorKeys`  | `CssColor[]`            | Yes      | Array of color strings to interpolate between. |
| `colorspace` / `colorSpace` | `InterpolationColorspace` | No | Interpolation space (default `'RGB'`). |
| `ratios`     | `number[]` or `Record<string, number>` | Yes | Target contrast ratios, or named ratio map. |
| `smooth`     | `boolean`               | No       | Bezier smoothing (default `false`). |
| `output`     | `Colorspace`            | No       | Output format (default `'HEX'`); often overridden by Theme. |
| `saturation` | `number`                | No       | Saturation (default `100`). |

### Setters

| Setter                | Description |
| --------------------- | ----------- |
| `color.name = s`      | Set color name. |
| `color.colorKeys = arr`| Set color keys. |
| `color.colorspace` / `color.colorSpace = space` | Set interpolation colorspace. |
| `color.ratios = r`    | Set ratios (array or object). |
| `color.smooth = b`   | Set smooth. |
| `color.output = format` | Set output format. |

### Read-only

- `color.colorScale` — Internal chroma scale (advanced use).

---

## BackgroundColor

Extends **Color**. Used as the theme background. Same constructor and options as Color. Has an additional read-only `backgroundColorScale` (internal). Use one BackgroundColor per Theme and pass it as `theme.backgroundColor`.

---

## createScale(options)

Builds an interpolated color scale (no contrast targeting).

### Options

| Option                 | Type     | Default   | Description |
| ---------------------- | -------- | --------- | ----------- |
| `swatches`             | `number` | —         | Number of steps in the scale. |
| `colorKeys`            | `CssColor[]` | —     | Colors to interpolate between. |
| `colorSpace` / `colorspace` | `InterpolationColorspace` | `'LAB'` | Interpolation space. |
| `shift`                | `number` | `1`       | Shift factor. |
| `fullScale`            | `boolean`| `true`    | Use full scale. |
| `smooth`               | `boolean`| `false`   | Bezier smoothing. |
| `distributeLightness`   | `'linear' \| 'polynomial'` | `'linear'` | Lightness distribution. |
| `sortColor`            | `boolean`| `true`    | Sort by lightness. |
| `asFun`                | `boolean`| `false`   | If `true`, return scale function instead of array. |

### Returns

- If `asFun` is false (default): array of CSS color strings.
- If `asFun` is true: chroma scale function.

---

## contrast(foregroundRgbArray, baseRgbArray, baseV?, method?)

Computes contrast between two colors given as RGB arrays `[r, g, b]` (0–255).

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `foregroundRgbArray` | `[number, number, number]` | Foreground RGB. |
| `baseRgbArray`       | `[number, number, number]` | Background RGB. |
| `baseV`              | `number` (optional)        | Precomputed base value (internal). |
| `method`             | `'wcag2' \| 'wcag3'`       | Default `'wcag2'`. `'wcag3'` = APCA (returns Lc). |

**Returns:** `number` — Contrast ratio (WCAG 2) or APCA Lc value (WCAG 3).

---

## convertColorValue(color, format, object?)

Converts a color from any supported input to a target format.

| Parameter | Type         | Description |
| --------- | ------------ | ----------- |
| `color`   | `string`     | Any valid CSS color string (hex, rgb, hsl, etc.). |
| `format`  | `Colorspace` | Target format. |
| `object`  | `boolean`    | If `true`, returns `{ r, g, b }` (or equivalent) instead of string. Default `false`. |

**Returns:** `string` or channel object when `object === true`.

---

## luminance(r, g, b)

Relative luminance of sRGB channels (0–255 each).

**Returns:** `number` in 0–1.

---

## minPositive(ratioArray, formula)

Returns the minimum positive value in a ratio array for the given formula.

- **ratioArray:** `number[]`
- **formula:** `'wcag2' \| 'wcag3'`

**Returns:** `number`

---

## ratioName(ratioArray, formula)

Maps ratio array to named values for the given formula.

- **ratioArray:** `number[]`
- **formula:** `'wcag2' \| 'wcag3'`

**Returns:** `number[]`

---

## Types

### Colorspace

Output / format names: `'HEX' | 'RGB' | 'HSL' | 'HSV' | 'HSLuv' | 'LAB' | 'LCH' | 'OKLAB' | 'OKLCH' | 'CAM02' | 'CAM02p'`

### InterpolationColorspace

All except `'HEX'`: `'RGB' | 'HSL' | 'HSV' | 'HSLuv' | 'LAB' | 'LCH' | 'OKLAB' | 'OKLCH' | 'CAM02' | 'CAM02p'`

### ContrastFormula

`'wcag2' | 'wcag3'`

### Output format examples (W3C CSS Color Level 4)

| Format   | Example |
| -------- | ------- |
| HEX      | `#RRGGBB` |
| RGB      | `rgb(255 255 255)` |
| HSL      | `hsl(360deg 0% 100%)` |
| HSV      | `hsv(360deg 0% 100%)` |
| HSLuv    | `hsluv(360 0 100)` |
| LAB      | `lab(100% 0 0)` |
| LCH      | `lch(100% 0 360deg)` |
| OKLAB    | `oklab(100% 0 0)` |
| OKLCH    | `oklch(100% 0 360deg)` |
| CAM02    | `jab(100% 0 0)` |
| CAM02p   | `jch(100% 0 360deg)` |

### contrastColors shape

```ts
[
  { background: string },
  { name: string, values: Array<{ name: string, contrast: number, value: string }> },
  ...
]
```

### contrastColorPairs shape

```ts
{ [tokenName: string]: string }
```

e.g. `{ "gray100": "#e0e0e0", "blue200": "#8d63ff" }`.
