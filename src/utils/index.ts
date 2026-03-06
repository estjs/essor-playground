import { computed, signal } from 'essor';
import semver from 'semver';
import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';
import * as monaco from 'monaco-editor';
import { isDev } from './config';

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
export const dark = signal(localStorage.getItem('color-schema') === 'dark');

export function toggleDark() {
  dark.value = !dark.value;
  localStorage.setItem('color-schema', dark.value ? 'dark' : 'light');
}

export function setDark() {
  monaco.editor.setTheme(dark.value ? 'vs-dark' : 'vs-light');
  document.documentElement.classList.toggle('dark', dark.value);
}

// Essor version and compile mode signals
export const essorVersion = signal('latest');
export const compileMode = signal<'client' | 'ssr' | 'ssg'>('client');

export const isSSRSupported = computed(() => {
  return (
    essorVersion.value === 'local' ||
    essorVersion.value === 'latest' ||
    semver.gte(essorVersion.value, '0.0.15-0')
  );
});

export function setEssorVersion(version: string) {
  essorVersion.value = version;
}

export function setCompileMode(mode: 'client' | 'ssr' | 'ssg') {
  compileMode.value = mode;
}

// Function to share the current URL
export function shareUrl() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    // eslint-disable-next-line no-alert
    alert('URL copied to clipboard!');
  });
}

// Fetch available Essor versions from GitHub
export const essorVersions = signal<string[]>([]);

export async function fetchEssorVersions() {
  try {
    const response = await fetch('https://api.github.com/repos/estjs/essor/tags');
    const data = await response.json();
    const versions = data.map((tag: { name: string }) => tag.name);
    const allVersions = isDev ? ['local', ...versions] : [...versions];
    essorVersions.value = allVersions;
    // Don't overwrite if already set (e.g. from URL)
    if (essorVersion.value === 'latest' || !essorVersion.value) {
      essorVersion.value = allVersions[0];
    }
  } catch (error) {
    console.error('Failed to fetch essor versions:', error);
  }
}

// Ensure compileMode falls back to client if SSR is not supported by the version
import { watch } from 'essor';
watch(essorVersion, () => {
  if (!isSSRSupported.value) {
    compileMode.value = 'client';
  }
});
