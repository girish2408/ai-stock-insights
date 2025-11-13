import logger from './logger.js';

export function normalizeError(err, metadata = {}) {
  if (!err) {
    return {
      message: 'Unknown error',
      ...metadata
    };
  }

  const normalized = {
    message: err.message ?? 'Unknown error',
    name: err.name ?? 'Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    ...metadata
  };

  return normalized;
}

export function logAgentError(agentName, err, metadata = {}) {
  logger.error(
    {
      agent: agentName,
      ...metadata,
      error: {
        message: err.message,
        stack: err.stack
      }
    },
    `${agentName} failed`
  );
}

