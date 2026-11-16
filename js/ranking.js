/**
 * AUDIENCELENS / RANKING ALGORITHM WRAPPERS (ranking.js)
 * -------------------------------------------------------------
 * Provides uniform wrapper interfaces calling the manual algorithms in
 * /algorithms.js and normalizing execution metrics to:
 *   { results, timeMs, comparisons, algorithm }
 * 
 * Functions:
 * 1. rankAll(movies, key, order, algorithm): Full catalogue sorting
 *    - Algorithms: 'mergesort' (stable, O(n log n)) | 'quicksort' (O(n log n))
 * 2. topK(movies, k, algorithm): Top-K subset ranking
 *    - Algorithms: 'heap' (Max-Heap, O(n + K log n)) | 'quickselect' (O(n + K log K))
 */

import {
  mergeSort,
  quickSort,
  heapTopK,
  quickSelectTopK,
  createMovieComparator
} from '../algorithms.js';

/**
 * Sorts an entire catalogue of movies by a given key and order.
 * 
 * Signature Mapping:
 * - algorithms.js `mergeSort` & `quickSort` return `{ sorted, executionTimeMs, comparisons }`.
 * - Wrapper returns `{ results, timeMs, comparisons, algorithm }`,
 *   mapping `sorted` -> `results`, and `executionTimeMs` -> `timeMs`.
 * 
 * @param {Array<Object>} movies Input movie collection
 * @param {string} [key='score'] Property key: 'score' | 'rating' | 'year' | 'votes' | 'runtime' | 'title'
 * @param {'asc'|'desc'} [order='desc'] Direction of sort
 * @param {'mergesort'|'quicksort'} [algorithm='mergesort'] Sorting algorithm to execute
 * @returns {{ results: Array<Object>, timeMs: number, comparisons: number, algorithm: string }}
 */
export function rankAll(movies, key = 'score', order = 'desc', algorithm = 'mergesort') {
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return {
      results: [],
      timeMs: 0,
      comparisons: 0,
      algorithm: algorithm || 'mergesort'
    };
  }

  const comparator = createMovieComparator(key);
  const algoLower = (algorithm || 'mergesort').toLowerCase();

  if (algoLower === 'mergesort' || algoLower === 'merge') {
    const raw = mergeSort(movies, comparator, order);
    return {
      results: raw.sorted,
      timeMs: raw.executionTimeMs,
      comparisons: raw.comparisons,
      algorithm: 'mergesort'
    };
  } else if (algoLower === 'quicksort' || algoLower === 'quick') {
    const raw = quickSort(movies, comparator, order);
    return {
      results: raw.sorted,
      timeMs: raw.executionTimeMs,
      comparisons: raw.comparisons,
      algorithm: 'quicksort'
    };
  } else {
    throw new Error(
      `[AudienceLens Ranking] Unsupported rankAll algorithm: "${algorithm}". Expected 'mergesort' or 'quicksort'.`
    );
  }
}

/**
 * Retrieves the Top-K highest-ranked movies by Bayesian weighted score.
 * 
 * Signature Mapping:
 * - algorithms.js `heapTopK` and `quickSelectTopK` return `{ topK, executionTimeMs, comparisons }`.
 * - Wrapper returns `{ results, timeMs, comparisons, algorithm }`,
 *   mapping `topK` -> `results`, and `executionTimeMs` -> `timeMs`.
 * 
 * @param {Array<Object>} movies Input movie collection
 * @param {number} [k=10] Number of top movies to retrieve
 * @param {'heap'|'quickselect'} [algorithm='heap'] Selection algorithm
 * @returns {{ results: Array<Object>, timeMs: number, comparisons: number, algorithm: string }}
 */
export function topK(movies, k = 10, algorithm = 'heap') {
  if (!movies || !Array.isArray(movies) || movies.length === 0 || k <= 0) {
    return {
      results: [],
      timeMs: 0,
      comparisons: 0,
      algorithm: algorithm || 'heap'
    };
  }

  const comparator = createMovieComparator('score');
  const algoLower = (algorithm || 'heap').toLowerCase();

  if (algoLower === 'heap' || algoLower === 'maxheap') {
    const raw = heapTopK(movies, k, comparator);
    return {
      results: raw.topK,
      timeMs: raw.executionTimeMs,
      comparisons: raw.comparisons,
      algorithm: 'heap'
    };
  } else if (algoLower === 'quickselect' || algoLower === 'select') {
    const raw = quickSelectTopK(movies, k, comparator, 'desc');
    return {
      results: raw.topK,
      timeMs: raw.executionTimeMs,
      comparisons: raw.comparisons,
      algorithm: 'quickselect'
    };
  } else {
    throw new Error(
      `[AudienceLens Ranking] Unsupported topK algorithm: "${algorithm}". Expected 'heap' or 'quickselect'.`
    );
  }
}
