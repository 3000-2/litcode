import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/lang-go';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { sql } from '@codemirror/lang-sql';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';

const EXTENSION_MAP: Record<string, () => Extension> = {
  js: () => javascript(),
  jsx: () => javascript(),
  mjs: () => javascript(),
  cjs: () => javascript(),
  ts: () => javascript({ typescript: true, jsx: true }),
  tsx: () => javascript({ typescript: true, jsx: true }),
  mts: () => javascript({ typescript: true, jsx: true }),
  cts: () => javascript({ typescript: true, jsx: true }),
  py: () => python(),
  pyw: () => python(),
  go: () => go(),
  json: () => json(),
  jsonc: () => json(),
  md: () => markdown(),
  markdown: () => markdown(),
  mdx: () => markdown(),
  html: () => html(),
  htm: () => html(),
  vue: () => html(),
  svelte: () => html(),
  css: () => css(),
  scss: () => css(),
  less: () => css(),
  rs: () => rust(),
  c: () => cpp(),
  h: () => cpp(),
  cpp: () => cpp(),
  cc: () => cpp(),
  cxx: () => cpp(),
  hpp: () => cpp(),
  hxx: () => cpp(),
  java: () => java(),
  sql: () => sql(),
  yaml: () => yaml(),
  yml: () => yaml(),
  xml: () => xml(),
  svg: () => xml(),
  xsl: () => xml(),
  xslt: () => xml(),
  sh: () => StreamLanguage.define(shell),
  bash: () => StreamLanguage.define(shell),
  zsh: () => StreamLanguage.define(shell),
  fish: () => StreamLanguage.define(shell),
  toml: () => StreamLanguage.define(shell),
  ini: () => StreamLanguage.define(shell),
  conf: () => StreamLanguage.define(shell),
  cfg: () => StreamLanguage.define(shell),
  env: () => StreamLanguage.define(shell),
  gitignore: () => StreamLanguage.define(shell),
  dockerignore: () => StreamLanguage.define(shell),
  editorconfig: () => StreamLanguage.define(shell),
};

export function getLanguageExtension(filename: string): Extension {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const factory = EXTENSION_MAP[ext];
  return factory ? factory() : [];
}

export const baseEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
  },
  '.cm-scroller': {
    fontFamily: 'var(--editor-font-family)',
    fontSize: 'var(--editor-font-size)',
    lineHeight: 'var(--editor-line-height)',
  },
  '.cm-content': {
    padding: '4px 0',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-gutters': {
    paddingLeft: '8px',
  },
});
