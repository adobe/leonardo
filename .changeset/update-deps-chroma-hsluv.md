---
"@adobe/leonardo-contrast-colors": patch
---

Upgrade chroma-js from ^2 to ^3 and hsluv from ^0.1 to ^1.0. The hsluv 1.0 class-based API is wrapped internally so the public interface is unchanged. Color output for HSLuv-interpolated scales may differ by a small precision amount due to updated interpolation in the new libraries.
