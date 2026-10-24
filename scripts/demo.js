// Explicit demo only: real temporary MongoDB process, demo fixtures, no external credentials.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { createApp } from '../src/app.js';
import Streak from '../src/models/Streak.js';
import { todayInZone, DAY } from '../src/utils/dates.js';
const mongo = await MongoMemoryServer.create();
await connectDatabase(mongo.getUri());
const app = createApp();
const today = todayInZone(app.locals.timeZone);
const ago = days => new Date(Date.parse(`${today}T00:00:00Z`) - (days - 1) * DAY).toISOString().slice(0, 10);
await Streak.insertMany([
  { title: 'Đọc sách mỗi ngày', startDate: ago(42), color: 'orange' },
  { title: 'Vận động 30 phút', startDate: ago(18), color: 'green' },
  { title: 'Học tiếng Anh', startDate: ago(106), color: 'blue' },
  { title: 'Đi ngủ trước 23 giờ', startDate: ago(7), color: 'pink' },
  { title: 'Viết một điều biết ơn', startDate: ago(12), color: 'orange' }
]);
const server = app.listen(3000, '127.0.0.1', () => console.log('DEMO (temporary data): http://localhost:3000'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await disconnectDatabase(); await mongo.stop(); process.exit(0); }));
