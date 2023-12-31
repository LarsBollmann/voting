import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

import { createWSSGlobalInstance, onHttpServerUpgrade } from './src/lib/server/webSocketUtils';

export default defineConfig({
  plugins: [
    sveltekit(),
    {
      name: 'integratedWebsocketServer',
      configureServer(server) {
        createWSSGlobalInstance();
        server.httpServer?.on('upgrade', onHttpServerUpgrade);
      }
    },
    Icons({
      compiler: 'svelte'
    })
  ]
});
