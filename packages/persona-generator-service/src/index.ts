import { streamHandle } from 'hono/aws-lambda';
import { api } from './service';

export const handler = streamHandle(api);

