import { handle } from 'hono/aws-lambda';
import { api } from './service';

export const handler = handle(api);
