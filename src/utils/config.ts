export const isDev = import.meta.env.DEV;

export function getImportMapConfig(version: string) {
  const isLocal = version === 'local';
  return {
    // Point to local files directly when running in development
    essor:
      isLocal && isDev
        ? new URL('../../../essor/packages/core/dist/essor.esm.js', import.meta.url).href
        : `https://cdn.jsdelivr.net/npm/essor@${version === 'latest' ? 'latest' : version}/dist/essor.esm.js`,
  };
}
