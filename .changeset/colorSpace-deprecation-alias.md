---
"@adobe/leonardo-contrast-colors": minor
---

Add `colorSpace` as the canonical property name and deprecate `colorspace` (non-breaking). The constructor, `Theme.updateColor`, and `createScale()` accept both names; `colorSpace` takes precedence. The old `colorspace` getter/setter remain as deprecated aliases and emit a console warning. TypeScript types include `colorSpace` and mark `colorspace` as `@deprecated`. Existing code continues to work.
