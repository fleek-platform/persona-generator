import { createMiddleware } from 'hono/factory';
import { isValidUserProjectAccount } from './rest-api-client';

export const authMiddleware = createMiddleware(async (ctx, next) => {
  const authHeader = ctx.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ctx.json({ status: 'error', error: 'Missing or invalid authorization' }, 401);
  }
  
  const accessToken = authHeader.split(' ')[1];
  
  const projectId = ctx.req.header('x-project-id');

  if (!projectId) {
    console.warn(`Expected a valid project id but got ${projectId} (${typeof projectId})`);
    
    return ctx.json({ status: 'error', error: 'Bad request' }, 400);
  }

  const isAuthorized = await isValidUserProjectAccount({ accessToken, projectId });
  
  if (!isAuthorized) {
    console.warn(`The request is unauthorized. Does the request include a valid access token and project id?`);

    return ctx.json({ status: 'error', error: 'Unauthorized' }, 401);
  }

  return await next();
});
