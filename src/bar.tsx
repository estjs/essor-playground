import { dark, toggleDark } from './utils';

export function Bar() {
  return (
    <div class="w-full flex items-center justify-between b-b-1 b-base px dark:bg-black">
      <h1 class="lh-50px">Essor playground</h1>

      <div class="flex-auto" />

      <div class="flex items-center gap-4">
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
