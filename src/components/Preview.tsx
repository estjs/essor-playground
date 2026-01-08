import { effect, onDestroy, onMount, ref, signal } from 'essor';
import semver from 'semver';
import { getEditor } from '@/utils/monaco';
import { essorVersion } from '@/utils';
import srcdoc from '../srcdoc.html?raw';
import { getImportMapConfig } from '../utils/config';
import { PreviewProxy } from './PreviewProxy';
export function Preview() {
  const compiledRef = ref<HTMLElement>();
  const containerRef = ref<HTMLElement>();
  let editor;
  let sandbox;
  let proxy;

  const runtimeError = signal('');
  const isLoading = signal(false);

  function createSandbox() {
    if (sandbox) {
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
      imports: getImportMapConfig(essorVersion.value),
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
      on_error: event => {
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
      on_unhandled_rejection: event => {
        let error = event.value;
        if (typeof error === 'string') {
          error = { message: error };
        }
        runtimeError.value = `Uncaught (in promise): ${error.message}`;
      },
      on_console: log => {
        if (log.duplicate) {
          return;
        }
        if (log.level === 'error') {
          if (log.args[0] instanceof Error) {
            runtimeError.value = log.args[0].message;
          } else {
            runtimeError.value = log.args[0];
          }
        }
      },
    });

    sandbox.addEventListener(
      'load',
      () => {
        proxy.handle_links();
      },
      { once: true },
    );
  }

  async function updatePreview(code: string) {
    try {
      isLoading.value = true;
      runtimeError.value = '';

      // 0.14 later version use old run code
      const isOldVersion =
        essorVersion.value !== 'local' && semver.gt(essorVersion.value, '0.14.0');

      const codeToEvalOld = [
        `import { h as _h$2 } from "essor";
        ${code}
      document.querySelector('#app').innerHTML = '';
      _h$2(App, {}).mount(document.querySelector('#app'));`,
      ];
      const codeToEval = [
        `import { createApp as createApp$1 } from "essor";
          ${code}
        document.querySelector('#app').innerHTML = '';
        createApp$1(App, '#app');
        `,
      ];
      await proxy.eval(isOldVersion ? codeToEvalOld : codeToEval);
    } catch (error) {
      runtimeError.value = error instanceof Error ? error.message : String(error);
    } finally {
      isLoading.value = false;
    }
  }

  onMount(() => {
    createSandbox();
    editor = getEditor(compiledRef.value!);

    self.addEventListener(
      'message',
      message => {
        if (message.data.type === 'compile') {
          const data = message.data.value;
          updatePreview(data);
          editor.setValue(data);
          console.log('Received compile message:', message);
        }
      },
      false,
    );
  });

  // Re-create sandbox when version changes
  effect(() => {
    if (containerRef.value && editor) {
      createSandbox();
    }
  });

  onDestroy(() => {
    proxy.destroy();
    sandbox.remove();
    editor.dispose();
  });

  return (
    <div class="relative h-full w-full">
      {isLoading.value && (
        <div class="absolute left-0 top-0 z-50 h-full w-full flex items-center justify-center bg-black/10">
          <div class="text-lg">Loading...</div>
        </div>
      )}
      <div ref={compiledRef} class="h-50%"></div>
      <div ref={containerRef} class="iframe-container mr-14px h-50% b-t-1 b-base"></div>
      {runtimeError.value && (
        <div class="absolute bottom-0 left-0 z-40 max-h-100px w-full of-auto bg-red-50 p-4 text-sm text-red-600">
          <strong>Error:</strong> {runtimeError.value}
        </div>
      )}
    </div>
  );
}
