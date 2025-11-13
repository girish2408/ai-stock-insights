import { Router } from 'express';
import { getNews } from '../services/stockAggregator.js';

const router = Router();

router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const news = await getNews(symbol);
    res.json(news);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch latest news',
      error: err.message
    });
  }
});

export default router;

