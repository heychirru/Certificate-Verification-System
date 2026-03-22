/**
 * Ensures the client sent a non-empty JSON object in the body.
 * Fails fast when Postman/REST clients omit Content-Type or use "form" instead of raw JSON.
 */
const requireJsonBody = (req, res, next) => {
  const body = req.body;
  const hasFields =
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Object.keys(body).length > 0;

  if (hasFields) {
    return next();
  }

  return res.status(400).json({
    error: 'Missing JSON body',
    hint:
      'Send POST with header Content-Type: application/json and a raw JSON body, e.g. {"email":"you@example.com","password":"yourPassword"}',
  });
};

module.exports = requireJsonBody;
