import { building } from '$app/environment';
import { GlobalThisWSS } from '$lib/server/webSocketUtils';
import type { Handle } from '@sveltejs/kit';
import type { ExtendedGlobal } from '$lib/server/webSocketUtils';
import { connectToRedis } from '$lib/server/db';

// This can be extracted into a separate file
let wssInitialized = false;
const startupWebsocketServer = () => {
  if (wssInitialized) return;
  const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
  if (wss !== undefined) {
    wssInitialized = true;
  }
};

export const handle = (async ({ event, resolve }) => {
  startupWebsocketServer();
  // Skip WebSocket server when pre-rendering pages
  if (!building) {
    const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
    if (wss !== undefined) {
      event.locals.wss = wss;
    }
    const db = await connectToRedis();
    event.locals.db = db;
  }
  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-type'
  });
  return response;
}) satisfies Handle;
