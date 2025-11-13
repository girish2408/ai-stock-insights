import { Router } from 'express';
import { getStockIntelligence } from '../services/orchestratorService.js';

const router = Router();

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { refresh } = req.query;

  try {
    const report = await getStockIntelligence(symbol, {
      forceRefresh: refresh === 'true'
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to generate stock intelligence report',
      error: err.message
    });
  }
});

export default router;

