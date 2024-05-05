import 'virtual:uno.css';
import '@unocss/reset/tailwind.css';
import './compile';
import './style.css';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { Bar } from './bar';
import { Preview } from './preview';
import { Edit } from './edit';

window.MonacoEnvironment = {
  getWorker(_moduleId: unknown, label: string) {
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

function App() {
  return (
    <div class="h-100vh w-100vw">
      <Bar></Bar>
      <div class="grid grid-cols-2 h-[calc(100%-50px)] w-full">
        <Edit />
        <Preview />
      </div>
    </div>
  );
}

(<App />).mount(document.querySelector('#app')!);
