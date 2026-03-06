import { onDestroy, onMount, ref, watch } from 'essor';
import { getEditor } from '../utils/monaco';
import template from '../templates/template?raw';
import { loadHashCode, setHashCode } from '../services/compile';
import { compileMode, essorVersion } from '../utils';
import CompileWorker from '../services/compile.worker?worker';

export function Edit() {
  const editRef = ref<HTMLElement>();
  let editor;
  let compileWorker: Worker;

  const postMsg = () => {
    if (!editor || !compileWorker) return;
    const code = editor.getValue();
    setHashCode(code);
    compileWorker.postMessage({
      type: 'compile',
      code,
      version: essorVersion.value,
      mode: compileMode.value,
    });
  };

  onMount(() => {
    if (!editRef.value) return;

    // Initialize compile worker
    compileWorker = new CompileWorker();

    // Set up worker message handler
    compileWorker.addEventListener('message', e => {
      if (e.data.type === 'compile-success') {
        self.postMessage({
          type: 'compile',
          value: e.data.value,
        });
      } else if (e.data.type === 'compile-error') {
        self.postMessage({
          type: 'compile-error',
          error: e.data.error,
          loc: e.data.loc,
        });
      }
    });

    editor = getEditor(editRef.value);
    const code = loadHashCode();
    editor.setValue(code || template);
    postMsg();

    editor.onDidChangeModelContent(() => {
      postMsg();
    });

    const resizeObserver = new ResizeObserver(() => {
      editor.layout();
    });

    resizeObserver.observe(editRef.value);

    watch(essorVersion, postMsg);
    watch(compileMode, postMsg);

    onDestroy(() => {
      resizeObserver.disconnect();
    });
  });

  onDestroy(() => {
    if (compileWorker) {
      compileWorker.terminate();
    }
    if (editor) {
      editor.dispose();
    }
  });

  return <div ref={editRef} class="h-full w-full"></div>;
}
