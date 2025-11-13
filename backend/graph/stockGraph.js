import { StateGraph } from '@langchain/langgraph';
import inputNode from './nodes/inputNode.js';
import aggregateNode from './nodes/aggregateNode.js';
import summarizerNode from './nodes/summarizerNode.js';

const graph = new StateGraph({
  channels: {
    state: {
      value: (prev, next) => {
        console.log(`\n[StateReducer] ===== MERGING STATE =====`);
        console.log(`[StateReducer] Prev type:`, typeof prev, `keys:`, Object.keys(prev || {}));
        console.log(`[StateReducer] Next type:`, typeof next, `keys:`, Object.keys(next || {}));
        console.log(`[StateReducer] Next value:`, next);
        
        // Handle case where next might be wrapped (shouldn't happen, but be safe)
        const nextState = next?.state || next;
        
        // If next has all the data (from AggregateNode), use it directly
        // This handles the case where AggregateNode returns complete state
        if (nextState && (nextState.earnings !== undefined || nextState.filings !== undefined || nextState.news !== undefined || 
                     nextState.overview !== undefined || nextState.performance !== undefined || nextState.analystRatings !== undefined)) {
          console.log(`[StateReducer] 🔄 MERGING: Next contains data fields from AggregateNode - using nextState as base`);
          const merged = {
            ...nextState,
            // Merge agentStates arrays
            agentStates: [...(prev?.agentStates || []), ...(nextState?.agentStates || [])]
          };
          console.log(`[StateReducer] ✅ STATE FILLED:`, {
            earnings: merged.earnings ? '✅ present' : '❌ null',
            filings: merged.filings ? `✅ present (${Array.isArray(merged.filings) ? merged.filings.length : '?'})` : '❌ null',
            analystRatings: merged.analystRatings ? `✅ present (${Array.isArray(merged.analystRatings) ? merged.analystRatings.length : '?'})` : '❌ null',
            news: merged.news ? `✅ present (${Array.isArray(merged.news) ? merged.news.length : '?'})` : '❌ null',
            overview: merged.overview ? '✅ present' : '❌ null',
            performance: merged.performance ? '✅ present' : '❌ null',
            agentStates: `✅ ${merged.agentStates.length} agents`
          });
          console.log(`[StateReducer] ===== END MERGE =====\n`);
          return merged;
        }
        
        // Otherwise, do smart merge
        const prevAgentStates = prev?.agentStates ?? [];
        const nextAgentStates = nextState?.agentStates ?? [];
        const mergedAgentStates = [...prevAgentStates, ...nextAgentStates];
        
        const merged = { ...prev };
        
        // Only update fields that are explicitly set in nextState (not undefined)
        if (nextState) {
          if (nextState.earnings !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: earnings =`, nextState.earnings ? 'present' : 'null');
            merged.earnings = nextState.earnings;
          }
          if (nextState.filings !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: filings =`, nextState.filings ? `present (${Array.isArray(nextState.filings) ? nextState.filings.length : '?'})` : 'null');
            merged.filings = nextState.filings;
          }
          if (nextState.analystRatings !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: analystRatings =`, nextState.analystRatings ? `present (${Array.isArray(nextState.analystRatings) ? nextState.analystRatings.length : '?'})` : 'null');
            merged.analystRatings = nextState.analystRatings;
          }
          if (nextState.news !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: news =`, nextState.news ? `present (${Array.isArray(nextState.news) ? nextState.news.length : '?'})` : 'null');
            merged.news = nextState.news;
          }
          if (nextState.overview !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: overview =`, nextState.overview ? 'present' : 'null');
            merged.overview = nextState.overview;
          }
          if (nextState.performance !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: performance =`, nextState.performance ? 'present' : 'null');
            merged.performance = nextState.performance;
          }
          if (nextState.summary !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: summary =`, nextState.summary ? 'present' : 'null');
            merged.summary = nextState.summary;
          }
          if (nextState.generatedAt !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: generatedAt =`, nextState.generatedAt);
            merged.generatedAt = nextState.generatedAt;
          }
          if (nextState.symbol !== undefined) {
            console.log(`[StateReducer] 🔄 UPDATING STATE: symbol =`, nextState.symbol);
            merged.symbol = nextState.symbol;
          }
        }
        
        merged.agentStates = mergedAgentStates;
        
        console.log(`[StateReducer] Final merged state:`, {
          earnings: merged.earnings ? 'present' : 'null',
          filings: merged.filings ? `present (${Array.isArray(merged.filings) ? merged.filings.length : '?'})` : 'null',
          analystRatings: merged.analystRatings ? `present (${Array.isArray(merged.analystRatings) ? merged.analystRatings.length : '?'})` : 'null',
          news: merged.news ? `present (${Array.isArray(merged.news) ? merged.news.length : '?'})` : 'null',
          overview: merged.overview ? 'present' : 'null',
          performance: merged.performance ? 'present' : 'null',
          agentStates: merged.agentStates.length
        });
        console.log(`[StateReducer] ===== END MERGE =====\n`);
        
        return merged;
      },
      default: () => ({
        symbol: '',
        overview: null,
        performance: null,
        earnings: null,
        filings: null,
        analystRatings: null,
        news: null,
        summary: null,
        generatedAt: null,
        agentStates: []
      })
    }
  }
});

graph.addNode('input', inputNode);
graph.addNode('aggregate', aggregateNode);
graph.addNode('summarizer', summarizerNode);

graph.addEdge('__start__', 'input');
graph.addEdge('input', 'aggregate');
graph.addEdge('aggregate', 'summarizer');
graph.addEdge('summarizer', '__end__');

const stockGraphApp = graph.compile();

export async function runStockGraph(symbol, initialState = {}) {
  console.log(`[StockGraph] Starting graph execution for symbol: ${symbol}`);
  if (!symbol) {
    throw new Error('Symbol is required for stock graph execution');
  }
  
  const inputState = {
    state: {
      symbol: symbol.toUpperCase(),
      agentStates: [],
      ...initialState
    }
  };
  console.log(`[StockGraph] Input state:`, JSON.stringify(inputState, null, 2));
  
  const result = await stockGraphApp.invoke(inputState);
  console.log(`[StockGraph] Final result state keys:`, Object.keys(result.state || {}));
  console.log(`[StockGraph] Final symbol:`, result.state?.symbol);
  console.log(`[StockGraph] Final earnings:`, result.state?.earnings ? 'present' : 'null');
  console.log(`[StockGraph] Final news:`, result.state?.news ? `present (${Array.isArray(result.state.news) ? result.state.news.length : '?'} items)` : 'null');
  console.log(`[StockGraph] Final filings:`, result.state?.filings ? `present (${Array.isArray(result.state.filings) ? result.state.filings.length : '?'} items)` : 'null');
  console.log(`[StockGraph] Final analystRatings:`, result.state?.analystRatings ? `present (${Array.isArray(result.state.analystRatings) ? result.state.analystRatings.length : '?'} items)` : 'null');
  console.log(`[StockGraph] Final overview:`, result.state?.overview ? 'present' : 'null');
  console.log(`[StockGraph] Final performance:`, result.state?.performance ? 'present' : 'null');
  console.log(`[StockGraph] Agent states count:`, result.state?.agentStates?.length || 0);
  console.log(`[StockGraph] Full final state:`, JSON.stringify(result.state, null, 2));
  
  return result.state;
}

export default stockGraphApp;

