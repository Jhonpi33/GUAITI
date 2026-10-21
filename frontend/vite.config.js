import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls } }), quasar()],
  server: {
    // Puerto fijo del frontend en desarrollo (5173/3000 suelen estar tomados
    // por otros proyectos). Si está ocupado, Vite avisa con error en vez de saltar a otro.
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': {
        // Debe coincidir con PORT en backend/.env (4100)
        target: 'http://localhost:4100',
        changeOrigin: true,
      },
    },
  },
});
