import { onMount } from 'essor';
import {
  compileMode,
  dark,
  essorVersion,
  essorVersions,
  fetchEssorVersions,
  isSSRSupported,
  setCompileMode,
  setEssorVersion,
  shareUrl,
  toggleDark,
} from '../utils';

export function Bar() {
  onMount(() => {
    fetchEssorVersions();
  });

  return (
    <div class="h-64px w-full flex items-center justify-between px-6 b-b-1 b-base glass sticky top-0 z-100">
      <div class="flex items-center gap-3 group cursor-pointer">
        <div class="relative">
          <div class="i-carbon-flash-filled text-2xl text-[#646cff] group-hover:scale-110 transition-transform duration-300" />
          <div class="absolute inset-0 bg-[#646cff] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <h1 class="text-xl font-bold tracking-tight flex items-center gap-1">
          <span class="text-gradient">Essor</span>
          <span class="opacity-90">Playground</span>
        </h1>

      </div>

      <div class="flex-auto" />

      <div class="flex items-center gap-4 md:gap-8">
        {isSSRSupported.value && (
          <>
            <div class="flex items-center gap-4">
              <span class="text-[11px] font-bold uppercase tracking-[0.15em] opacity-30 select-none hidden sm:block">Mode</span>
              <div class="flex p-1 bg-gray-200/30 dark:bg-white/5 rounded-xl b-1 b-base relative overflow-hidden backdrop-blur-sm group/toggle">
                {(['client', 'ssr', 'ssg'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCompileMode(mode)}
                    class={`relative z-1 px-3 md:px-4 py-1.5 text-[10px] font-black rounded-lg transition-all duration-500 uppercase tracking-widest ${compileMode.value === mode
                      ? 'text-[#646cff] dark:text-white'
                      : 'opacity-40 hover:opacity-100 hover:scale-105'
                      }`}
                  >
                    {mode}
                    {compileMode.value === mode && (
                      <div class="absolute inset-0 bg-white dark:bg-[#646cff] rounded-lg -z-1 shadow-[0_2px_8px_rgba(0,0,0,0.08)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div class="h-6 w-1px bg-base opacity-20" />
          </>
        )}

        <div class="flex items-center gap-3">
          <span class="text-[11px] font-bold uppercase tracking-[0.15em] opacity-30 select-none hidden sm:block">Version</span>
          <div class="relative group">
            <select
              id="essor-version"
              value={essorVersion.value}
              onChange={e => setEssorVersion(e.target.value)}
              class="appearance-none w-120px md:w-150px rounded-lg border-1 b-base bg-white dark:bg-[#1e1e20] text-black dark:text-gray-200 px-3 py-1.5 text-sm font-medium transition-all hover:bg-gray-100/50 dark:hover:bg-white/10 focus:ring-2 focus:ring-[#646cff]/30 outline-none cursor-pointer pr-8"
            >
              {essorVersions.value.map(version => (
                <option key={version} value={version} class="bg-white dark:bg-[#1e1e20] text-black dark:text-gray-200">
                  {version === 'local' ? 'Local Build' : version}
                </option>
              ))}
            </select>
            <div class="absolute right-2.5 top-1/2 -translate-y-1/2 i-carbon-chevron-down text-xs opacity-50 pointer-events-none" />
          </div>
        </div>

        <div class="h-6 w-1px bg-base opacity-20 hidden md:block" />

        <div class="flex items-center gap-3 md:gap-5">
          <button
            class="i-carbon-share icon-btn text-base hover:scale-110"
            onClick={shareUrl}
            title="Share URL"
          ></button>

          <button
            class="icon-btn text-base hover:scale-110"
            onClick={() => toggleDark()}
            title="Toggle Dark Mode"
          >
            {dark.value ? (
              <div class="i-carbon-moon text-blue-400" />
            ) : (
              <div class="i-carbon-sun text-yellow-500" />
            )}
          </button>

          <a
            class="i-carbon-logo-github icon-btn text-base hover:scale-110"
            rel="noreferrer"
            href="https://github.com/estjs/essor-playground"
            target="_blank"
            title="GitHub"
          />
        </div>
      </div>
    </div>
  );
}
