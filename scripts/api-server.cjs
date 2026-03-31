const express = require('express');

const app = express();
const port = Number(process.env.API_PORT || 3001);

app.use(express.json());

// In-memory token store (replace with DB lookup in production).
const tokenStore = new Map();

const getUserTokens = (userId) => {
  if (!tokenStore.has(userId)) {
    tokenStore.set(userId, 0);
  }
  return tokenStore.get(userId);
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// GET /user/tokens?userId=abc123
app.get('/user/tokens', (req, res) => {
  const userId = String(req.query.userId || '').trim();

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter is required' });
  }

  const tokens = getUserTokens(userId);
  return res.json({ userId, tokens });
});

// POST /deduct
// body: { userId: string, amount: number }
app.post('/deduct', (req, res) => {
  const userId = String(req.body?.userId || '').trim();
  const amount = Number(req.body?.amount);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const currentTokens = getUserTokens(userId);

  if (amount > currentTokens) {
    return res.status(400).json({
      error: 'insufficient tokens',
      userId,
      tokens: currentTokens,
    });
  }

  const updatedTokens = currentTokens - amount;
  tokenStore.set(userId, updatedTokens);

  return res.json({
    success: true,
    userId,
    deducted: amount,
    tokens: updatedTokens,
  });
});

// Optional helper endpoint to top up tokens during local testing.
app.post('/user/tokens', (req, res) => {
  const userId = String(req.body?.userId || '').trim();
  const tokens = Number(req.body?.tokens);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  if (!Number.isFinite(tokens) || tokens < 0) {
    return res.status(400).json({ error: 'tokens must be a non-negative number' });
  }

  tokenStore.set(userId, tokens);
  return res.json({ success: true, userId, tokens });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
