import { Router } from 'express';
import { getEarnings } from '../services/stockAggregator.js';

const router = Router();

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const earnings = await getEarnings(symbol);
    res.json(earnings);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch earnings calendar',
      error: err.message
    });
  }
});

export default router;

