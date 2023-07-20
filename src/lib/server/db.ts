import { createClient } from 'redis';
import { rankedChoiceResults } from './utils';
import type { Screen } from '../ws';

export type DBProposal = {
  name: string;
  user: string;
};

export type DBVote = {
  ranking: string[];
  user: string;
};

export type Room = {
  proposals: DBProposal[];
  users: string[];
  admin: string;
  votes: DBVote[];
  screen: Screen;
  winner: string;
};

export interface ExtendedRedisClient extends ReturnType<typeof createClient> {
  createRoom: (roomId: string, userId: string) => Promise<boolean>;
  addProposal: (roomId: string, socketId: string, proposal: string) => Promise<void>;
  startVoting: (roomId: string) => Promise<void>;
  removeProposal: (roomId: string, proposal: string) => Promise<void>;
  addVote: (roomId: string, socketId: string, ranking: string[]) => Promise<void>;
  resetRoom: (roomId: string) => Promise<void>;
  showResults: (roomId: string) => Promise<void>;
  addUser: (roomId: string, socketId: string) => Promise<void>;
  startProposing: (roomId: string) => Promise<void>;
}

console.log('Creating Redis Client');
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
}) as ExtendedRedisClient;

client.on('error', (err) => console.log('Redis Client Error', err));

client.createRoom = async (roomId, userId) => {
  const response = await client.json.set(
    roomId,
    '$',
    {
      proposals: [],
      users: [],
      votes: [],
      screen: 'lobby',
      winner: '',
      admin: userId
    } as Room,
    {
      NX: true
    }
  );
  client.expire(roomId, 60 * 60 * 24);
  return !!response;
};

client.addProposal = async (roomId, socketId, proposal) => {
  const script = `
local proposals = redis.call('JSON.GET', KEYS[1], '$.proposals..name')
local list = cjson.decode(proposals)
for i, el in pairs(list) do
    if string.lower(el) == string.lower(ARGV[1]) then
        return nil
    end
end
return redis.call('JSON.ARRAPPEND', KEYS[1], '$.proposals', ARGV[2])
`;
  await client.eval(script, {
    keys: [roomId],
    arguments: [proposal, JSON.stringify({ name: proposal, user: socketId } as DBProposal)]
  });
  client.publish(roomId, 'update');
};

client.startVoting = async (roomId) => {
  await client.json.set(roomId, '$.screen', 'voting' as Screen);
  client.publish(roomId, 'update');
};

client.removeProposal = async (roomId, proposal) => {
  await client.json.del(roomId, '$.proposals[?(@.name=="' + proposal + '")]');
  client.publish(roomId, 'update');
};

client.addVote = async (roomId, socketId, ranking) => {
  const script = `
local votes = redis.call('JSON.GET', KEYS[1], '$.votes..name')
local list = cjson.decode(votes)
for i, el in pairs(list) do
    if el.user == ARGV[1] then
        return nil
    end
end
return redis.call('JSON.ARRAPPEND', KEYS[1], '$.votes', ARGV[2])
`;
  await client.eval(script, {
    keys: [roomId],
    arguments: [socketId, JSON.stringify({ ranking, user: socketId } as DBVote)]
  });
  client.publish(roomId, 'update');
};

client.resetRoom = async (roomId) => {
  // reset room as one transaction
  const screen = (await client.json.get(roomId, { path: '$.screen' })) as Screen;
  if (screen[0] === 'results') {
    await client
      .multi()
      .json.set(roomId, '$.proposals', [] as DBProposal[])
      .json.set(roomId, '$.votes', [] as DBVote[])
      .json.set(roomId, '$.screen', 'proposing' as Screen)
      .json.set(roomId, '$.winner', '')
      .exec();
    client.publish(roomId, 'update');
  }
};

client.showResults = async (roomId) => {
  //const proposals = (await client.json.get(roomId, '$.proposals')) as Proposal[];
  const votes = (await client.json.get(roomId, {
    path: '$.votes..ranking'
  })) as string[][];

  const winner = rankedChoiceResults(votes);
  await client.json.set(roomId, '$.winner', winner);
  await client.json.set(roomId, '$.screen', 'results');
  client.publish(roomId, 'update');
};

client.addUser = async (roomId, socketId) => {
  const user = (await client.json.get(roomId, {
    path: '$.users.*[?(@=="' + socketId + '")]'
  })) as string[];
  if (user.length > 0) {
    return;
  }
  await client.json.arrAppend(roomId, '$.users', socketId);
  client.publish(roomId, 'update');
};

client.startProposing = async (roomId) => {
  await client.json.set(roomId, '$.screen', 'proposing' as Screen);
  client.publish(roomId, 'update');
};

export const connectToRedis = async () => {
  if (client.isReady) {
    return client;
  }
  console.log('Connecting to Redis...');
  await client.connect();
  return client;
};
