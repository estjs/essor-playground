import { defineConfig, presetIcons, presetUno } from 'unocss';
export default defineConfig({
  theme: {},
  shortcuts: {
    'b-base': 'border-#aaa5',
  },
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
});
