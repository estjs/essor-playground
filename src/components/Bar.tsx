import { onMount } from 'essor';
import {
  compileMode,
  dark,
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
    <div class="w-full flex items-center justify-between b-b-1 b-base px dark:bg-black">
      <h1 class="lh-50px">Essor playground</h1>

      <div class="flex-auto" />

      <div class="flex items-center gap-4">
        <select
          onChange={e => setEssorVersion(e.target.value)}
          class="rounded bg-gray-100 py-1 px-2 text-black dark:bg-gray-800 dark:text-white"
        >
          {essorVersions.value.map(version => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>

        <button
          class="btn  "
          onClick={handleToggle}
        >
          {compileMode.value === 'client' ? 'SSR Off' : 'SSR On'}
        </button>

        <button class="i-carbon-share icon-btn !outline-none" onClick={shareUrl}></button>

        <button class="icon-btn !outline-none" onClick={() => toggleDark()}>
          {dark.value ? <div class="i-carbon-moon" /> : <div class="i-carbon-sun" />}
        </button>

        <a
          class="i-carbon-logo-github icon-btn"
          rel="noreferrer"
          href="https://github.com/estjs/essor-playground"
          target="_blank"
          title="GitHub"
        />
      </div>
    </div>
  );
}
