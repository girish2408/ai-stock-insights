import logger from '../utils/logger.js';
import { runStockGraph } from '../graph/stockGraph.js';
import { getCachedReport, setCachedReport } from './cacheService.js';
import { normalizeError } from '../utils/errorHandler.js';

export async function getStockIntelligence(symbol, options = {}) {
  const normalizedSymbol = symbol.toUpperCase();
  const { forceRefresh = false } = options;

  if (!forceRefresh) {
    const cached = await getCachedReport(normalizedSymbol);
    if (cached) {
      return {
        ...cached,
        cacheHit: true
      };
    }
  }

  try {
    const startedAt = Date.now();
    console.log(`[OrchestratorService] Generating report for ${normalizedSymbol}`);
    const freshReport = await runStockGraph(normalizedSymbol);
    const elapsedMs = Date.now() - startedAt;
    console.log(`[OrchestratorService] Report generated in ${elapsedMs}ms`);

    const enrichedReport = {
      ...freshReport,
      symbol: normalizedSymbol,
      elapsedMs
    };

    await setCachedReport(normalizedSymbol, enrichedReport);
    return {
      ...enrichedReport,
      cacheHit: false
    };
  } catch (err) {
    const error = normalizeError(err, { symbol: normalizedSymbol });
    logger.error({ error }, 'Failed to generate stock intelligence report');
    throw err;
  }
}

