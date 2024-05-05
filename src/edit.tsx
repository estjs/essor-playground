import { onDestroy, onMount, useSignal } from 'essor';
import { getEditor } from './monaco';
import template from './template?raw';
import type { editor } from 'monaco-editor';

export function Edit() {
  const ref = useSignal<HTMLDivElement | null>(null);
  let editor: editor.IStandaloneCodeEditor;

  onMount(async () => {
    editor = await getEditor(ref.value!);

    editor.setValue(template);

    self.postMessage({
      type: 'editValueChange',
      value: editor.getValue(),
    });

    editor.onDidChangeModelContent(() => {
      self.postMessage({
        type: 'editValueChange',
        value: editor.getValue(),
      });
    });
  });

  onDestroy(() => {
    editor.dispose();
  });

  return <div ref={ref} class="h-full"></div>;
}
