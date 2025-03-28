import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { getDefined } from '../../src/defined.js';
import { parseResponseData } from '../../src/utils/json.js';
// import { PersonaGenerator } from '../../dist/index.js';

export const app = new Hono().basePath('/v1');

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Priority'],
  maxAge: 86400,
  credentials: true,
}));

app.get('/health', (ctx) => ctx.text('I am here live. I am not a cat!'));

const apiKey = getDefined('PRIVATE_OPENAI_COMPATIBLE_API_KEY');
const baseURL = getDefined('PUBLIC_OPENAI_COMPATIBLE_API_URL');
const model = getDefined('PUBLIC_OPENAI_COMPATIBLE_MODEL');

// TODO: Find a solution to replace node-fetch of openai
// due to `Error: Dynamic require of "stream" is not supported`
// which cause need to prebuild running lambda, e.g. sls dev
const PersonaGenerator = process.env.LAMBDA_RUNNER_MODE === 'dist'
  ? (await import('../../dist/index.js')).PersonaGenerator
  : (await import('../../src/index.js')).PersonaGenerator

const personaGenerator = new PersonaGenerator({
  apiKey,
  baseURL,
  model,
});

// app.post('/generate', async (ctx) => {
//   const { content } = await ctx.req.json();
//   if (typeof content !== 'string' || !content) {
//     return ctx.json({ status: 'error', error: 'Unexpected request' }, 400);
//   }

//   const { data, error, status } = await personaGenerator.generateCharacterfile({ content });

//   if (!data || error || status !== 'success') {
//     return ctx.json({ status: 'error', error: error || 'Unexpected error' });
//   }

//   return ctx.json({ status: 'success', data: parseResponseData(data) });
// });

// app.post('/assistant', async (ctx) => {
//   const { content, messages } = await ctx.req.json();
//   if (typeof content !== 'string' || !content) {
//     return ctx.json({ status: 'error', error: 'Unexpected request' }, 400);
//   }

//   const { data, error, status } = await personaGenerator.assistantQuery({ content, messages });

//   if (!data || error || status !== 'success') {
//     return ctx.json({ status: 'error', error: error || 'Unexpected error' });
//   }

//   return ctx.json({ status: 'success', data });
// });
