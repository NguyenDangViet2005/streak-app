import { AppError } from '../errors/AppError.js';
import { STREAK_COLORS, MAX_STREAK_TITLE_LENGTH } from '../constants/streak.js';
import { todayInZone, validDate } from '../utils/dates.js';

export function validateStreakInput(body, timeZone) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Dữ liệu streak không hợp lệ.');
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title || title.length > MAX_STREAK_TITLE_LENGTH) {
    throw new AppError(`Tên streak cần có từ 1 đến ${MAX_STREAK_TITLE_LENGTH} ký tự.`);
  }

  if (!validDate(body.startDate)) {
    throw new AppError('Ngày bắt đầu không hợp lệ (từ năm 1900).');
  }

  if (body.startDate > todayInZone(timeZone)) {
    throw new AppError('Hãy chọn ngày hôm nay hoặc một ngày trong quá khứ.');
  }

  if (body.color && !STREAK_COLORS.includes(body.color)) {
    throw new AppError('Màu không hợp lệ.');
  }

  return { title, startDate: body.startDate, color: body.color || undefined };
}
