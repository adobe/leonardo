/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {readFileSync} from 'fs';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';
import {generateTheme} from './tools/generate-theme.js';
import {checkContrast} from './tools/check-contrast.js';
import {convertColor} from './tools/convert-color.js';
import {createPalette} from './tools/create-palette.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const server = new McpServer({
  name: 'leonardo',
  version: pkg.version
});

const colorDefSchema = z.object({
  name: z.string(),
  colorKeys: z.array(z.string()),
  ratios: z.union([z.array(z.number()), z.record(z.string(), z.number())]),
  colorspace: z.enum(['LCH', 'LAB', 'RGB', 'HSL', 'HSV', 'HSLuv', 'CAM02', 'CAM02p', 'OKLAB', 'OKLCH']).optional()
});

const outputFormatSchema = z.enum(['HEX', 'RGB', 'HSL', 'HSV', 'HSLuv', 'LAB', 'LCH', 'OKLAB', 'OKLCH', 'CAM02', 'CAM02p']);

server.registerTool(
  'generate-theme',
  {
    title: 'Generate theme',
    description: 'Generate a contrast-based color theme. Returns theme.contrastColors JSON ready for design tokens.',
    inputSchema: z.object({
      colors: z.array(colorDefSchema),
      backgroundColor: colorDefSchema,
      lightness: z.number().min(0).max(100),
      contrast: z.number().optional(),
      saturation: z.number().min(0).max(100).optional(),
      output: outputFormatSchema.optional(),
      formula: z.enum(['wcag2', 'wcag3']).optional()
    })
  },
  async (args) => {
    try {
      const result = generateTheme(args);
      return {
        content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
        structuredContent: result
      };
    } catch (err) {
      return {content: [{type: 'text', text: err.message}], isError: true};
    }
  }
);

server.registerTool(
  'check-contrast',
  {
    title: 'Check contrast',
    description: 'Check contrast ratio between foreground and background. Returns ratio and WCAG 2 AA/AAA pass/fail, or APCA Lc when method is wcag3.',
    inputSchema: z.object({
      foreground: z.string(),
      background: z.string(),
      method: z.enum(['wcag2', 'wcag3']).optional()
    })
  },
  async (args) => {
    try {
      const result = checkContrast(args);
      return {
        content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
        structuredContent: result
      };
    } catch (err) {
      return {content: [{type: 'text', text: err.message}], isError: true};
    }
  }
);

server.registerTool(
  'convert-color',
  {
    title: 'Convert color',
    description: 'Convert a color value to another format (HEX, RGB, HSL, LCH, etc.).',
    inputSchema: z.object({
      color: z.string(),
      format: outputFormatSchema
    })
  },
  async (args) => {
    try {
      const result = convertColor(args);
      return {
        content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
        structuredContent: result
      };
    } catch (err) {
      return {content: [{type: 'text', text: err.message}], isError: true};
    }
  }
);

server.registerTool(
  'create-palette',
  {
    title: 'Create palette',
    description: 'Create an interpolated color scale from color keys (no contrast targeting).',
    inputSchema: z.object({
      colorKeys: z.array(z.string()),
      colorspace: z.enum(['LCH', 'LAB', 'RGB', 'HSL', 'HSV', 'HSLuv', 'CAM02', 'CAM02p', 'OKLAB', 'OKLCH']).optional(),
      steps: z.number().int().min(2),
      smooth: z.boolean().optional(),
      shift: z.number().optional(),
      fullScale: z.boolean().optional(),
      distributeLightness: z.enum(['linear', 'polynomial']).optional(),
      sortColor: z.boolean().optional()
    })
  },
  async (args) => {
    try {
      const result = createPalette(args);
      return {
        content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
        structuredContent: result
      };
    } catch (err) {
      return {content: [{type: 'text', text: err.message}], isError: true};
    }
  }
);

export async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
