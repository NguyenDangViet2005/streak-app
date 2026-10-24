import { createApp } from '../app.js';
import { env } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';

function listen(app) {
  return new Promise((resolve, reject) => {
    const server = app.listen(env.port, env.host, () => {
      server.off('error', reject);
      resolve(server);
    });
    server.once('error', reject);
  });
}

function registerShutdown(server) {
  let shuttingDown = false;

  async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
      await disconnectDatabase();
      process.exitCode = 0;
    } catch {
      console.error('Không thể đóng ứng dụng hoàn tất.');
      process.exitCode = 1;
    }
  }

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

export async function startServer() {
  try {
    const app = createApp();
    await connectDatabase();
    const server = await listen(app);
    registerShutdown(server);
    console.log(`Streak Garden: http://localhost:${env.port}`);
    return server;
  } catch {
    // Database errors can contain connection strings; do not log credentials.
    console.error('Không khởi động được. Kiểm tra cấu hình .env, MongoDB và cổng ứng dụng.');
    await disconnectDatabase();
    process.exitCode = 1;
    return null;
  }
}
