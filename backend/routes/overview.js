import { Router } from 'express';
import { getOverview } from '../services/stockAggregator.js';

const router = Router();

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const overview = await getOverview(symbol);
    res.json(overview);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch stock overview',
      error: err.message
    });
  }
});

export default router;

