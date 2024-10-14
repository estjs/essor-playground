import * as monaco from 'monaco-editor';
import { languages } from 'monaco-editor';
import EssorType from '../../node_modules/essor/dist/essor.d.ts?raw';
import { dark } from '../utils';

const customModel = monaco.editor.createModel(
  EssorType,
  'typescript',
  monaco.Uri.parse(`file:///node_modules/essor/dist/essor.d.ts`),
);

// 设置TypeScript编译器选项
const compilerOptions: languages.typescript.CompilerOptions = {
  strict: true,
  target: languages.typescript.ScriptTarget.ESNext,
  module: languages.typescript.ModuleKind.ESNext,
  moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
  jsx: monaco.languages.typescript.JsxEmit.React,
  jsxImportSource: 'preset',
  allowNonTsExtensions: true,
  reactNamespace: 'essor',
  jsxFactory: 'h',
  allowJs: true,
  typeRoots: ['node_modules/@types'],
};

// 设置编译器选项
languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});

// 添加额外的类型定义文件
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
    theme: dark.value ? 'vs-dark' : 'vs-light',
    language: 'typescript',
    minimap: {
      enabled: false,
    },
    inlineSuggest: {
      enabled: false,
    },
    fixedOverflowWidgets: true,
    ...props,
  });

  return editorInstance;
}

export { customModel, getEditor };
