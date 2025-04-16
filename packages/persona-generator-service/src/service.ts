import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamText } from 'hono/streaming';
import { rateLimiter } from "hono-rate-limiter";

import { parseResponseData, PersonaGenerator  } from '@fleek-platform/persona-generator';

import { getDefined } from './defined.js';
import { authMiddleware } from './middleware.js';

const apiKey = getDefined('PRIVATE_OPENAI_COMPATIBLE_API_KEY');
const baseURL = getDefined('PUBLIC_OPENAI_COMPATIBLE_API_URL');
const model = getDefined('PUBLIC_OPENAI_COMPATIBLE_MODEL');

export const api = new Hono().basePath('/v1');

const HEALTH_ENDPOINT = '/health';
const UNKNOWN_IP_ADDRESS = '0.0.0.0';

// TODO: Set allowed origin list
api.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST'],
  // TODO: Ideally we'd like to allow x-project-id
  // as we shouldn't get from accessToken
  // The accessToken shouldn't have projectId in it?!
  allowHeaders: ['content-type', 'authorization', 'accept', 'priority'],
  maxAge: 86400,
  credentials: true,
}));

api.use(
  rateLimiter({
    windowMs: 1 * 60 * 1000,
    limit: 60,
    standardHeaders: false,
    keyGenerator: (ctx) => {      
      try {
        const forwardedFor = ctx.req.header('x-forwarded-for');
        const sourceIp = 
          (forwardedFor ? forwardedFor.split(',')[0].trim() : '') ||
          // TODO: This only applies for gw and lb
          // which don't support stream response, thus
          // we never need to lookup or expect them.
          // Since there aren't alternatives? We might
          // want to deny the request going forward?
          ctx.req.header('x-amzn-source-ip') ||
          ctx.req.header('x-amzn-trace-id') || 
          '';

        if (!sourceIp) {
          throw new Error('No valid client IP found for rate limiting');
        }

        return sourceIp;
      } catch (err) {
        console.error('Rate limiter error:', err);

        return UNKNOWN_IP_ADDRESS;
      }
    },
    // TODO: set `store` as redisStore https://www.npmjs.com/package/@hono-rate-limiter/redis
  })
);

api.use('*', async (ctx, next) => {
  if (ctx.req.path.endsWith(HEALTH_ENDPOINT)) {
    return await next();
  }

  if (ctx.req.path.endsWith('stream-test')) {
    return await next();
  }

  return authMiddleware(ctx, next);
});

api.get(HEALTH_ENDPOINT, (ctx) => ctx.text('I am here live. I am not a cat!'));

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

  const responseStream = await personaGenerator.assistantQueryStream({ content, messages });

  return streamText(ctx, async (streamWriter) => {
    try {
      for await (const chunk of responseStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        await streamWriter.write(content);
      }
    } catch (error) {
      console.error('Streaming error:', error);
    }
  });
});

api.get('/stream-test', (c) => {
  console.log("Streaming started!");
  return streamText(c, async (stream) => {
    for (let i = 1; i <= 5; i++) {
      const chunk = `Chunk ${i}\n`;
      console.log(`Sending: ${chunk}`);
      await stream.write(chunk);
      await new Promise((r) => setTimeout(r, 1000));
    }
    await stream.close();
    console.log("Stream closed.");
  });
});
