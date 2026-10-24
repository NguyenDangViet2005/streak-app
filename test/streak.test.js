import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app.js';
import Streak from '../src/models/Streak.js';
import { todayInZone, countDays, validDate } from '../src/utils/dates.js';
import * as streakService from '../src/services/streakService.js';
import { getAppConfig } from '../src/config/env.js';
let mongo, app;
before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  app = createApp({ timeZone: 'Asia/Ho_Chi_Minh' });
}, { timeout: 180000 });
after(async () => { await disconnectDatabase(); if (mongo) await mongo.stop(); });
beforeEach(async () => { await Streak.deleteMany({}); });
const create = body => request(app).post('/api/streaks').send({ title: 'Đọc sách', startDate: '2024-01-01', ...body });
test('calendar-day counting includes day 1 and leap days', () => {
  assert.equal(countDays('2024-02-28', '2024-03-01'), 3);
  assert.equal(countDays('2024-03-01', '2024-03-01'), 1);
  assert.equal(countDays('2024-12-31', '2025-01-01'), 2);
});
test('timezone rolls over at Vietnamese midnight', () => {
  assert.equal(todayInZone('Asia/Ho_Chi_Minh', new Date('2026-10-22T17:01:00Z')), '2026-10-23');
  assert.equal(todayInZone('America/New_York', new Date('2026-10-22T17:01:00Z')), '2026-10-22');
});
test('strict calendar validation', () => {
  assert.equal(validDate('2024-02-29'), true);
  for (const date of ['2023-02-29', '2024-04-31', '1800-01-01', '2024-1-1', '<script>', null]) assert.equal(validDate(date), false);
});
test('empty state renders without sample records', async () => {
  const response = await request(app).get('/').expect(200);
  assert.match(response.text, /Bắt đầu ngọn lửa đầu tiên/);
  assert.equal(await Streak.countDocuments(), 0);
});
test('create past streak persists in real MongoDB', async () => {
  const response = await create({ title: '  Học tiếng Anh  ' }).expect(201);
  assert.equal(response.body.title, 'Học tiếng Anh');
  assert.equal(response.body.days, countDays('2024-01-01', todayInZone()));
  assert.equal((await Streak.findById(response.body.id)).startDate, '2024-01-01');
});
test('today starts at one day', async () => { const result = await create({ startDate: todayInZone() }); assert.equal(result.body.days, 1); });
test('supports multiple independent streaks', async () => {
  await create({ title: 'A' }); await create({ title: 'B' });
  const response = await request(app).get('/api/streaks').expect(200);
  assert.equal(response.body.length, 2); assert.notEqual(response.body[0].id, response.body[1].id);
});
test('update title and date together changes computed count', async () => {
  const { body } = await create({});
  const update = await request(app).put(`/api/streaks/${body.id}`).send({ title: 'Tên mới', startDate: todayInZone(), color: 'pink' }).expect(200);
  assert.equal(update.body.title, 'Tên mới'); assert.equal(update.body.days, 1); assert.equal(update.body.color, 'pink');
  assert.equal((await request(app).get(`/api/streaks/${body.id}`)).body.startDate, todayInZone());
});
test('invalid inputs never create records', async () => {
  for (const body of [{ title: '' }, { title: 'x'.repeat(81) }, { title: {} }, { startDate: '2999-01-01' }, { startDate: '2025-02-29' }, { startDate: {} }, { color: 'bad' }]) await create(body).expect(400);
  assert.equal(await Streak.countDocuments(), 0);
});
test('invalid update leaves original record intact', async () => {
  const { body } = await create({});
  await request(app).put(`/api/streaks/${body.id}`).send({ title: '', startDate: '2024-01-02' }).expect(400);
  assert.equal((await Streak.findById(body.id)).title, 'Đọc sách');
});
test('deleting streak invalidates API, widget page and manifest', async () => {
  const { body } = await create({});
  await request(app).delete(`/api/streaks/${body.id}`).set('Content-Type', 'application/json').expect(204);
  for (const url of [`/api/streaks/${body.id}`, `/widget/${body.id}`, `/manifest/${body.id}.webmanifest`]) await request(app).get(url).expect(404);
});
test('missing and malformed IDs return 404', async () => {
  await request(app).get('/api/streaks/bad-id').expect(404);
  await request(app).get('/api/streaks/000000000000000000000000').expect(404);
});
test('HTML escapes titles on dashboard, attribute and widget page', async () => {
  const { body } = await create({ title: '<script>alert("XSS")</script>' });
  for (const url of ['/', `/widget/${body.id}`]) {
    const response = await request(app).get(url).expect(200);
    assert.ok(!response.text.includes('<script>alert(')); assert.match(response.text, /&lt;script&gt;/);
  }
});
test('each streak has a unique install manifest and URL', async () => {
  const { body } = await create({});
  const response = await request(app).get(`/manifest/${body.id}.webmanifest`).expect(200);
  assert.equal(response.body.start_url, `/widget/${body.id}`); assert.equal(response.body.id, `/widget/${body.id}`);
  assert.equal(response.body.icons.length, 2);
});
test('browser cross-origin writes and form submissions rejected', async () => {
  await create({}).set('Origin', 'https://evil.example').expect(403);
  await create({}).set('Sec-Fetch-Site', 'cross-site').expect(403);
  await request(app).post('/api/streaks').type('form').send({ title: 'x' }).expect(415);
  assert.equal(await Streak.countDocuments(), 0);
});
test('malformed JSON produces controlled error and no data cache', async () => {
  await request(app).post('/api/streaks').set('Content-Type', 'application/json').send('{').expect(400);
  await request(app).post('/api/streaks').set('Content-Type', 'application/json').send('null').expect(400);
  await request(app).post('/api/streaks').send([]).expect(400);
  const response = await request(app).get('/api/streaks'); assert.equal(response.headers['cache-control'], 'no-store');
});
test('widget downloads and PWA assets are served', async () => {
  for (const url of ['/manifest.webmanifest', '/sw.js', '/icons/icon-192.png', '/icons/icon-512.png', '/downloads/StreakGarden.js', '/downloads/StreakGarden-Windows.zip']) await request(app).get(url).expect(200);
});

test('services build dashboard data without HTTP objects', async () => {
  const timeZone = 'Asia/Ho_Chi_Minh';
  const today = todayInZone(timeZone);
  await streakService.createStreak({ title: '  Hôm nay  ', startDate: today, color: 'green' }, timeZone);
  const older = await streakService.createStreak({ title: 'Hành trình', startDate: '2024-01-01' }, timeZone);
  const dashboard = await streakService.getDashboard(timeZone);

  assert.equal(dashboard.streaks.length, 2);
  assert.equal(dashboard.totalDays, 1 + older.days);
  assert.equal(dashboard.longest, older.days);
  assert.equal(dashboard.today, today);
  assert.ok(dashboard.streaks.every(streak => streak.today === today && streak.timeZone === timeZone));
});

test('service validation prevents invalid writes and preserves omitted color on updates', async () => {
  const timeZone = 'Asia/Ho_Chi_Minh';
  const input = { title: 'Streak', startDate: todayInZone(timeZone), color: 'green' };
  const streak = await streakService.createStreak(input, timeZone);
  await assert.rejects(streakService.createStreak({ ...input, title: '' }, timeZone), { status: 400 });
  const updated = await streakService.updateStreak(streak.id, { title: 'Tên mới', startDate: input.startDate }, timeZone);
  assert.equal(updated.color, 'green');
  assert.equal(await Streak.countDocuments(), 1);
});

test('application configuration is isolated per instance and rejects invalid timezones', () => {
  const first = createApp({ timeZone: 'UTC', appUrl: 'https://first.example' });
  const second = createApp({ timeZone: 'Asia/Ho_Chi_Minh', appUrl: 'https://second.example' });
  assert.equal(first.locals.timeZone, 'UTC');
  assert.equal(second.locals.timeZone, 'Asia/Ho_Chi_Minh');
  assert.equal(first.locals.appUrl, 'https://first.example');
  assert.equal(second.locals.appUrl, 'https://second.example');
  assert.throws(() => getAppConfig({ timeZone: 'Invalid/TimeZone' }), RangeError);
});
