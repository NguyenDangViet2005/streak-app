import * as streakService from '../services/streakService.js';
import { getWidgetManifest } from '../services/widgetService.js';

export async function home(req, res) {
  const dashboard = await streakService.getDashboard(req.app.locals.timeZone);
  res.render('index', dashboard);
}

export async function list(req, res) {
  const streaks = await streakService.listStreaks(req.app.locals.timeZone);
  res.json(streaks);
}

export async function read(req, res) {
  const streak = await streakService.getStreak(req.params.id, req.app.locals.timeZone);
  res.json(streak);
}

export async function create(req, res) {
  const streak = await streakService.createStreak(req.body, req.app.locals.timeZone);
  res.status(201).json(streak);
}

export async function update(req, res) {
  const streak = await streakService.updateStreak(req.params.id, req.body, req.app.locals.timeZone);
  res.json(streak);
}

export async function remove(req, res) {
  await streakService.deleteStreak(req.params.id);
  res.status(204).end();
}

export async function widget(req, res) {
  const streak = await streakService.getStreak(req.params.id, req.app.locals.timeZone);
  res.render('widget', { streak });
}

export async function manifest(req, res) {
  const manifest = await getWidgetManifest(req.params.id, req.app.locals.timeZone);
  res.type('application/manifest+json').json(manifest);
}
