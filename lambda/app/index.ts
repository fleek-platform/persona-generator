import { Hono } from 'hono';

import { getDefined } from '../../src/defined.js';
import { PersonaGenerator } from '../../src/index.js';
import { parseResponseData } from '../../src/utils/json.js';

export const app = new Hono().basePath('/v1');

app.get('/health', (ctx) => ctx.text('I here live. I am not a cat!'));

// TODO: Setup access control allow origin
// to acccept only known hostnames
// e.g. fleek.xyz, fleeksandbox.xyz
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Access-Control-Max-Age': '86400',
};

const apiKey = getDefined('PRIVATE_OPENAI_COMPATIBLE_API_KEY');
const baseURL = getDefined('PUBLIC_OPENAI_COMPATIBLE_API_URL');
const model = getDefined('PUBLIC_OPENAI_COMPATIBLE_MODEL');

const personaGenerator = new PersonaGenerator({
  apiKey,
  baseURL,
  model,
});

app.post('/generate', async (ctx) => {
  if (ctx.req.method === 'OPTIONS') {
    return ctx.newResponse(null, { status: 204, headers });
  }

  const { content } = await ctx.req.json();
  if (typeof content !== 'string' || !content) {
    return ctx.json({ status: 'error', error: 'Unexpected request' }, 400);
  }

  const { data, error, status } = await personaGenerator.generateCharacterfile({ content });

  if (!data || error || status !== 'success') {
    return ctx.json({ status: 'error', error: error || 'Unexpected error' });
  }

  return ctx.json({ status: 'success', data: parseResponseData(data) });
});

app.post('/assistant', async (ctx) => {
  if (ctx.req.method === 'OPTIONS') {
    return ctx.newResponse(null, { status: 204, headers });
  }

  const { content, messages } = await ctx.req.json();
  if (typeof content !== 'string' || !content) {
    return ctx.json({ status: 'error', error: 'Unexpected request' }, 400);
  }

  const { data, error, status } = await personaGenerator.assistantQuery({ content, messages });

  if (!data || error || status !== 'success') {
    return ctx.json({ status: 'error', error: error || 'Unexpected error' });
  }

  return ctx.json({ status: 'success', data });
});
