/**
 * Mock API layer. Every call resolves after a short delay so loading states are real.
 * Swap `request` with fetch/axios calls when a backend is available.
 */
export class ApiError extends Error {}

export const request = <T>(fn: () => T, ms = 450): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e instanceof Error ? new ApiError(e.message) : new ApiError('Something went wrong'));
      }
    }, ms);
  });
