import { transform } from '@babel/standalone';
import LocalBabelPlugin from 'babel-plugin-essor';

interface CompileMessage {
  type: 'compile';
  ssg: boolean;
  code: string;
  version: string;
}

async function loadPlugin(version: string) {
  if (version === 'latest' || version === 'local') {
    return LocalBabelPlugin;
  }
  try {
    const module = await import(/* @vite-ignore */ `https://esm.sh/babel-plugin-essor@${version}`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load plugin for version ${version}, falling back to local`, error);
    return LocalBabelPlugin;
  }
}

async function babelTransform(filename: string, code: string, ssg: boolean, version: string) {
  try {
    const plugin = await loadPlugin(version);
    const transformedCode = transform(code, {
      plugins: [[plugin, { ssg }]],
      presets: ['typescript'],
      filename: `${filename}.tsx`,
    }).code;
    return transformedCode!;
  } catch (error) {
    console.error('Babel transform error:', error);
    throw error;
  }
}

self.addEventListener(
  'message',
  async (message: MessageEvent<CompileMessage>) => {
    if (message.data.type === 'compile') {
      try {
        const { code, ssg, version } = message.data;
        const compiled = await babelTransform('test', code, ssg, version);
        self.postMessage({
          type: 'compile-success',
          value: compiled,
        });
      } catch (error) {
        self.postMessage({
          type: 'compile-error',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  },
  false,
);
