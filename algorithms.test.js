/**
 * AUDIENCELENS / ALGORITHM VERIFICATION TEST SUITE (algorithms.test.js)
 * -----------------------------------------------------------------
 * Rigorous automated tests validating correctness, stability,
 * heap invariants, edge cases, tie-breaking, and execution profiling.
 */

import {
  calculateMeanRating,
  calculateVoteThreshold,
  computeWeightedRating,
  enrichMoviesWithScore,
  createMovieComparator,
  mergeSort,
  generateMergeSortTrace,
  MaxHeap,
  heapTopK,
  quickSort,
  quickSelectTopK,
  WishlistPriorityQueue,
  runAlgorithmBenchmark,
  MetricsTracker
} from './algorithms.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message} (Expected: ${expected}, Got: ${actual})`);
  }
}

console.log('====================================================');
console.log('AUDIENCELENS: ALGORITHMIC SUITE VERIFICATION');
console.log('====================================================\n');

/* ------------------------------------------------------------------
   TEST SUITE 1: BAYESIAN WEIGHTED RATING & TIE BREAKING
   ------------------------------------------------------------------ */
console.log('[1] Testing Bayesian Weighted Rating & Tie Breaking');

const sampleMovies = [
  { id: 'm1', title: 'Seven Samurai', rating: 8.6, votes: 360000, year: 1954 },
  { id: 'm2', title: 'Tokyo Story', rating: 8.1, votes: 65000, year: 1953 },
  { id: 'm3', title: 'Persona', rating: 8.1, votes: 120000, year: 1966 },
  { id: 'm4', title: 'Stalker', rating: 8.1, votes: 120000, year: 1979 },
  { id: 'm5', title: '8½', rating: 8.0, votes: 130000, year: 1963 },
];

const meanC = calculateMeanRating(sampleMovies);
assertEqual(+meanC.toFixed(2), 8.18, 'calculateMeanRating calculates correct dataset mean C (8.18)');

const mThreshold = 25000;
const wrSamurai = computeWeightedRating(sampleMovies[0], mThreshold, meanC);
assert(Math.abs(wrSamurai - 8.573) < 0.01, `computeWeightedRating for Seven Samurai is ~8.573 (got ${wrSamurai})`);

const { movies: enriched } = enrichMoviesWithScore(sampleMovies, mThreshold);
assertEqual(enriched.length, 5, 'enrichMoviesWithScore returns all movies enriched with score');

// Tie breaking test
// Persona (8.1, 120000 votes, "Persona") vs Stalker (8.1, 120000 votes, "Stalker")
// Both have identical rating and votes => Persona must rank higher than Stalker (comp > 0)
const comp = createMovieComparator('score');
const persona = enriched.find(m => m.title === 'Persona');
const stalker = enriched.find(m => m.title === 'Stalker');
assert(comp(persona, stalker) > 0, 'Tie breaking: When score and votes are equal, Persona precedes Stalker alphabetically');

// Test when R > C: higher votes maintains higher weighted score
const highRatingA = { id: 'hr1', title: 'Film A', rating: 8.9, votes: 500000, year: 1960 };
const highRatingB = { id: 'hr2', title: 'Film B', rating: 8.9, votes: 50000, year: 1960 };
const wrHighA = computeWeightedRating(highRatingA, 25000, 7.2);
const wrHighB = computeWeightedRating(highRatingB, 25000, 7.2);
assert(wrHighA > wrHighB, `When R > C, higher votes produces higher weighted rating (${wrHighA} vs ${wrHighB})`);

// Secondary tie-breaker when scores match: more votes first
const tieMovieA = { id: 't1', title: 'Tied Alpha', score: 8.25, votes: 250000 };
const tieMovieB = { id: 't2', title: 'Tied Beta', score: 8.25, votes: 50000 };
assert(comp(tieMovieA, tieMovieB) > 0, 'Secondary tie breaker: When scores match, higher votes outranks lower votes');

/* ------------------------------------------------------------------
   TEST SUITE 2: MERGE SORT STABILITY & COMPARISON TRACKING
   ------------------------------------------------------------------ */
console.log('\n[2] Testing Merge Sort (STABILITY, Ascending & Descending)');

const stabilityInput = [
  { id: 1, key: 5, originalIndex: 0 },
  { id: 2, key: 3, originalIndex: 1 },
  { id: 3, key: 5, originalIndex: 2 },
  { id: 4, key: 3, originalIndex: 3 },
  { id: 5, key: 5, originalIndex: 4 },
  { id: 6, key: 1, originalIndex: 5 },
];

const stabilityComparator = (a, b) => a.key - b.key;
const stableAsc = mergeSort(stabilityInput, stabilityComparator, 'asc');

assertEqual(stableAsc.sorted.map(x => x.id).join(','), '6,2,4,1,3,5', 'Merge sort is strictly STABLE in ascending order');
assert(stableAsc.comparisons > 0, `Merge sort records comparisons (${stableAsc.comparisons} comparisons)`);
assert(stableAsc.executionTimeMs >= 0, `Merge sort records execution time (${stableAsc.executionTimeMs} ms)`);

const stableDesc = mergeSort(stabilityInput, stabilityComparator, 'desc');
assertEqual(stableDesc.sorted.map(x => x.id).join(','), '1,3,5,2,4,6', 'Merge sort is strictly STABLE in descending order');

// Test merge sort trace generation
const traceSteps = generateMergeSortTrace(sampleMovies);
assert(traceSteps.length > 0, `generateMergeSortTrace produces ${traceSteps.length} animation step frames`);
assert(traceSteps.some(s => s.type === 'split'), 'Merge trace contains split steps');
assert(traceSteps.some(s => s.type === 'merge'), 'Merge trace contains merge steps');

/* ------------------------------------------------------------------
   TEST SUITE 3: MAX-HEAP / PRIORITY QUEUE INVARIANTS
   ------------------------------------------------------------------ */
console.log('\n[3] Testing Max-Heap / Priority Queue Invariants');

const heap = new MaxHeap(createMovieComparator('score'));
heap.buildHeap(enriched);

assertEqual(heap.size(), 5, 'Heap contains 5 movies after buildHeap');

function verifyHeapInvariant(h) {
  for (let i = 0; i < h.heap.length; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < h.heap.length) {
      if (h.comparator(h.heap[i], h.heap[left]) < 0) return false;
    }
    if (right < h.heap.length) {
      if (h.comparator(h.heap[i], h.heap[right]) < 0) return false;
    }
  }
  return true;
}

assert(verifyHeapInvariant(heap), 'Max-Heap invariant holds across all nodes (parent >= children)');

// Peek
const topMovie = heap.peek();
assertEqual(topMovie.title, 'Seven Samurai', 'heap.peek() returns highest ranked movie (Seven Samurai)');

// Insert new movie with higher rating
const newRecord = {
  id: 'm-new',
  title: 'Citizen Kane',
  rating: 8.9,
  votes: 450000,
  score: 8.85
};
heap.insert(newRecord);
assertEqual(heap.size(), 6, 'heap.insert increments size to 6');
assertEqual(heap.peek().title, 'Citizen Kane', 'heap.peek() reflects newly inserted highest rating');
assert(verifyHeapInvariant(heap), 'Max-Heap invariant holds after insertion');

// Update rating
const updated = heap.update(m => m.title === 'Citizen Kane', { score: 7.5 });
assert(updated, 'heap.update returns true for existing item');
assert(verifyHeapInvariant(heap), 'Max-Heap invariant holds after score downgrade and siftDown');
assertEqual(heap.peek().title, 'Seven Samurai', 'After downgrade of Citizen Kane, Seven Samurai returns to root');

// ExtractMax in order
const extracted = [];
while (!heap.isEmpty()) {
  extracted.push(heap.extractMax());
}
assertEqual(extracted.length, 6, 'All 6 items extracted via extractMax');
let isStrictlyDescending = true;
for (let i = 0; i < extracted.length - 1; i++) {
  if (comp(extracted[i], extracted[i + 1]) < 0) {
    isStrictlyDescending = false;
    break;
  }
}
assert(isStrictlyDescending, 'extractMax returns elements in strictly non-increasing order');

// Test heapTopK helper
const top3Heap = heapTopK(enriched, 3);
assertEqual(top3Heap.topK.length, 3, 'heapTopK extracts exactly top 3 elements');
assertEqual(top3Heap.topK[0].title, 'Seven Samurai', 'heapTopK #1 is Seven Samurai');

// Test tree structure generation for SVG visualizer
const heapForTree = new MaxHeap();
heapForTree.buildHeap(enriched);
const treeStructure = heapForTree.getTreeStructure(3);
assert(treeStructure.nodes.length === 5, `getTreeStructure returns 5 visual nodes (got ${treeStructure.nodes.length})`);
assert(treeStructure.edges.length === 4, `getTreeStructure returns 4 connecting edges (got ${treeStructure.edges.length})`);

/* ------------------------------------------------------------------
   TEST SUITE 4: QUICK SORT & QUICKSELECT (TOP-K)
   ------------------------------------------------------------------ */
console.log('\n[4] Testing Quick Sort & Quickselect');

const numbers = [
  { id: 'a', score: 3.2, votes: 10, title: 'A' },
  { id: 'b', score: 9.1, votes: 50, title: 'B' },
  { id: 'c', score: 1.4, votes: 20, title: 'C' },
  { id: 'd', score: 7.8, votes: 30, title: 'D' },
  { id: 'e', score: 5.5, votes: 40, title: 'E' },
  { id: 'f', score: 8.9, votes: 60, title: 'F' },
  { id: 'g', score: 6.0, votes: 25, title: 'G' }
];

const qsResult = quickSort(numbers, createMovieComparator('score'), 'desc');
assertEqual(qsResult.sorted[0].title, 'B', 'Quick Sort #1 element is B (score 9.1)');
assertEqual(qsResult.sorted[qsResult.sorted.length - 1].title, 'C', 'Quick Sort last element is C (score 1.4)');

// Quickselect Top-3
const qselResult = quickSelectTopK(numbers, 3, createMovieComparator('score'), 'desc');
assertEqual(qselResult.topK.length, 3, 'Quickselect retrieves exactly 3 elements');
assertEqual(qselResult.topK[0].title, 'B', 'Quickselect #1 is B (9.1)');
assertEqual(qselResult.topK[1].title, 'F', 'Quickselect #2 is F (8.9)');
assertEqual(qselResult.topK[2].title, 'D', 'Quickselect #3 is D (7.8)');

// Verify Quickselect top-3 matches Merge Sort top-3
const msTop3 = mergeSort(numbers, createMovieComparator('score'), 'desc').sorted.slice(0, 3);
assertEqual(
  qselResult.topK.map(x => x.id).join(','),
  msTop3.map(x => x.id).join(','),
  'Quickselect top-3 matches Merge Sort top-3 identically'
);

/* ------------------------------------------------------------------
   TEST SUITE 5: WISHLIST PRIORITY QUEUE
   ------------------------------------------------------------------ */
console.log('\n[5] Testing Wishlist Priority Queue');

const wishlist = new WishlistPriorityQueue();
wishlist.add({ id: 101, title: 'La Jetée', year: 1962 }, 2, 'Watch on weekend');
wishlist.add({ id: 102, title: 'Solaris', year: 1972 }, 5, 'Priority archive watch');
wishlist.add({ id: 103, title: 'M', year: 1931 }, 4, 'Fritz Lang masterpiece');

assertEqual(wishlist.size(), 3, 'Wishlist contains 3 items');
assertEqual(wishlist.peekNext().title, 'Solaris', 'Wishlist peekNext returns highest priority (Priority 5: Solaris)');

// Mark Solaris as watched
const solarisItem = wishlist.peekNext();
wishlist.toggleWatched(solarisItem.id);

// Now Solaris should sink to bottom; next highest unwatched should be 'M' (priority 4)
assertEqual(wishlist.peekNext().title, 'M', 'Marking top item as watched sinks it; unwatched Priority 4 (M) becomes next');

/* ------------------------------------------------------------------
   TEST SUITE 6: BENCHMARK SUITE EXECUTION
   ------------------------------------------------------------------ */
console.log('\n[6] Testing Algorithm Benchmark Suite');

const benchResults = runAlgorithmBenchmark({ sizes: [50, 200], topK: 5, iterations: 1 });
assertEqual(benchResults.length, 2, 'Benchmark executes across specified sizes [50, 200]');
assert(benchResults[0].mergeSort.comparisons > 0, 'Merge sort comparisons tracked in benchmark');
assert(benchResults[0].quickSort.comparisons > 0, 'Quick sort comparisons tracked in benchmark');
assert(benchResults[0].maxHeap.comparisons > 0, 'Max-Heap comparisons tracked in benchmark');
assert(benchResults[0].quickSelect.comparisons > 0, 'Quickselect comparisons tracked in benchmark');

/* ------------------------------------------------------------------
   TEST SUITE 7: NO NATIVE ARRAY.SORT USAGE IN SOURCE
   ------------------------------------------------------------------ */
console.log('\n[7] Verifying NO Array.prototype.sort in algorithms.js');

import fs from 'fs';
const algorithmsSrc = fs.readFileSync(new URL('./algorithms.js', import.meta.url), 'utf8');
const nativeSortMatches = algorithmsSrc.match(/\.sort\s*\(/g);
assertEqual(nativeSortMatches, null, 'algorithms.js contains 0 invocations of .sort()');

/* ------------------------------------------------------------------
   TEST SUITE 8: EDGE CASES (Empty, Single, All-Duplicates)
   ------------------------------------------------------------------ */
console.log('\n[8] Testing Edge Cases (Empty, Single Element, Duplicates)');

// Empty inputs
assertEqual(mergeSort([], createMovieComparator('score')).sorted.length, 0, 'Merge sort handles empty array safely');
assertEqual(quickSort([], createMovieComparator('score')).sorted.length, 0, 'Quick sort handles empty array safely');
assertEqual(quickSelectTopK([], 5).topK.length, 0, 'Quickselect handles empty array safely');
assertEqual(new MaxHeap().peek(), null, 'MaxHeap peek on empty returns null');
assertEqual(new MaxHeap().extractMax(), null, 'MaxHeap extractMax on empty returns null');

// Single element
const single = [{ id: 's1', score: 8.0, title: 'Solo' }];
assertEqual(mergeSort(single, createMovieComparator('score')).sorted[0].title, 'Solo', 'Merge sort handles single element');
assertEqual(quickSort(single, createMovieComparator('score')).sorted[0].title, 'Solo', 'Quick sort handles single element');
assertEqual(quickSelectTopK(single, 1).topK[0].title, 'Solo', 'Quickselect handles single element');

// All identical scores
const identical = [
  { id: 'i1', score: 7.0, votes: 100, title: 'Film A' },
  { id: 'i2', score: 7.0, votes: 100, title: 'Film B' },
  { id: 'i3', score: 7.0, votes: 100, title: 'Film C' }
];
const identicalSorted = mergeSort(identical, createMovieComparator('score'), 'desc');
assertEqual(identicalSorted.sorted[0].title, 'Film A', 'Tied elements resolved alphabetically (Film A)');
assertEqual(identicalSorted.sorted[2].title, 'Film C', 'Tied elements resolved alphabetically (Film C)');

/* ------------------------------------------------------------------
   FINAL SUMMARY
   ------------------------------------------------------------------ */
console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
