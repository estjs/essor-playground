import { essorVersion } from './index';

export function getImportMapConfig() {
  return {
    essor: `https://cdn.jsdelivr.net/npm/essor@${essorVersion.value}/dist/essor.esm.js`,
  };
}
