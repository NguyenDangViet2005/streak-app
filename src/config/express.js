import { paths } from './paths.js';
import { getAppConfig } from './env.js';
import { formatDate } from '../utils/dates.js';

export function configureExpress(app, options) {
  const config = getAppConfig(options);

  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', paths.views);
  app.locals.timeZone = config.timeZone;
  app.locals.appUrl = config.appUrl;
  app.locals.formatDate = formatDate;
}
