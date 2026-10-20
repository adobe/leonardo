---
'@adobe/leonardo-mcp': patch
---

Fix `generate-theme` failing in MCP clients. It returned the `contrastColors` array as `structuredContent`, which the MCP spec requires to be an object, so clients rejected every call with "Invalid tools/call result ... expected record, received array". The structured result is now `{contrastColors: [...]}`; the text content is unchanged. Adds an end-to-end test that calls every tool through an MCP client.
