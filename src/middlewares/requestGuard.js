import { AppError } from '../errors/AppError.js';

const writeMethods = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

function hasForeignOrigin(req) {
  const origin = req.get('origin');
  if (!origin) return false;

  try {
    return new URL(origin).host !== req.get('host');
  } catch {
    return true;
  }
}

export function requestGuard(req, _res, next) {
  if (!writeMethods.has(req.method)) return next();

  if (req.get('sec-fetch-site') === 'cross-site' || hasForeignOrigin(req)) {
    return next(new AppError('Yêu cầu khác nguồn bị từ chối.', 403));
  }

  const contentType = (req.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return next(new AppError('Yêu cầu cần dùng application/json.', 415));
  }

  next();
}
