export function health(req, res) {
  res.json({
    service: "paymatch-backend",
    status: "ok",
    timestamp: new Date().toISOString()
  });
}

