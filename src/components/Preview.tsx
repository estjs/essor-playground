import { effect, onDestroy, onMount, ref, signal } from 'essor';
import semver from 'semver';
import { getEditor } from '@/utils/monaco';
import { compileMode, essorVersion } from '@/utils';
import srcdoc from '../srcdoc.html?raw';
import { getImportMapConfig } from '../utils/config';
import { PreviewProxy } from './PreviewProxy';
import { ErrorDisplay } from './ErrorDisplay';
export function Preview() {
  const compiledRef = ref<HTMLElement>();
  const containerRef = ref<HTMLElement>();
  let editor;
  let sandbox;
  let proxy;

  const runtimeError = signal<any>(null);
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
          console.error('Preview Runtime Error:', event.value);
          runtimeError.value = {
            type: 'runtime',
            message: event.value.message || String(event.value),
            stack: event.value.stack || '',
          };
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
          const arg = log.args[0];
          console.error('Preview Console Error:', arg);
          runtimeError.value = {
            type: 'runtime',
            message: arg?.message || String(arg),
            stack: arg?.stack || '',
          };
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
      runtimeError.value = null;

      // 0.14 later version use old run code
      // Logic for version switching: 
      // Versions <= 0.0.14 use old h(...).mount(...)
      // Versions >= 0.0.15 use new createApp(...)
      const isNewVersion =
        essorVersion.value === 'local' ||
        essorVersion.value === 'latest' ||
        semver.gte(essorVersion.value, '0.0.15-0');

      const codeToEvalOld = [
        `import { h as _h$2 } from "essor";
        ${code}
      document.querySelector('#app').innerHTML = '';
      const app = _h$2(App, {});
      if (app && typeof app.mount === 'function') {
        app.mount(document.querySelector('#app'));
      } else {
        console.error('Failed to mount: App component is invalid or version mismatch');
      }`,
      ];
      if (isNewVersion) {
        if (compileMode.value !== 'client') {
          const isSSG = compileMode.value === 'ssg';
          const codeToEvalSSR = [
            `import { renderToString } from "essor/server";
            ${code}
            document.querySelector('#app').innerHTML = renderToString(App, {});
            ${isSSG ? '' : '// Hydration logic could go here'}
            `,
          ];
          await proxy.eval(codeToEvalSSR);
        } else {
          const codeToEvalNew = [
            `import { createApp as createApp$1 } from "essor";
              ${code}
            document.querySelector('#app').innerHTML = '';
            createApp$1(App, '#app');
            `,
          ];
          await proxy.eval(codeToEvalNew);
        }
      } else {
        await proxy.eval(codeToEvalOld);
      }
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
        } else if (message.data.type === 'compile-error') {
          runtimeError.value = {
            type: 'compile',
            message: message.data.error,
            stack: '',
            line: message.data.loc?.line,
            column: message.data.loc?.column,
          };
        }
      },
      false,
    );
  });

  // Re-create sandbox when version changes
  effect(() => {
    // Access essorVersion.value explicitly to track dependency
    const v = essorVersion.value;
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
        <div class="absolute left-0 top-0 z-50 h-full w-full flex flex-col items-center justify-center glass shimmer">
          <div class="i-carbon-loading animate-spin text-3xl text-[#646cff] mb-2" />
          <div class="text-[10px] font-black uppercase tracking-[0.2em] text-gradient brightness-125">Compiling</div>
        </div>
      )}
      <div ref={compiledRef} class="h-50% transition-all"></div>
      <div class="h-2px bg-base  relative flex items-center justify-center">
        <div class="px-5 py-2 glass b-1 b-base dark:b-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.25em] shadow-lg brightness-110 hover:scale-105 transition-all cursor-default select-none group">
          <span class="text-gradient brightness-125">Preview</span>
          <div class="absolute inset-0 bg-[#646cff] blur-lg opacity-10 group-hover:opacity-20 transition-opacity" />
        </div>
      </div>
      <div ref={containerRef} class="iframe-container mr-14px h-50% transition-all mt-4px"></div>
      {runtimeError.value && <ErrorDisplay error={runtimeError.value} onClose={() => runtimeError.value = null} />}
    </div>
  );
}
