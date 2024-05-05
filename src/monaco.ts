import * as monaco from 'monaco-editor';
import { languages } from 'monaco-editor';
// 假设 EssorType 是一个包含类型定义的字符串
import EssorType from '../node_modules/essor/dist/index.d.ts?raw';

// 创建模型并设置语言为 TypeScript
const customModel = monaco.editor.createModel(
  EssorType, // 自定义类型定义文件的内容
  'typescript', // 使用正确的语言ID
  monaco.Uri.parse(`file:///node_modules/essor/dist/index.d.ts`), // 为模型指定一个自定义的URI
);

// 设置TypeScript编译器选项
const compilerOptions: languages.typescript.CompilerOptions = {
  strict: true,
  target: languages.typescript.ScriptTarget.ESNext,
  module: languages.typescript.ModuleKind.ESNext,
  moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
  jsx: monaco.languages.typescript.JsxEmit.React,
  jsxImportSource: 'preset', // 如果需要在JSX中引用，确保这个值是正确的
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

// 创建编辑器的工厂函数
function getEditor(ref: HTMLDivElement, props: any = {}) {
  // 根据localStorage设置主题
  const isDark = localStorage.getItem('color-schema') === 'dark' ? true : false;

  // 创建编辑器实例
  const editorInstance = monaco.editor.create(ref, {
    value: '',
    fontSize: 14,
    tabSize: 2,
    fontWeight: '500',
    theme: isDark ? 'vs-dark' : 'vs-light',
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

// 导出创建的模型和编辑器实例
export { customModel, getEditor };
