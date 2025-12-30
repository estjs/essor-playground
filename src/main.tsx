import 'virtual:uno.css';
import '@unocss/reset/tailwind.css';
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
    <div class="h-100vh w-100vw flex flex-col of-hidden">
      <Bar />
      <div class="w-full flex flex-1 of-hidden">
        <div class="h-full w-1/2">
          <Edit />
        </div>
        <div class="h-full w-1/2">
          <Preview />
        </div>
      </div>
    </div>
  );
}

createApp(App, '#app');
