import { makeID } from '$lib/server/utils';
import { nanoid } from 'nanoid';

export async function POST({ locals, cookies }) {
  const roomId = makeID(5);
  let userId = cookies.get('userId');

  if (!userId) {
    userId = nanoid(8);
  }
  cookies.set('userId', userId, { path: '/', expires: new Date(Date.now() + 1000 * 60 * 60 * 24) });
  const success = await locals.db?.createRoom(roomId, userId);
  if (!success) {
    return new Response('Room already exists', { status: 500 });
  }
  return new Response(roomId, { status: 200 });
}
