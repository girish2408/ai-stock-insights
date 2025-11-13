export function buildAgentSuccess(agent, durationMs, extra = {}) {
  return {
    agent,
    status: 'success',
    durationMs,
    ...extra
  };
}

export function buildAgentError(agent, durationMs, error) {
  return {
    agent,
    status: 'error',
    durationMs,
    error: {
      message: error?.message ?? 'Unknown error'
    }
  };
}

export function appendAgentState(state, agentUpdate) {
  return [
    ...(state.agentStates ?? []),
    agentUpdate
  ];
}

