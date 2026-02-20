# `@adobe/leonardo-mcp`

[![npm version](https://badge.fury.io/js/%40adobe%2Fleonardo-mcp.svg)](https://www.npmjs.com/package/@adobe/leonardo-mcp)
[![license](https://img.shields.io/github/license/adobe/leonardo)](https://github.com/adobe/leonardo/blob/master/LICENSE)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-blueviolet)](https://github.com/adobe/leonardo/blob/master/.github/CONTRIBUTING.md)

An [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) server that exposes [@adobe/leonardo-contrast-colors](https://www.npmjs.com/package/@adobe/leonardo-contrast-colors) as tools. Use it from Cursor, Claude Desktop, or any MCP client to generate contrast-based themes, check WCAG contrast, convert colors, and create palettes without writing code.

## Quick start

**Run once (no install):**

```bash
npx @adobe/leonardo-mcp
```

**Install and use as a binary:**

```bash
npm i @adobe/leonardo-mcp
leonardo-mcp
```

The server runs over stdio. Configure your MCP client to start this command; see [Configuration](#configuration) below.

## Tools

### `generate-theme`

Generate a contrast-based color theme. Returns `theme.contrastColors`-style JSON ready for design tokens or CSS variables.

| Parameter         | Type   | Required | Description                                                               |
| ----------------- | ------ | -------- | ------------------------------------------------------------------------- |
| `colors`          | array  | yes      | List of color definitions (name, colorKeys, ratios, optional colorspace). |
| `backgroundColor` | object | yes      | Background color definition (same shape as a color in `colors`).          |
| `lightness`       | number | yes      | 0–100; background lightness.                                              |
| `contrast`        | number | no       | Multiplier for all ratios (default `1`).                                  |
| `saturation`      | number | no       | 0–100 (default `100`).                                                    |
| `output`          | string | no       | Output format: `HEX`, `RGB`, `HSL`, `LCH`, etc. (default `HEX`).          |
| `formula`         | string | no       | `wcag2` (default) or `wcag3` (APCA).                                      |

Example input:

```json
{
  "colors": [{"name": "blue", "colorKeys": ["#5CDBFF", "#0000FF"], "ratios": [3, 4.5]}],
  "backgroundColor": {"name": "gray", "colorKeys": ["#cacaca"], "ratios": [2, 3, 4.5, 8]},
  "lightness": 97
}
```

### `check-contrast`

Check contrast between a foreground and background color. Returns ratio and WCAG 2 AA/AAA (and large text) pass/fail, or APCA Lc when `method` is `wcag3`.

| Parameter    | Type   | Required | Description                   |
| ------------ | ------ | -------- | ----------------------------- |
| `foreground` | string | yes      | CSS color (e.g. `#000000`).   |
| `background` | string | yes      | CSS color (e.g. `#ffffff`).   |
| `method`     | string | no       | `wcag2` (default) or `wcag3`. |

### `convert-color`

Convert a color value to another format (HEX, RGB, HSL, LCH, OKLCH, etc.).

| Parameter | Type   | Required | Description                                                                                            |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `color`   | string | yes      | Any valid CSS color string.                                                                            |
| `format`  | string | yes      | Target format: `HEX`, `RGB`, `HSL`, `HSV`, `HSLuv`, `LAB`, `LCH`, `OKLAB`, `OKLCH`, `CAM02`, `CAM02p`. |

### `create-palette`

Create an interpolated color scale from color keys (no contrast targeting).

| Parameter             | Type    | Required | Description                                                                        |
| --------------------- | ------- | -------- | ---------------------------------------------------------------------------------- |
| `colorKeys`           | array   | yes      | Array of CSS color strings.                                                        |
| `colorspace`          | string  | no       | Interpolation space (default `LAB`). Same options as interpolation in the library. |
| `steps`               | number  | yes      | Number of swatches (min 2).                                                        |
| `smooth`              | boolean | no       | Bezier smoothing (default `false`).                                                |
| `shift`               | number  | no       | Shift factor (default `1`).                                                        |
| `fullScale`           | boolean | no       | Use full scale (default `true`).                                                   |
| `distributeLightness` | string  | no       | `linear` (default) or `polynomial`.                                                |
| `sortColor`           | boolean | no       | Sort by lightness (default `true`).                                                |

## Configuration

### Cursor

Add to `.cursor/mcp.json` (or Cursor settings → MCP):

**Using the published package (recommended):**

```json
{
  "mcpServers": {
    "leonardo": {
      "command": "npx",
      "args": ["-y", "@adobe/leonardo-mcp"]
    }
  }
}
```

**From repo (development):**

```json
{
  "mcpServers": {
    "leonardo": {
      "command": "node",
      "args": ["packages/mcp/src/cli.js"]
    }
  }
}
```

See the [repo’s example](https://github.com/adobe/leonardo/blob/main/.cursor/mcp.json) when working inside the Leonardo monorepo.

### Claude Desktop

In `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "leonardo": {
      "command": "npx",
      "args": ["-y", "@adobe/leonardo-mcp"]
    }
  }
}
```

## Related

- **[@adobe/leonardo-contrast-colors](https://www.npmjs.com/package/@adobe/leonardo-contrast-colors)** — Core library; use directly in Node or the browser.
- **[Leonardo web app](https://leonardocolor.io)** — Interactive theme and scale builder.
- **Agent Skill** — `skills/leonardo-colors/` in this repo for Cursor/Codex; install with `npx skills add https://github.com/adobe/leonardo`.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](https://github.com/adobe/leonardo/blob/main/.github/CONTRIBUTING.md) for more information.

## Development

From the repo root (with pnpm):

```sh
pnpm --filter @adobe/leonardo-mcp test
```

Or via moon:

```sh
moon run mcp:test
```

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](https://github.com/adobe/leonardo/blob/main/LICENSE) for more information.
