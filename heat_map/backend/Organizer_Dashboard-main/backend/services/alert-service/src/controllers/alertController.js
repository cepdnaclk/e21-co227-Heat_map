const { broadcastAlert } = require('../wsManager');

exports.sendAlert = (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ ok: false, error: 'message (string) is required' });
  }
  const deliveredTo = broadcastAlert(message.trim());
  res.json({ ok: true, deliveredTo });
};
