import dotenv from 'dotenv';
import { paths } from './paths.js';

dotenv.config({ path: paths.env });

export const env = Object.freeze({
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/streak_garden',
  timeZone: process.env.APP_TIMEZONE || 'Asia/Ho_Chi_Minh',
  appUrl: process.env.APP_URL || ''
});

export function getAppConfig(options = {}) {
  const config = {
    timeZone: options.timeZone || env.timeZone,
    appUrl: options.appUrl ?? env.appUrl
  };

  new Intl.DateTimeFormat('en', { timeZone: config.timeZone });
  return Object.freeze(config);
}
