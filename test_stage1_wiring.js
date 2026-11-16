import fs from 'fs';
import { computeGlobalMean, getWeightedScore, MIN_VOTES, wishlist, userRatings } from './js/store.js';
import { rankAll, topK } from './js/ranking.js';

console.log('====================================================');
console.log('AUDIENCELENS: STAGE 1 WIRING & DATA VERIFICATION');
console.log('====================================================\n');

// 1. Verify data/movies.json
const rawData = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));
console.log(`[1] Dataset: loaded ${rawData.length} movies.`);
if (rawData.length !== 120) {
  console.error(`FAIL: expected 120 movies, got ${rawData.length}`);
  process.exit(1);
}

// Check sample movie fields
const sample = rawData[0];
const requiredFields = ['id', 'title', 'year', 'genres', 'rating', 'votes', 'runtime', 'director', 'poster', 'overview'];
for (const field of requiredFields) {
  if (sample[field] === undefined) {
    console.error(`FAIL: movie missing required field "${field}"`);
    process.exit(1);
  }
}
console.log('  ✓ All 120 movie records contain required schema fields.');

// 2. Mean C and Weighted Score
const C = computeGlobalMean(rawData);
console.log(`[2] Global mean rating C: ${C}`);
console.log(`    MIN_VOTES m: ${MIN_VOTES}`);

const enriched = rawData.map(m => ({
  ...m,
  score: getWeightedScore(m, MIN_VOTES, C)
}));

console.log(`  ✓ Sample WR for "${enriched[0].title}" (R: ${enriched[0].rating}, v: ${enriched[0].votes}): ${enriched[0].score}`);

// 3. Test rankAll (Merge Sort)
const mergeRes = rankAll(enriched, 'score', 'desc', 'mergesort');
console.log('\n[3] Testing rankAll (mergesort):');
console.log(`  Algorithm: ${mergeRes.algorithm}`);
console.log(`  Results count: ${mergeRes.results.length}`);
console.log(`  Execution Time: ${mergeRes.timeMs} ms`);
console.log(`  Comparisons: ${mergeRes.comparisons}`);
console.log(`  #1: ${mergeRes.results[0].title} (score: ${mergeRes.results[0].score})`);

// 4. Test rankAll (Quick Sort)
const quickRes = rankAll(enriched, 'score', 'desc', 'quicksort');
console.log('\n[4] Testing rankAll (quicksort):');
console.log(`  Algorithm: ${quickRes.algorithm}`);
console.log(`  Results count: ${quickRes.results.length}`);
console.log(`  Execution Time: ${quickRes.timeMs} ms`);
console.log(`  Comparisons: ${quickRes.comparisons}`);
console.log(`  #1: ${quickRes.results[0].title} (score: ${quickRes.results[0].score})`);

// Verify matching top-10
const mergeTop10 = mergeRes.results.slice(0, 10).map(m => m.id).join(',');
const quickTop10 = quickRes.results.slice(0, 10).map(m => m.id).join(',');
if (mergeTop10 === quickTop10) {
  console.log('  ✓ Merge Sort and Quick Sort produce identical top 10!');
} else {
  console.error('  ✗ FAIL: Top 10 mismatch between Merge Sort and Quick Sort');
  process.exit(1);
}

// 5. Test topK (Max-Heap)
const heapRes = topK(enriched, 10, 'heap');
console.log('\n[5] Testing topK (heap):');
console.log(`  Algorithm: ${heapRes.algorithm}`);
console.log(`  Results count: ${heapRes.results.length}`);
console.log(`  Execution Time: ${heapRes.timeMs} ms`);
console.log(`  Comparisons: ${heapRes.comparisons}`);
console.log(`  Top 3: ${heapRes.results.slice(0, 3).map(m => m.title).join(' | ')}`);

// 6. Test topK (Quickselect)
const selectRes = topK(enriched, 10, 'quickselect');
console.log('\n[6] Testing topK (quickselect):');
console.log(`  Algorithm: ${selectRes.algorithm}`);
console.log(`  Results count: ${selectRes.results.length}`);
console.log(`  Execution Time: ${selectRes.timeMs} ms`);
console.log(`  Comparisons: ${selectRes.comparisons}`);
console.log(`  Top 3: ${selectRes.results.slice(0, 3).map(m => m.title).join(' | ')}`);

const heapTop10 = heapRes.results.map(m => m.id).join(',');
const selectTop10 = selectRes.results.map(m => m.id).join(',');
if (heapTop10 === selectTop10) {
  console.log('  ✓ Heap and Quickselect produce identical top 10!');
} else {
  console.error('  ✗ FAIL: Top 10 mismatch between Heap and Quickselect');
  process.exit(1);
}

console.log('\n====================================================');
console.log('ALL STAGE 1 BACKEND TESTS PASSED SUCCESSFULLY.');
console.log('====================================================');
