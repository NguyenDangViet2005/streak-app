import express from 'express';
import { configureExpress } from './config/express.js';
import { registerMiddleware, registerErrorHandlers } from './middlewares/index.js';
import routes from './routes/streakRoutes.js';

export function createApp(options = {}) {
  const app = express();

  configureExpress(app, options);
  registerMiddleware(app);
  app.use(routes);
  registerErrorHandlers(app);

  return app;
}
