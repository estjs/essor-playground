import { onDestroy, onMount, useRef, useSignal, useWatch } from 'essor';
import { getEditor } from '../utils/monaco';
import srcdoc from '../srcdoc.html?raw';
import { getImportMapConfig } from '../config';
import { essorVersion, setDark } from '../utils';
import { PreviewProxy } from './PreviewProxy';
import type { editor } from 'monaco-editor';

export function Preview() {
  const ref = useRef<HTMLDivElement | null>();
  const containerRef = useRef<HTMLDivElement | null>();
  let editor: editor.IStandaloneCodeEditor;
  let sandbox: HTMLIFrameElement;
  let proxy: PreviewProxy;

  const runtimeError = useSignal('');

  function createSandbox() {
    console.log('Creating sandbox...');
    if (sandbox) {
      console.log('Destroying previous sandbox...');
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
      imports: getImportMapConfig(),
      scopes: {},
    };

    const sandboxSrc = srcdoc
      .replace(/<html>/, `<html >`)
      .replace(/<!--IMPORT_MAP-->/, JSON.stringify(importMap))
      .replace(/<!-- PREVIEW-OPTIONS-HEAD-HTML -->/, '')
      .replace(/<!--PREVIEW-OPTIONS-PLACEHOLDER-HTML-->/, '');
    sandbox.srcdoc = sandboxSrc;
    containerRef.value!.append(sandbox);

    proxy = new PreviewProxy(sandbox, {
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
          // TODO:
        }
      },
    });

    sandbox.addEventListener(
      'load',
      () => {
        console.log('Sandbox loaded, handling links...');
        proxy.handle_links();
      },
      { once: true },
    );
  }

  async function updatePreview(code: string) {
    console.log('Updating preview with code:', code);
    const codeToEval = [
      `import { h as _h$2 } from "essor";
        ${code}
      document.querySelector('#app').innerHTML = '';
      _h$2(App, {}).mount(document.querySelector('#app'));`,
    ];
    await proxy.eval(codeToEval);
  }

  onMount(() => {
    console.log('Preview component mounted.');
    createSandbox();
    editor = getEditor(ref.value!);

    setDark();
    self.addEventListener(
      'message',
      message => {
        if (message.data.type === 'compile') {
          const data = message.data.value;
          console.log('Received compile message:', message);
          editor.setValue(data);
          updatePreview(data);
        }
      },
      false,
    );
  });

  useWatch(essorVersion, () => {
    console.log('Essor version changed, recreating sandbox...');
    setDark();
    createSandbox(); // Recreate sandbox on essorVersion change
  });

  onDestroy(() => {
    console.log('Preview component destroyed.');
    editor.dispose();
  });

  return (
    <div class="h-full w-full">
      <div ref={ref} class="h-50% of-hidden"></div>
      <div ref={containerRef} class="iframe-container mr-14px h-50% b-t-1 b-base"></div>
    </div>
  );
}
