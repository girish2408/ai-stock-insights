import { Router } from 'express';
import { getFilings } from '../services/stockAggregator.js';

const router = Router();

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const filings = await getFilings(symbol);
    res.json(filings);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch SEC filings',
      error: err.message
    });
  }
});

export default router;

