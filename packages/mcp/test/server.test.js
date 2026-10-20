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

import {describe, it, before, after} from 'node:test';
import assert from 'node:assert';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {server} from '../src/server.js';

// The MCP spec requires `structuredContent` to be a JSON object. A client validates every tools/call result against
// that schema and rejects an array with "Invalid tools/call result ... expected record, received array", so each tool
// is called here through a real client, end to end, rather than by invoking its function directly.
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const CALLS = {
  'generate-theme': {
    colors: [{name: 'blue', colorKeys: ['#5CDBFF', '#0000FF'], ratios: [3, 4.5]}],
    backgroundColor: {name: 'gray', colorKeys: ['#cacaca'], ratios: [1]},
    lightness: 97
  },
  'check-contrast': {foreground: '#000000', background: '#ffffff'},
  'convert-color': {color: '#0000ff', format: 'OKLCH'},
  'create-palette': {colorKeys: ['#ffffff', '#0000ff'], steps: 3}
};

describe('server tool results', () => {
  let client;

  before(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({name: 'leonardo-mcp-test', version: '0.0.0'});
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  });

  after(async () => {
    await client.close();
  });

  for (const [name, args] of Object.entries(CALLS)) {
    it(`${name} returns an object as structuredContent`, async () => {
      const result = await client.callTool({name, arguments: args});
      assert.ok(!result.isError, `${name} returned an error: ${JSON.stringify(result.content)}`);
      assert.ok(isPlainObject(result.structuredContent), `${name} structuredContent must be an object`);
    });
  }

  it('generate-theme keeps the contrastColors array under one key and in the text content', async () => {
    const result = await client.callTool({name: 'generate-theme', arguments: CALLS['generate-theme']});
    const {contrastColors} = result.structuredContent;
    assert.ok(Array.isArray(contrastColors), 'structuredContent.contrastColors is the theme array');
    assert.ok(contrastColors.some((entry) => 'background' in entry), 'the array includes the background entry');
    assert.deepStrictEqual(JSON.parse(result.content[0].text), contrastColors, 'text content is unchanged');
  });
});
