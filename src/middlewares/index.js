import express from 'express';
import helmet from 'helmet';
import { paths } from '../config/paths.js';
import { securityOptions } from '../config/security.js';
import { requestGuard } from './requestGuard.js';
import { noStore } from './noStore.js';
import { notFound } from './notFound.js';
import { errorHandler } from './errorHandler.js';

export function registerMiddleware(app) {
  app.use(helmet(securityOptions));
  app.use(requestGuard);
  app.use(express.json({ limit: '8kb' }));
  app.use('/api', noStore);
  app.use('/downloads', express.static(paths.downloads));
  app.use(express.static(paths.public));
}

export function registerErrorHandlers(app) {
  app.use(notFound);
  app.use(errorHandler);
}
