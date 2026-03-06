import 'virtual:uno.css';
import '@unocss/reset/tailwind.css'
import './style.css';

import { createApp, onMount, watch } from 'essor';
import { Bar } from './components/Bar';
import { Edit } from './components/Edit';
import { Preview } from './components/Preview';
import { dark, setDark } from './utils';

function App() {
  // Initialize dark mode on mount
  onMount(() => {
    setDark();
  });

  // Watch for dark mode changes
  watch(dark, () => {
    setDark();
  });

  return (
    <div class="h-100vh w-100vw flex flex-col of-hidden relative bg-[var(--vt-c-bg)] transition-colors duration-500">
      {/* Vite-style background glow */}
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#646cff] blur-[120px] opacity-[0.05] dark:opacity-[0.1] pointer-events-none" />
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#42d392] blur-[120px] opacity-[0.05] dark:opacity-[0.1] pointer-events-none" />

      <Bar />
      <div class="w-full flex flex-col md:flex-row flex-1 of-hidden relative z-1">
        <div class="h-1/2 md:h-full w-full md:w-1/2 relative bg-base shadow-inner">
          <Edit />
          <div class="absolute right-0 top-0 bottom-0 w-1px bg-base opacity-20 z-10 hidden md:block" />
          <div class="absolute bottom-0 left-0 right-0 h-1px bg-base opacity-20 z-10 md:hidden" />
        </div>
        <div class="h-1/2 md:h-full w-full md:w-1/2">
          <Preview />
        </div>
      </div>
    </div>
  );
}

createApp(App, '#app');
