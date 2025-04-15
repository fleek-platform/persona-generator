import { createMiddleware } from 'hono/factory';
import { isValidUserProjectAccount } from './rest-api-client';
import { decodeProjectId } from './utils/accessToken.js';

export const authMiddleware = createMiddleware(async (ctx, next) => {
  const authHeader = ctx.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ctx.json({ status: 'error', error: 'Missing or invalid authorization' }, 401);
  }
  
  const accessToken = authHeader.split(' ')[1];

  // TODO: Ideally we'd rather have a header
  // that allows x-project-id
  // at the moment cloudfront doesn't seem to allow it
  // for some reason, so we decode it from token
  // but token shouldn't have the projectid in it :T  
  const projectId = decodeProjectId(accessToken);

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
