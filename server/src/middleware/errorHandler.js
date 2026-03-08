export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  const message = err?.message || 'Internal server error';
  res.status(statusCode).json({ message });
}
