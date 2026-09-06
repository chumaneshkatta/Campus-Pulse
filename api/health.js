export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'CampusPulse API is running on Vercel.',
    timestamp: new Date().toISOString(),
  });
}
