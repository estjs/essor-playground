import { onDestroy, onMount, useEffect, useSignal } from 'essor';
import { getEditor } from './monaco';
import template from './template?raw';
import { loadHashCode } from './compile';
import { setDark } from './utils';
import type { editor } from 'monaco-editor';
export function Edit() {
  const ref = useSignal<HTMLDivElement | null>(null);
  let editor: editor.IStandaloneCodeEditor;

  const postMsg = () => {
    self.postMessage({
      type: 'editValueChange',
      value: editor.getValue(),
    });
  };

  onMount(async () => {
    editor = await getEditor(ref.value!);
    setDark();
    const code = loadHashCode();
    editor.setValue(code || template);
    postMsg();
    editor.onDidChangeModelContent(() => {
      postMsg();
    });
  });

  useEffect(() => {
    setDark();
    if (editor) {
      postMsg();
    }
  });

  onDestroy(() => {
    editor.dispose();
  });

  return <div ref={ref} class="h-full"></div>;
}
