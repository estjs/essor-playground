import { essorVersion } from './utils';

export function getImportMapConfig() {
  return {
    essor: `https://cdn.jsdelivr.net/npm/essor@${essorVersion.value}/dist/essor.esm.js`,
  };
}
