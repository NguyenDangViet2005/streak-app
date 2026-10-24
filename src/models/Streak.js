import mongoose from 'mongoose';
import { validDate } from '../utils/dates.js';
import { STREAK_COLORS, DEFAULT_STREAK_COLOR, MAX_STREAK_TITLE_LENGTH } from '../constants/streak.js';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: MAX_STREAK_TITLE_LENGTH },
  startDate: { type: String, required: true, validate: validDate },
  color: { type: String, enum: STREAK_COLORS, default: DEFAULT_STREAK_COLOR }
}, { timestamps: true, versionKey: false });
export default mongoose.model('Streak', schema);
