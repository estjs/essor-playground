import { transform } from '@babel/standalone';
import BabelPluginEssor from 'babel-plugin-essor';

function babelTransform(filename: string, code: string) {
  const transformedCode = transform(code, {
    plugins: [BabelPluginEssor],
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
      console.log(data);

      self.postMessage({
        type: 'compile',
        value: babelTransform('test', data),
      });
    }
  },
  false,
);
