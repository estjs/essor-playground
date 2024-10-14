import 'virtual:uno.css';
import '@unocss/reset/tailwind.css';
import './style.css';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { Bar } from './components/Bar';
import { Preview } from './components/Preview';
import { Edit } from './components/Edit';

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
    <div class="h-100vh w-100vw of-hidden">
      <Bar />
      <div class="grid grid-cols-2 h-[calc(100%-50px)] w-full of-hidden">
        <Edit />
        <Preview />
      </div>
    </div>
  );
}

(<App />).mount(document.querySelector('#app')!);
