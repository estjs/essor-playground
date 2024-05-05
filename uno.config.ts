import { defineConfig, presetIcons, presetUno } from 'unocss';
export default defineConfig({
  theme: {},
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
    }),
  ],
});
