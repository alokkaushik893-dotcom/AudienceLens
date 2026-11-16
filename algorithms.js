/**
 * AUDIENCELENS / ALGORITHMIC CORE (algorithms.js)
 * -------------------------------------------------------------
 * Hand-crafted sorting, selection, and priority queue algorithms
 * for the AudienceLens film repertory canon and archival ranking engine.
 * 
 * Strict architectural rule: NO native Array.prototype.sort is used.
 * Every algorithm is implemented manually with instrumentation for
 * execution timing (performance.now) and comparison counter tracking.
 * 
 * Complexity Overview:
 * - Weighted Rating (WR): O(1) per movie, O(n) dataset pass
 * - Merge Sort: O(n log n) Best/Avg/Worst time, O(n) space, STABLE
 * - Quick Sort: O(n log n) Avg time, O(n^2) Worst, O(log n) space
 * - Quickselect (Top-K): O(n) Avg time, O(n^2) Worst, O(log n) space
 * - Max-Heap: O(n) build, O(log n) insert/extract, O(1) peek
 */

/**
 * High-resolution metrics tracker for algorithmic profiling.
 */
export class MetricsTracker {
  constructor() {
    this.comparisons = 0;
    this.swaps = 0;
    this.startTime = 0;
    this.endTime = 0;
  }

  start() {
    this.comparisons = 0;
    this.swaps = 0;
    this.startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  stop() {
    this.endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = Math.max(0, +(this.endTime - this.startTime).toFixed(3));
    return {
      executionTimeMs: duration,
      comparisons: this.comparisons,
      swaps: this.swaps
    };
  }

  /**
   * Instrumented comparison wrapper.
   * Standard comparison contract:
   *   > 0 if a > b (a is higher/greater than b)
   *   < 0 if a < b (a is lower/smaller than b)
   *     0 if a == b
   */
  compare(a, b, comparator) {
    this.comparisons++;
    return comparator(a, b);
  }

  recordSwap() {
    this.swaps++;
  }
}

/* ==========================================================================
   1. BAYESIAN WEIGHTED RATING & COMPARATOR FACTORY
   ========================================================================== */

/**
 * Computes dataset-wide mean rating C.
 * Complexity: Time O(n), Space O(1)
 * 
 * @param {Array<Object>} movies 
 * @returns {number} Mean rating C across the catalogue
 */
export function calculateMeanRating(movies) {
  if (!movies || movies.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < movies.length; i++) {
    sum += Number(movies[i].rating) || 0;
  }
  return sum / movies.length;
}

/**
 * Computes the minimum vote threshold m from a dataset quantile.
 * Defaults to the 25th percentile of votes, or a fallback value.
 * Complexity: Time O(n), Space O(n)
 * 
 * @param {Array<Object>} movies 
 * @param {number} [percentile=0.25]
 * @param {number} [defaultThreshold=25000]
 * @returns {number} Minimum votes threshold m
 */
export function calculateVoteThreshold(movies, percentile = 0.25, defaultThreshold = 25000) {
  if (!movies || movies.length === 0) return defaultThreshold;
  const votes = movies.map(m => Number(m.votes) || 0);
  const sortedVotes = mergeSortSimple(votes, (a, b) => a - b);
  const idx = Math.floor(sortedVotes.length * percentile);
  return sortedVotes[idx] > 0 ? sortedVotes[idx] : defaultThreshold;
}

/**
 * Computes the Bayesian Weighted Rating (WR) for a single movie:
 * 
 *   WR = (v / (v + m)) * R + (m / (v + m)) * C
 * 
 * where:
 *   R = movie rating
 *   v = number of votes for the movie
 *   m = minimum votes threshold required to be listed in the canon
 *   C = mean rating across all movies in the repertory catalogue
 * 
 * Complexity: Time O(1), Space O(1)
 * 
 * @param {Object} movie 
 * @param {number} m Minimum votes threshold
 * @param {number} C Mean rating across catalogue
 * @returns {number} Weighted rating score rounded to 3 decimal places
 */
export function computeWeightedRating(movie, m, C) {
  const R = Number(movie.rating) || 0;
  const v = Number(movie.votes) || 0;
  if (v + m === 0) return R;
  const score = (v / (v + m)) * R + (m / (v + m)) * C;
  return Math.round(score * 1000) / 1000;
}

/**
 * Enriches each movie object in the catalogue with its computed weighted score.
 * Complexity: Time O(n), Space O(n)
 * 
 * @param {Array<Object>} movies 
 * @param {number} [explicitM] Optional explicit minimum vote threshold
 * @returns {{ movies: Array<Object>, C: number, m: number }}
 */
export function enrichMoviesWithScore(movies, explicitM) {
  if (!movies || movies.length === 0) {
    return { movies: [], C: 0, m: 0 };
  }
  const C = calculateMeanRating(movies);
  const m = explicitM !== undefined ? explicitM : calculateVoteThreshold(movies, 0.2, 20000);

  const enriched = movies.map(movie => {
    const score = computeWeightedRating(movie, m, C);
    return {
      ...movie,
      score: score,
      meanCatalogRating: Math.round(C * 100) / 100,
      minVoteThreshold: m
    };
  });

  return {
    movies: enriched,
    C: Math.round(C * 100) / 100,
    m
  };
}

/**
 * Natural comparator factory for movies.
 * Follows the standard mathematical ordering convention:
 *   returns > 0 if a > b (a is greater / higher / better)
 *   returns < 0 if a < b (a is smaller / lower / worse)
 *   returns 0 if a == b
 * 
 * Enforces strict tie-breaking rules:
 * - When scores/ratings match: more votes first (votesA > votesB).
 * - When votes also match: title alphabetically A-Z (titleA < titleB => +1).
 * 
 * @param {string} field 'score' | 'rating' | 'year' | 'votes' | 'runtime' | 'title'
 * @returns {Function} (a, b) => number (> 0 if a > b, < 0 if a < b, 0 if equal)
 */
export function createMovieComparator(field = 'score') {
  return function (a, b) {
    if (field === 'title') {
      const titleA = (a.title || '').toString();
      const titleB = (b.title || '').toString();
      // Alphabetical order: 'A' comes before 'Z'.
      // For title, we consider earlier alphabetical letter as "greater" (comes first)
      const diff = titleA.localeCompare(titleB);
      if (diff < 0) return 1;  // titleA comes before titleB
      if (diff > 0) return -1; // titleA comes after titleB
      return 0;
    }

    const valA = Number(a[field] !== undefined ? a[field] : 0);
    const valB = Number(b[field] !== undefined ? b[field] : 0);

    const epsilon = 1e-6;
    if (Math.abs(valA - valB) > epsilon) {
      return valA > valB ? 1 : -1;
    }

    // Tie-breaker 1: More votes wins (higher votes = higher rank)
    const votesA = Number(a.votes || 0);
    const votesB = Number(b.votes || 0);
    if (votesA !== votesB) {
      return votesA > votesB ? 1 : -1;
    }

    // Tie-breaker 2: Title A-Z wins (earlier in alphabet = higher rank)
    const titleA = (a.title || '').toString();
    const titleB = (b.title || '').toString();
    const titleDiff = titleA.localeCompare(titleB);
    if (titleDiff < 0) return 1;  // 'Persona' > 'Stalker'
    if (titleDiff > 0) return -1;

    return 0;
  };
}

/* ==========================================================================
   2. MERGE SORT (MANUAL, STABLE, INSTRUMENTED)
   ========================================================================== */

/**
 * Simple internal merge sort for primitive arrays.
 * Stable, O(n log n).
 */
function mergeSortSimple(arr, compareFn) {
  if (arr.length <= 1) return [...arr];
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortSimple(arr.slice(0, mid), compareFn);
  const right = mergeSortSimple(arr.slice(mid), compareFn);

  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

/**
 * Merge Sort implementation.
 * Must be STABLE: equal elements preserve their relative initial order.
 * 
 * Complexity:
 * - Time: O(n log n) in all cases (Best, Average, Worst)
 * - Space: O(n) auxiliary memory for buffer allocations
 * 
 * @param {Array} array Input array to sort
 * @param {Function} comparator (a, b) => number (> 0 if a > b)
 * @param {'asc'|'desc'} [order='desc']
 * @param {MetricsTracker} [tracker] Optional metrics collector
 * @returns {{ sorted: Array, executionTimeMs: number, comparisons: number }}
 */
export function mergeSort(array, comparator = createMovieComparator('score'), order = 'desc', tracker = null) {
  const localTracker = tracker || new MetricsTracker();
  localTracker.start();

  if (!array || array.length <= 1) {
    const metrics = localTracker.stop();
    return {
      sorted: array ? [...array] : [],
      executionTimeMs: metrics.executionTimeMs,
      comparisons: metrics.comparisons
    };
  }

  function sort(items) {
    const len = items.length;
    if (len <= 1) return items;

    const mid = Math.floor(len / 2);
    const left = sort(items.slice(0, mid));
    const right = sort(items.slice(mid));

    return merge(left, right);
  }

  function merge(left, right) {
    const result = new Array(left.length + right.length);
    let i = 0;
    let j = 0;
    let k = 0;

    while (i < left.length && j < right.length) {
      const cmp = localTracker.compare(left[i], right[j], comparator);

      let chooseLeft = false;
      if (order === 'desc') {
        // For descending order, greater or equal comes first.
        // If cmp >= 0, left is greater or equal to right. STABILITY: choose left on equality.
        chooseLeft = cmp >= 0;
      } else {
        // For ascending order, smaller or equal comes first.
        // If cmp <= 0, left is smaller or equal to right. STABILITY: choose left on equality.
        chooseLeft = cmp <= 0;
      }

      if (chooseLeft) {
        result[k++] = left[i++];
      } else {
        result[k++] = right[j++];
      }
    }

    while (i < left.length) {
      result[k++] = left[i++];
    }
    while (j < right.length) {
      result[k++] = right[j++];
    }

    return result;
  }

  const sorted = sort(array);
  const metrics = localTracker.stop();

  return {
    sorted,
    executionTimeMs: metrics.executionTimeMs,
    comparisons: metrics.comparisons
  };
}

/**
 * Trace generator for step-by-step Merge Sort animation on the Home page.
 * Captures recursion splits and merges into visual snapshots.
 * 
 * @param {Array} array 
 * @param {Function} comparator 
 * @param {'asc'|'desc'} [order='desc']
 * @returns {Array<Object>} List of animated steps { type: 'split'|'merge', left, right, merged }
 */
export function generateMergeSortTrace(array, comparator = createMovieComparator('score'), order = 'desc') {
  const steps = [];

  function trace(items, depth = 0, path = 'root') {
    if (items.length <= 1) return items;

    const mid = Math.floor(items.length / 2);
    const leftSlice = items.slice(0, mid);
    const rightSlice = items.slice(mid);

    steps.push({
      type: 'split',
      depth,
      path,
      left: leftSlice.map(m => ({ id: m.id, title: m.title, score: m.score })),
      right: rightSlice.map(m => ({ id: m.id, title: m.title, score: m.score }))
    });

    const left = trace(leftSlice, depth + 1, `${path}.L`);
    const right = trace(rightSlice, depth + 1, `${path}.R`);

    const merged = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      const cmp = comparator(left[i], right[j]);
      const chooseLeft = order === 'desc' ? cmp >= 0 : cmp <= 0;
      if (chooseLeft) {
        merged.push(left[i++]);
      } else {
        merged.push(right[j++]);
      }
    }
    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);

    steps.push({
      type: 'merge',
      depth,
      path,
      merged: merged.map(m => ({ id: m.id, title: m.title, score: m.score }))
    });

    return merged;
  }

  trace(array);
  return steps;
}

/* ==========================================================================
   3. MAX-HEAP / PRIORITY QUEUE (MANUAL, INSTRUMENTED)
   ========================================================================== */

/**
 * Max-Heap Priority Queue.
 * Root holds the highest-priority element according to comparator.
 * 
 * Complexity:
 * - Build Heap: O(n)
 * - Insert: O(log n)
 * - Extract Max: O(log n)
 * - Peek: O(1)
 * - Space: O(n)
 */
export class MaxHeap {
  /**
   * @param {Function} [comparator] (a, b) => number. Returns > 0 if a has higher priority than b.
   * @param {MetricsTracker} [tracker]
   */
  constructor(comparator = createMovieComparator('score'), tracker = null) {
    this.heap = [];
    this.comparator = comparator;
    this.tracker = tracker || new MetricsTracker();
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  _parent(index) {
    return Math.floor((index - 1) / 2);
  }

  _leftChild(index) {
    return 2 * index + 1;
  }

  _rightChild(index) {
    return 2 * index + 2;
  }

  _compare(a, b) {
    return this.tracker.compare(a, b, this.comparator);
  }

  _swap(i, j) {
    this.tracker.recordSwap();
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  _siftUp(index) {
    let current = index;
    while (current > 0) {
      const parent = this._parent(current);
      // If current element is strictly greater than parent, bubble it up
      if (this._compare(this.heap[current], this.heap[parent]) > 0) {
        this._swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  _siftDown(index) {
    let current = index;
    const len = this.heap.length;

    while (true) {
      let largest = current;
      const left = this._leftChild(current);
      const right = this._rightChild(current);

      if (left < len && this._compare(this.heap[left], this.heap[largest]) > 0) {
        largest = left;
      }
      if (right < len && this._compare(this.heap[right], this.heap[largest]) > 0) {
        largest = right;
      }

      if (largest !== current) {
        this._swap(current, largest);
        current = largest;
      } else {
        break;
      }
    }
  }

  insert(item) {
    this.heap.push(item);
    this._siftUp(this.heap.length - 1);
  }

  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._siftDown(0);
    return max;
  }

  buildHeap(items) {
    this.heap = items ? [...items] : [];
    if (this.heap.length <= 1) return;

    const startIdx = Math.floor(this.heap.length / 2) - 1;
    for (let i = startIdx; i >= 0; i--) {
      this._siftDown(i);
    }
  }

  update(predicate, updatedFields) {
    const idx = this.heap.findIndex(predicate);
    if (idx === -1) return false;

    const previous = { ...this.heap[idx] };
    Object.assign(this.heap[idx], updatedFields);

    const cmp = this._compare(this.heap[idx], previous);
    if (cmp > 0) {
      this._siftUp(idx);
    } else if (cmp < 0) {
      this._siftDown(idx);
    }
    return true;
  }

  getTopK(k) {
    const count = Math.min(k, this.heap.length);
    if (count <= 0) return [];

    const cloned = new MaxHeap(this.comparator, this.tracker);
    cloned.heap = [...this.heap];

    const result = [];
    for (let i = 0; i < count; i++) {
      const top = cloned.extractMax();
      if (top) result.push(top);
    }
    return result;
  }

  getTreeStructure(maxDepth = 4) {
    const nodes = [];
    const edges = [];
    const maxNodes = Math.min(this.heap.length, Math.pow(2, maxDepth) - 1);

    for (let i = 0; i < maxNodes; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const positionInLevel = i - (Math.pow(2, level) - 1);
      const totalInLevel = Math.pow(2, level);

      const item = this.heap[i];
      nodes.push({
        index: i,
        level,
        positionInLevel,
        totalInLevel,
        item: {
          id: item.id || `node-${i}`,
          title: item.title || 'Untitled',
          score: item.score !== undefined ? item.score : item.rating,
          rating: item.rating,
          votes: item.votes
        }
      });

      if (i > 0) {
        const parentIdx = this._parent(i);
        edges.push({
          from: parentIdx,
          to: i
        });
      }
    }

    return {
      nodes,
      edges,
      totalCount: this.heap.length
    };
  }

  toArray() {
    return [...this.heap];
  }
}

/**
 * Top-K retrieval using Max-Heap with execution profiling.
 * 
 * @param {Array} array 
 * @param {number} k 
 * @param {Function} comparator 
 * @returns {{ topK: Array, executionTimeMs: number, comparisons: number }}
 */
export function heapTopK(array, k, comparator = createMovieComparator('score')) {
  const tracker = new MetricsTracker();
  tracker.start();

  const heap = new MaxHeap(comparator, tracker);
  heap.buildHeap(array);
  const topK = heap.getTopK(k);

  const metrics = tracker.stop();
  return {
    topK,
    executionTimeMs: metrics.executionTimeMs,
    comparisons: metrics.comparisons
  };
}

/* ==========================================================================
   4. QUICK SORT & QUICKSELECT (MANUAL, INSTRUMENTED)
   ========================================================================== */

/**
 * Quick Sort implementation.
 * In-place recursive sorting with midpoint pivot selection to prevent
 * worst-case O(n^2) degradation on sorted or reverse-sorted lists.
 * 
 * Complexity:
 * - Time: O(n log n) Average, O(n^2) Worst
 * - Auxiliary Stack: O(log n)
 * 
 * @param {Array} array Input array
 * @param {Function} comparator (a, b) => number (> 0 if a > b)
 * @param {'asc'|'desc'} [order='desc']
 * @param {MetricsTracker} [tracker]
 * @returns {{ sorted: Array, executionTimeMs: number, comparisons: number }}
 */
export function quickSort(array, comparator = createMovieComparator('score'), order = 'desc', tracker = null) {
  const localTracker = tracker || new MetricsTracker();
  localTracker.start();

  if (!array || array.length <= 1) {
    const metrics = localTracker.stop();
    return {
      sorted: array ? [...array] : [],
      executionTimeMs: metrics.executionTimeMs,
      comparisons: metrics.comparisons
    };
  }

  const items = [...array];

  function swap(i, j) {
    localTracker.recordSwap();
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  function partition(low, high) {
    const mid = Math.floor((low + high) / 2);
    swap(mid, high);
    const pivot = items[high];

    let i = low - 1;
    for (let j = low; j < high; j++) {
      const cmp = localTracker.compare(items[j], pivot, comparator);
      const shouldGoLeft = order === 'desc' ? cmp >= 0 : cmp <= 0;
      if (shouldGoLeft) {
        i++;
        swap(i, j);
      }
    }
    swap(i + 1, high);
    return i + 1;
  }

  function sort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  sort(0, items.length - 1);
  const metrics = localTracker.stop();

  return {
    sorted: items,
    executionTimeMs: metrics.executionTimeMs,
    comparisons: metrics.comparisons
  };
}

/**
 * Quickselect algorithm.
 * Selects the top K elements in O(n) average time without full array sorting.
 * After partitioning the top K elements, we quicksort just the top K slice
 * in O(K log K) time, giving a total time complexity of O(n + K log K).
 * 
 * Complexity:
 * - Time: O(n) average selection + O(K log K) sort = O(n + K log K)
 * - Space: O(1) auxiliary in-place
 * 
 * @param {Array} array 
 * @param {number} k Number of top items to retrieve
 * @param {Function} comparator 
 * @param {'asc'|'desc'} [order='desc']
 * @returns {{ topK: Array, executionTimeMs: number, comparisons: number }}
 */
export function quickSelectTopK(array, k, comparator = createMovieComparator('score'), order = 'desc') {
  const tracker = new MetricsTracker();
  tracker.start();

  if (!array || array.length === 0 || k <= 0) {
    const metrics = tracker.stop();
    return { topK: [], executionTimeMs: metrics.executionTimeMs, comparisons: metrics.comparisons };
  }

  const items = [...array];
  const targetK = Math.min(k, items.length);

  function swap(i, j) {
    tracker.recordSwap();
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  function partition(low, high) {
    const mid = Math.floor((low + high) / 2);
    swap(mid, high);
    const pivot = items[high];

    let i = low - 1;
    for (let j = low; j < high; j++) {
      const cmp = tracker.compare(items[j], pivot, comparator);
      const shouldGoLeft = order === 'desc' ? cmp >= 0 : cmp <= 0;
      if (shouldGoLeft) {
        i++;
        swap(i, j);
      }
    }
    swap(i + 1, high);
    return i + 1;
  }

  function select(low, high, kIndex) {
    if (low >= high) return;

    const pi = partition(low, high);
    if (pi === kIndex) {
      return;
    } else if (pi > kIndex) {
      select(low, pi - 1, kIndex);
    } else {
      select(pi + 1, high, kIndex);
    }
  }

  // Quickselect partition so that the first targetK elements are the top elements
  select(0, items.length - 1, targetK - 1);

  // Now sort only the top K slice
  const topSlice = items.slice(0, targetK);
  const sortedTop = quickSort(topSlice, comparator, order, tracker).sorted;

  const metrics = tracker.stop();
  return {
    topK: sortedTop,
    executionTimeMs: metrics.executionTimeMs,
    comparisons: tracker.comparisons
  };
}

/* ==========================================================================
   5. WISHLIST PRIORITY QUEUE (HEAP-POWERED)
   ========================================================================== */

/**
 * Priority Queue specialized for the paper wishlist.
 * Ensures the highest-priority unwatched film is always accessible in O(1) peek time.
 * 
 * Priority scoring:
 * - Unwatched items strictly outrank watched items.
 * - Higher priority tier (5 = Urgent, 1 = Casual) ranks higher.
 * - Earlier addedAt timestamp breaks ties (FIFO).
 */
export class WishlistPriorityQueue {
  constructor(initialItems = []) {
    this.heap = new MaxHeap(this._wishlistComparator);
    if (initialItems && initialItems.length > 0) {
      this.heap.buildHeap(initialItems);
    }
  }

  _wishlistComparator(a, b) {
    // 1. Unwatched before watched
    const watchedA = a.watched ? 1 : 0;
    const watchedB = b.watched ? 1 : 0;
    if (watchedA !== watchedB) {
      // 0 (unwatched) > 1 (watched) => return 1 if a is unwatched
      return watchedA < watchedB ? 1 : -1;
    }

    // 2. Priority level (5 to 1)
    const prioA = Number(a.priority || 3);
    const prioB = Number(b.priority || 3);
    if (prioA !== prioB) {
      return prioA > prioB ? 1 : -1;
    }

    // 3. FIFO timestamp: earlier addedAt comes first
    const timeA = Number(a.addedAt || 0);
    const timeB = Number(b.addedAt || 0);
    if (timeA !== timeB) {
      return timeA < timeB ? 1 : -1;
    }

    return 0;
  }

  add(movie, priority = 3, notes = '') {
    const item = {
      id: `wish-${movie.id || Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      movieId: movie.id,
      title: movie.title,
      year: movie.year,
      poster: movie.poster,
      director: movie.director,
      runtime: movie.runtime,
      rating: movie.rating,
      priority: Math.max(1, Math.min(5, Number(priority) || 3)),
      notes: notes || '',
      watched: false,
      addedAt: Date.now()
    };
    this.heap.insert(item);
    return item;
  }

  peekNext() {
    return this.heap.peek();
  }

  extractNext() {
    return this.heap.extractMax();
  }

  toggleWatched(id) {
    const current = this.heap.heap.find(item => item.id === id);
    if (!current) return false;
    return this.heap.update(
      item => item.id === id,
      { watched: !current.watched }
    );
  }

  updatePriority(id, newPriority) {
    return this.heap.update(
      item => item.id === id,
      { priority: Math.max(1, Math.min(5, Number(newPriority))) }
    );
  }

  remove(id) {
    const idx = this.heap.heap.findIndex(item => item.id === id);
    if (idx === -1) return false;
    this.heap.heap.splice(idx, 1);
    this.heap.buildHeap(this.heap.heap);
    return true;
  }

  getAllSorted() {
    return this.heap.getTopK(this.heap.size());
  }

  size() {
    return this.heap.size();
  }
}

/* ==========================================================================
   6. ALGORITHM BENCHMARK SUITE (MULTI-SCALE BENCHMARKING)
   ========================================================================== */

/**
 * Runs comparative benchmarks across Merge Sort, Quick Sort, Max-Heap,
 * and Quickselect for dataset sizes (e.g. 100, 1000, 10000).
 * 
 * Generates synthetic movie datasets and computes averages across iterations.
 * 
 * @param {Object} [options]
 * @param {Array<number>} [options.sizes=[100, 1000, 10000]]
 * @param {number} [options.topK=10]
 * @param {number} [options.iterations=2]
 * @returns {Array<Object>} Benchmark results per size and algorithm
 */
export function runAlgorithmBenchmark({ sizes = [100, 1000, 5000], topK = 10, iterations = 2 } = {}) {
  const results = [];

  for (const n of sizes) {
    const syntheticData = [];
    for (let i = 0; i < n; i++) {
      syntheticData.push({
        id: `mock-${i}`,
        title: `Archive Title #${i}`,
        year: 1930 + (i % 95),
        rating: +(5.0 + Math.random() * 4.5).toFixed(1),
        votes: Math.floor(1000 + Math.random() * 800000),
        score: +(5.0 + Math.random() * 4.5).toFixed(3)
      });
    }

    const comparator = createMovieComparator('score');

    // 1. Merge Sort (Full Sort)
    let mergeTime = 0;
    let mergeComps = 0;
    for (let it = 0; it < iterations; it++) {
      const res = mergeSort(syntheticData, comparator, 'desc');
      mergeTime += res.executionTimeMs;
      mergeComps += res.comparisons;
    }
    mergeTime = +(mergeTime / iterations).toFixed(2);
    mergeComps = Math.round(mergeComps / iterations);

    // 2. Quick Sort (Full Sort)
    let quickTime = 0;
    let quickComps = 0;
    for (let it = 0; it < iterations; it++) {
      const res = quickSort(syntheticData, comparator, 'desc');
      quickTime += res.executionTimeMs;
      quickComps += res.comparisons;
    }
    quickTime = +(quickTime / iterations).toFixed(2);
    quickComps = Math.round(quickComps / iterations);

    // 3. Max-Heap (Top-K Extraction)
    let heapTime = 0;
    let heapComps = 0;
    for (let it = 0; it < iterations; it++) {
      const res = heapTopK(syntheticData, topK, comparator);
      heapTime += res.executionTimeMs;
      heapComps += res.comparisons;
    }
    heapTime = +(heapTime / iterations).toFixed(2);
    heapComps = Math.round(heapComps / iterations);

    // 4. Quickselect (Top-K Extraction)
    let selectTime = 0;
    let selectComps = 0;
    for (let it = 0; it < iterations; it++) {
      const res = quickSelectTopK(syntheticData, topK, comparator, 'desc');
      selectTime += res.executionTimeMs;
      selectComps += res.comparisons;
    }
    selectTime = +(selectTime / iterations).toFixed(2);
    selectComps = Math.round(selectComps / iterations);

    results.push({
      size: n,
      topK,
      mergeSort: { timeMs: mergeTime, comparisons: mergeComps, complexity: 'O(n log n)' },
      quickSort: { timeMs: quickTime, comparisons: quickComps, complexity: 'O(n log n)' },
      maxHeap: { timeMs: heapTime, comparisons: heapComps, complexity: 'O(n + K log n)' },
      quickSelect: { timeMs: selectTime, comparisons: selectComps, complexity: 'O(n + K log K)' }
    });
  }

  return results;
}
