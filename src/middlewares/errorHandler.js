import { AppError } from '../errors/AppError.js';

const defaultMessages = {
  400: 'Dữ liệu JSON không hợp lệ.',
  413: 'Dữ liệu quá lớn.'
};

// Express identifies error middleware by its four-parameter signature.
export function errorHandler(error, req, res, _next) {
  const status = error.status || 500;
  const message = error instanceof AppError
    ? error.message
    : defaultMessages[status] || 'Không thể xử lý yêu cầu. Hãy thử lại.';

  if (status >= 500) console.error(error.message);

  if (error instanceof AppError || req.path.startsWith('/api/')) {
    return res.status(status).json({ error: message });
  }

  res.status(status).send(message);
}
