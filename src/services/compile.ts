import { transform } from '@babel/standalone';
import BabelPluginEssor from 'babel-plugin-essor';
import { atou, compileMode, utoa } from '../utils';

function babelTransform(filename: string, code: string) {
  const transformedCode = transform(code, {
    plugins: [[BabelPluginEssor, { ssg: compileMode.value === 'server' }]],
    presets: ['typescript'],
    filename: `${filename}.tsx`,
  }).code;
  return transformedCode!;
}

self.addEventListener(
  'message',
  message => {
    if (message.data.type === 'editValueChange') {
      const data = message.data.value;
      setHashCode(data);
      self.postMessage({
        type: 'compile',
        value: babelTransform('test', data),
      });
    }
  },
  false,
);

export function loadHashCode() {
  const hash = location.hash;
  const code = atou(hash.slice(1));
  return code;
}

export function setHashCode(code: string) {
  location.hash = utoa(code);
}
