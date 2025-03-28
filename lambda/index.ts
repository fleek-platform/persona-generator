import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';

const app = new Hono().basePath('/v1');

app.get('/', (c) => c.text('Hello Hono!'));
app.get('/health', (c) => c.text('I am alive!'));

export const handler = handle(app);
