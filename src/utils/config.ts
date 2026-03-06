export const isDev = import.meta.env.DEV;

export function getImportMapConfig(version: string) {
  const isLocal = version === 'local';
  return {
    // Point to local files directly when running in development
    essor:
      isLocal && isDev
        ? new URL('../../../essor/packages/core/dist/essor.esm.js', import.meta.url).href
        : `https://esm.sh/essor@${version}`,
    'essor/server':
      isLocal && isDev
        ? new URL('../../../essor/packages/server/dist/index.esm.js', import.meta.url).href
        : `https://esm.sh/essor@${version}/server`,
  };
}
