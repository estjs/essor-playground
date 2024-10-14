import { useSignal } from 'essor';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';
import * as monaco from 'monaco-editor';

// Debounce function to limit the rate at which a function can fire
export function debounce(fn: Function, n = 100) {
  let handle: any;
  return (...args: any[]) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => {
      fn(...args);
    }, n);
  };
}

// Utility functions for encoding and decoding strings
export function utoa(data: string): string {
  const buffer = strToU8(data);
  const zipped = zlibSync(buffer, { level: 9 });
  const binary = strFromU8(zipped, true);
  return btoa(binary);
}

export function atou(base64: string): string {
  const binary = atob(base64);
  if (binary.startsWith('\u0078\u00DA')) {
    const buffer = strToU8(binary, true);
    const unzipped = unzlibSync(buffer);
    return strFromU8(unzipped);
  }
  return decodeURIComponent(escape(binary));
}

// Dark mode signal and related functions
export const dark = useSignal(localStorage.getItem('color-schema') === 'dark');

export function toggleDark() {
  dark.value = !dark.value;
  localStorage.setItem('color-schema', dark.value ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', dark.value);
}

export function setDark() {
  monaco.editor.setTheme(dark.value ? 'vs-dark' : 'vs-light');
  document.documentElement.classList.toggle('dark', dark.value);
}

// Essor version and compile mode signals
export const essorVersion = useSignal('latest');
export const compileMode = useSignal<'client' | 'server'>('client');

export function setEssorVersion(version: string) {
  selectedVersion.value = version;
}

export function setCompileMode(mode: 'client' | 'server') {
  compileMode.value = mode;
}

// Function to share the current URL
export function shareUrl() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert('URL copied to clipboard!');
  });
}

// Fetch available Essor versions from GitHub
export const essorVersions = useSignal<string[]>([]);
export const selectedVersion = useSignal();

export async function fetchEssorVersions() {
  try {
    const response = await fetch('https://api.github.com/repos/estjs/essor/tags');
    const data = await response.json();
    const versions = data.map((tag: { name: string }) => tag.name);
    essorVersions.value = versions;
    selectedVersion.value = versions[0];
  } catch (error) {
    console.error('Failed to fetch essor versions:', error);
  }
}
