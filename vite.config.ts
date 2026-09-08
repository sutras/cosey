import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// import vueDevTools from 'vite-plugin-vue-devtools';

import path from 'node:path';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  return {
    plugins: [
      tailwindcss(),
      vue(),
      vueJsx(),
      // vueDevTools(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        svgoOptions: isBuild,
        symbolId: 'icon-[dir]-[name]',
      }),
      visualizer(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['cosey'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8880',
          changeOrigin: true,
        },
      },
      port: 8882,
      open: true,
      watch: {
        ignored: path.resolve(__dirname, './docs'),
      },
    },
  };
});
