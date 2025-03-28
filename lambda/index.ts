// import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { app } from './app';

// const app = new Hono()

// app.get('/', (c) => c.text('Hello World from Hono on AWS Lambda!'))

// app.get('/api/info', (c) => {
//   return c.json({
//     message: 'Hello from Hono API',
//     timestamp: new Date().toISOString(),
//     framework: 'Hono on AWS Lambda'
//   })
// })

export const handler = handle(app)
