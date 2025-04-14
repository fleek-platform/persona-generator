// import { Hono } from 'hono';
// import { streamText } from 'hono/streaming';
// import { streamHandle } from 'hono/aws-lambda';

// const api = new Hono();

// api.get('/stream', (c) => {
//   console.log("Streaming started!");
//   return streamText(c, async (stream) => {
//     for (let i = 1; i <= 5; i++) {
//       const chunk = `Chunk ${i}\n`;
//       console.log(`Sending: ${chunk}`);
//       await stream.write(chunk);
//       await new Promise((r) => setTimeout(r, 1000));
//     }
//     await stream.close();
//     console.log("Stream closed.");
//   });
// });

// api.get('/health', (ctx) => ctx.text('I am here live. I am not a cat!'));

// export const handler = streamHandle(api);

import { streamHandle } from 'hono/aws-lambda';
import { api } from './service';

export const handler = streamHandle(api);

