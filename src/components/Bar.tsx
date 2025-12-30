import { onMount } from 'essor';
import {
  compileMode,
  dark,
  essorVersion,
  essorVersions,
  fetchEssorVersions,
  setCompileMode,
  setEssorVersion,
  shareUrl,
  toggleDark,
} from '../utils';

export function Bar() {
  onMount(() => {
    fetchEssorVersions();
  });

  function handleToggle() {
    setCompileMode(compileMode.value === 'client' ? 'server' : 'client');
  }

  return (
    <div class="h-50px w-full flex items-center justify-between b-b-1 b-base px-4 transition-colors dark:bg-black">
      <div class="flex items-center gap-2">
        <h1 class="text-lg font-semibold">Essor Playground</h1>
      </div>
      <div class="flex-auto" />
      <div class="flex items-center gap-4">
        <select
          id="essor-version"
          value={essorVersion.value}
          onChange={e => setEssorVersion(e.target.value)}
          class="w-200px rounded bg-gray-100 px-2 py-1 text-black transition-colors dark:bg-gray-800 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
        >
          {essorVersions.value.map(version => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>

        {/* <button
          class="btn rounded px-3 py-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={handleToggle}
        >
          {compileMode.value === 'client' ? 'SSR Off' : 'SSR On'}
        </button> */}

        <button
          class="i-carbon-share icon-btn transition-colors hover:text-blue-500 !outline-none"
          onClick={shareUrl}
          title="Share URL"
        ></button>

        <button
          class="icon-btn transition-colors hover:text-yellow-500 !outline-none"
          onClick={() => toggleDark()}
          title="Toggle Dark Mode"
        >
          {dark.value ? <div class="i-carbon-moon" /> : <div class="i-carbon-sun" />}
        </button>

        <a
          class="i-carbon-logo-github icon-btn transition-colors hover:text-gray-500"
          rel="noreferrer"
          href="https://github.com/estjs/essor-playground"
          target="_blank"
          title="GitHub"
        />
      </div>
    </div>
  );
}
