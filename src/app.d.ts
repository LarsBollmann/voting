/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />

import type { ExtendedRedisClient } from '$lib/server/db';
import type { ExtendedWebSocketServer } from '$lib/server/webSocketUtils';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      wss?: ExtendedWebSocketServer;
      db?: ExtendedRedisClient;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
