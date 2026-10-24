import mongoose from 'mongoose';
import Streak from '../models/Streak.js';
import { AppError } from '../errors/AppError.js';
import { DEFAULT_STREAK_COLOR } from '../constants/streak.js';
import { validateStreakInput } from '../validators/streakValidator.js';
import { toStreakDto } from '../mappers/streakMapper.js';
import { todayInZone } from '../utils/dates.js';

async function findStreakById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new AppError('Không tìm thấy streak.', 404);
  }

  const streak = await Streak.findById(id);
  if (!streak) {
    throw new AppError('Streak đã bị xóa hoặc không tồn tại.', 404);
  }

  return streak;
}

export async function listStreaks(timeZone, today = todayInZone(timeZone)) {
  const streaks = await Streak.find().sort({ createdAt: -1 }).lean();
  return streaks.map(streak => toStreakDto(streak, timeZone, today));
}

export async function getDashboard(timeZone) {
  const today = todayInZone(timeZone);
  const streaks = await listStreaks(timeZone, today);

  return {
    streaks,
    today,
    totalDays: streaks.reduce((sum, streak) => sum + streak.days, 0),
    longest: Math.max(0, ...streaks.map(streak => streak.days))
  };
}

export async function getStreak(id, timeZone) {
  return toStreakDto(await findStreakById(id), timeZone);
}

export async function createStreak(body, timeZone) {
  const input = validateStreakInput(body, timeZone);
  const streak = await Streak.create({ ...input, color: input.color || DEFAULT_STREAK_COLOR });
  return toStreakDto(streak, timeZone);
}

export async function updateStreak(id, body, timeZone) {
  const streak = await findStreakById(id);
  const input = validateStreakInput(body, timeZone);

  streak.title = input.title;
  streak.startDate = input.startDate;
  if (input.color) streak.color = input.color;
  await streak.save();

  return toStreakDto(streak, timeZone);
}

export async function deleteStreak(id) {
  const streak = await findStreakById(id);
  await streak.deleteOne();
}
