import { onDestroy, onMount, useSignal } from 'essor';
import { getEditor } from './monaco';
import { PreviewProxy } from './PreviewProxy';
import srcdoc from './srcdoc.html?raw';
import type { editor } from 'monaco-editor';

export function Preview() {
  const ref = useSignal<HTMLDivElement | null>(null);
  const container = useSignal<HTMLDivElement | null>(null);
  let editor: editor.IStandaloneCodeEditor;
  let sandbox: HTMLIFrameElement;
  let proxy: PreviewProxy;

  const runtimeError = useSignal('');
  const previewTheme = useSignal(false);

  function createSandbox() {
    if (sandbox) {
      // clear prev sandbox
      proxy.destroy();
      sandbox.remove();
    }

    sandbox = document.createElement('iframe');
    sandbox.setAttribute(
      'sandbox',
      [
        'allow-forms',
        'allow-modals',
        'allow-pointer-lock',
        'allow-popups',
        'allow-same-origin',
        'allow-scripts',
        'allow-top-navigation-by-user-activation',
      ].join(' '),
    );

    const importMap = {
      imports: { essor: 'https://cdn.jsdelivr.net/npm/essor@0.0.5/dist/index.esm.js' },
      scopes: {},
    };

    const sandboxSrc = srcdoc
      .replace(/<html>/, `<html class="${previewTheme.value ? 'dark' : ''}">`)
      .replace(/<!--IMPORT_MAP-->/, JSON.stringify(importMap))
      .replace(/<!-- PREVIEW-OPTIONS-HEAD-HTML -->/, '')
      .replace(/<!--PREVIEW-OPTIONS-PLACEHOLDER-HTML-->/, '');
    sandbox.srcdoc = sandboxSrc;
    container.value!.append(sandbox);

    proxy = new PreviewProxy(sandbox, {
      on_fetch_progress: (progress: any) => {
        // pending_imports = progress;
      },
      on_error: (event: any) => {
        const msg = event.value instanceof Error ? event.value.message : event.value;
        if (
          msg.includes('Failed to resolve module specifier') ||
          msg.includes('Error resolving module specifier')
        ) {
          runtimeError.value = `${msg.replace(
            /\. Relative references must.*$/,
            '',
          )}.\nTip: edit the "Import Map" tab to specify import paths for dependencies.`;
        } else {
          runtimeError.value = event.value;
        }
      },
      on_unhandled_rejection: (event: any) => {
        let error = event.value;
        if (typeof error === 'string') {
          error = { message: error };
        }
        runtimeError.value = `Uncaught (in promise): ${error.message}`;
      },
      on_console: (log: any) => {
        if (log.duplicate) {
          return;
        }
        if (log.level === 'error') {
          if (log.args[0] instanceof Error) {
            runtimeError.value = log.args[0].message;
          } else {
            runtimeError.value = log.args[0];
          }
        } else if (log.level === 'warn' && log.args[0].toString().includes('[Essor warn]')) {
        }
      },
      on_console_group: (action: any) => {
        // group_logs(action.label, false);
      },
      on_console_group_end: () => {
        // ungroup_logs();
      },
      on_console_group_collapsed: (action: any) => {
        // group_logs(action.label, true);
      },
    });

    sandbox.addEventListener('load', () => {
      proxy.handle_links();
    });
  }

  async function updatePreview(code) {
    const codeToEval = [
      `import { h as _h$2 } from "essor";
        ${code}
      document.querySelector('#app').innerHTML = '';
      _h$2(App, {}).mount(document.querySelector('#app'));`,
    ];
    await proxy.eval(codeToEval);
  }

  onMount(() => {
    createSandbox();
    editor = getEditor(ref.value!);
    self.addEventListener(
      'message',
      message => {
        if (message.data.type === 'compile') {
          const data = message.data.value;
          console.log(message);
          editor.setValue(data);
          updatePreview(data);
        }
      },
      false,
    );
  });

  onDestroy(() => {
    editor.dispose();
  });

  return (
    <div class="h-full w-full">
      <div ref={ref} class="h-50% of-hidden"></div>
      <div ref={container} class="iframe-container h-50% b-t-1"></div>
    </div>
  );
}
