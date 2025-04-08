import { handle } from 'hono/aws-lambda';
import { app } from './service';

export const handler = handle(app);
