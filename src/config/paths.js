import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const paths = Object.freeze({
  root,
  env: path.join(root, '.env'),
  views: path.join(root, 'src/views'),
  public: path.join(root, 'public'),
  downloads: path.join(root, 'widgets/downloads')
});
