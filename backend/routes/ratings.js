import { Router } from 'express';
import { getRatings } from '../services/stockAggregator.js';

const router = Router();

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const ratings = await getRatings(symbol);
    res.json(ratings);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch analyst ratings',
      error: err.message
    });
  }
});

export default router;

