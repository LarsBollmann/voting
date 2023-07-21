import type { Room } from '$lib/server/db.js';
import { createWsStateFromDBState } from '$lib/server/webSocket.js';
import { parseCookie } from '$lib/util';
import { error } from '@sveltejs/kit';
import { nanoid } from 'nanoid';

export const load = async ({ params, locals, request, cookies }) => {
  const room = (await locals.db?.json.get(params.room)) as Room;
  console.log(room);

  let userId = parseCookie(request.headers.get('cookie')).userId;

  if (!userId) {
    userId = nanoid(8);
    cookies.set('userId', userId, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });
  }

  if (!room) {
    throw error(404, 'Room not found');
  }
  if (!room.users.includes(userId)) {
    if (room.screen !== 'lobby') {
      throw error(403, 'Room is in progress');
    }
  }
  return {
    state: createWsStateFromDBState(room, params.room, userId)
  };
};
