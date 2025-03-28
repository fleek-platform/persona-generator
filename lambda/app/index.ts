import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { getDefined } from '../../src/defined.js';
import { parseResponseData } from '../../src/utils/json.js';
import { PersonaGenerator } from '../../dist/index.js';
// import { PersonaGenerator } from '../../src/index.js';

export const app = new Hono().basePath('/v1');

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Priority'],
  maxAge: 86400,
  credentials: true,
}));

app.get('/health', (ctx) => ctx.text('I am here live. I am not a cat!'));

const apiKey = 'AIzaSyCQmnO-CFZEp4hgN-D75ZCIV6PIs_TqVpY';
const baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
const model = 'gemini-2.0-flash';

// TODO: Find a solution to replace node-fetch of openai
// due to `Error: Dynamic require of "stream" is not supported`
// which cause need to prebuild running lambda, e.g. sls dev
// const PersonaGenerator = true
//   ? (await import('../../dist/index.js')).PersonaGenerator
//   : (await import('../../src/index.js')).PersonaGenerator


app.post('/generate', async (ctx) => {
  console.log('Generate endpoint called');
  const { content } = await ctx.req.json();
  console.log('Request content:', content);
  
  const personaGenerator = new PersonaGenerator({
    apiKey,
    baseURL,
    model,
  });

  // if (typeof content !== 'string' || !content) {
  //   return ctx.json({ status: 'error', error: 'Unexpected request' }, 400);
  // }

  console.log('Making request to PersonaGenerator');
  const { data, error, status } = await personaGenerator.generateCharacterfile({ content });
  console.log('Response:', { data, error, status });

  if (!data || error || status !== 'success') {
    return ctx.json({ status: 'error', error: error || 'Unexpected error' });
  }

  return ctx.json({ status: 'success', data: parseResponseData(data), apiKey, baseURL, model });
});

app.post('/assistant', async (ctx) => {
  const { content, messages } = await ctx.req.json();
  if (typeof content !== 'string' || !content) {
    return ctx.json({ status: 'error', error: 'Unexpected request' }, 400);
  }

  const personaGenerator = new PersonaGenerator({
    apiKey,
    baseURL,
    model,
  });

  const { data, error, status } = await personaGenerator.assistantQuery({ content, messages });

  if (!data || error || status !== 'success') {
    return ctx.json({ status: 'error', error: error || 'Unexpected error' });
  }

  return ctx.json({ status: 'success', data });
});

app.get('/test-connection', async (ctx) => {
  try {
    console.log('Testing connection to Google API');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models');
    const status = response.status;
    console.log('Connection test result:', status);
    return ctx.json({ status: 'success', connectionStatus: status });
  } catch (error) {
    console.error('Connection test error:', error);
    return ctx.json({ status: 'error', error: error.message });
  }
});
