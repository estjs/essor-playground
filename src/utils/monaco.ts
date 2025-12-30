import * as monaco from 'monaco-editor';
import { languages } from 'monaco-editor';
import EssorType from '../../node_modules/essor/types/jsx.d.ts?raw';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    switch (label) {
      case 'css':
        return new cssWorker();
      case 'json':
        return new jsonWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  },
};

const customModel = monaco.editor.createModel(
  EssorType,
  'typescript',
  monaco.Uri.parse(`file:///node_modules/essor/types/jsx.d.ts`),
);

// Configure the TypeScript compiler options
const compilerOptions: languages.typescript.CompilerOptions = {
  strict: true,
  target: languages.typescript.ScriptTarget.ESNext,
  module: languages.typescript.ModuleKind.ESNext,
  jsx: monaco.languages.typescript.JsxEmit.React,
  jsxImportSource: 'preset',
  allowNonTsExtensions: true,
  reactNamespace: 'essor',
  jsxFactory: 'h',
  allowJs: true,
};

// Apply the compiler options
languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: true,
});

// Add additional type declaration files
languages.typescript.typescriptDefaults.addExtraLib(
  `declare module 'essor' {
    ${customModel.getValue()}
  }
  `,
  'essor.d.ts',
);
monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `
  declare namespace  JSX {
}
  `,
  'jsx.d.ts',
);

function getEditor(ref: HTMLDivElement, props: any = {}) {
  const editorInstance = monaco.editor.create(ref, {
    value: '',
    fontSize: 14,
    tabSize: 2,
    fontWeight: '500',
    theme: 'vs-light',
    language: 'typescript',
    minimap: {
      enabled: false,
    },
    inlineSuggest: {
      enabled: false,
    },
    fixedOverflowWidgets: true,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
    },
    automaticLayout: true,
    ...props,
  });
  return editorInstance;
}

export { customModel, getEditor };
