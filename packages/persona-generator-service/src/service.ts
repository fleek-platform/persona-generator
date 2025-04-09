import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { stream } from 'hono/streaming';

// TODO: Export build types
import { parseResponseData, PersonaGenerator  } from '@fleek-platform/persona-generator';

import { getDefined } from './defined.js';

const apiKey = getDefined('PRIVATE_OPENAI_COMPATIBLE_API_KEY');
const baseURL = getDefined('PUBLIC_OPENAI_COMPATIBLE_API_URL');
const model = getDefined('PUBLIC_OPENAI_COMPATIBLE_MODEL');

export const api = new Hono().basePath('/v1');

// TODO: Set allowed origin list
api.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Priority'],
  maxAge: 86400,
  credentials: true,
}));

api.get('/health', (ctx) => ctx.text('I am here live. I am not a cat!'));

api.post('/assistant', async (ctx) => {
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

api.post('/generate', async (ctx) => {
  const { content } = await ctx.req.json();
  
  const personaGenerator = new PersonaGenerator({
    apiKey,
    baseURL,
    model,
  });

  const { data, error, status } = await personaGenerator.generateCharacterfile({ content });

  if (!data || error || status !== 'success') {
    return ctx.json({ status: 'error', error: error || 'Unexpected error' });
  }

  return ctx.json({ status: 'success', data: parseResponseData(data), apiKey, baseURL, model });
});

api.post('/assistant/stream', async (ctx) => {
  const { content, messages } = await ctx.req.json();
  if (typeof content !== 'string' || !content) {
    return ctx.json({ status: 'error', error: 'Unexpected request' }, 400);
  }

  const personaGenerator = new PersonaGenerator({
    apiKey,
    baseURL,
    model,
  });

  return stream(ctx, async (streamWriter) => {
    try {
      const stream = await personaGenerator.assistantQueryStream({ content, messages });
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          await streamWriter.write(content);
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      await streamWriter.write(`Error: ${error.message}`);
    }
  });
});

api.post('/generate/stream', async (ctx) => {
  const { content } = await ctx.req.json();
  
  const personaGenerator = new PersonaGenerator({
    apiKey,
    baseURL,
    model,
  });

  return stream(ctx, async (streamWriter) => {
    try {
      const stream = await personaGenerator.generateCharacterfileStream({ content });
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          await streamWriter.write(content);
        }
      }
      
      console.log('Full streamed response:', fullText);
    } catch (error) {
      console.error('Streaming error:', error);
      await streamWriter.write(`Error: ${error.message}`);
    }
  });
});
