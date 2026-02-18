/*
Minimal declaration for chroma-js so that index.d.ts and type tests can resolve
'chroma-js' when @types/chroma-js is not installed (e.g. in tsd). Consumers with
@types/chroma-js get the full types; this file is only referenced from index.d.ts.
*/
declare module 'chroma-js' {
  export interface Scale {
    (t: number): string;
  }
  export interface Color {}
  const chroma: {
    (...args: unknown[]): unknown;
    Scale: Scale;
    Color: Color;
  };
  export type ChromaJs = typeof chroma;
  export default chroma;
}
