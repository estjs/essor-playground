import { useSignal } from 'essor';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';
import * as monaco from 'monaco-editor';
export function debounce(fn: Function, n = 100) {
  let handle: any;
  return (...args: any[]) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => {
      fn(...args);
    }, n);
  };
}

export function utoa(data: string): string {
  const buffer = strToU8(data);
  const zipped = zlibSync(buffer, { level: 9 });
  const binary = strFromU8(zipped, true);
  return btoa(binary);
}

export function atou(base64: string): string {
  const binary = atob(base64);

  // zlib header (x78), level 9 (xDA)
  if (binary.startsWith('\u0078\u00DA')) {
    const buffer = strToU8(binary, true);
    const unzipped = unzlibSync(buffer);
    return strFromU8(unzipped);
  }

  // old unicode hacks for backward compatibility
  // https://base64.guru/developers/javascript/examples/unicode-strings
  return decodeURIComponent(escape(binary));
}
export const dark = useSignal(false);

export function useDark() {
  dark.value = localStorage.getItem('color-schema') === 'dark';
  return dark.value;
}

export const toggleDark = () => {
  dark.value = !dark.value;
  localStorage.setItem('color-schema', dark.value ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', dark.value);
};

export function setDark() {
  if (dark.value) {
    monaco.editor.setTheme('vs-dark');
  } else {
    monaco.editor.setTheme('vs-light');
  }
}
