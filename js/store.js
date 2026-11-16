/**
 * AUDIENCELENS / DATA & STATE STORE (store.js)
 * -------------------------------------------------------------
 * Manages catalogue loading, Bayesian weighted rating calculation,
 * resilient localStorage persistence for wishlist and user ratings.
 */

import { MOVIES_DATA } from '../data/movies.js';

// Archival minimum vote threshold constant m
export const MIN_VOTES = 25000;

/**
 * Computes the global arithmetic mean rating C across a dataset of movies.
 * Complexity: O(n)
 * 
 * @param {Array<Object>} movies 
 * @returns {number} Mean rating C rounded to 2 decimal places
 */
export function computeGlobalMean(movies) {
  if (!movies || !Array.isArray(movies) || movies.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < movies.length; i++) {
    sum += Number(movies[i].rating) || 0;
  }
  return +(sum / movies.length).toFixed(2);
}

/**
 * Computes the Bayesian Weighted Score (WR) for a movie:
 *   WR = (v / (v + m)) * R + (m / (v + m)) * C
 * 
 * @param {Object} movie 
 * @param {number} [m=MIN_VOTES] Minimum vote threshold
 * @param {number} [C=8.0] Dataset mean rating
 * @returns {number} Weighted score rounded to 3 decimal places
 */
export function getWeightedScore(movie, m = MIN_VOTES, C = 8.0) {
  const R = Number(movie.rating) || 0;
  const v = Number(movie.votes) || 0;
  if (v + m === 0) return R;
  const score = (v / (v + m)) * R + (m / (v + m)) * C;
  return Math.round(score * 1000) / 1000;
}

/**
 * Helper to enrich an array of raw movie objects with calculated scores and metadata.
 */
function enrichMovies(rawMovies) {
  const C = computeGlobalMean(rawMovies);
  const m = MIN_VOTES;

  const enriched = rawMovies.map(movie => {
    const score = getWeightedScore(movie, m, C);
    return {
      ...movie,
      score,
      meanCatalogRating: C,
      minVoteThreshold: m
    };
  });

  return {
    movies: enriched,
    C,
    m
  };
}

/**
 * Loads the movie catalogue. Tries fetching /data/movies.json first (over HTTP),
 * and seamlessly falls back to bundled MOVIES_DATA if opened via file:// protocol.
 * 
 * @param {string} [jsonUrl='./data/movies.json']
 * @returns {Promise<{ movies: Array<Object>, C: number, m: number }>}
 */
export async function loadMovies(jsonUrl = './data/movies.json') {
  // Check if fetch is viable (e.g. running over HTTP/HTTPS)
  if (typeof fetch === 'function' && typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
    try {
      const response = await fetch(jsonUrl);
      if (response.ok) {
        const rawMovies = await response.json();
        if (Array.isArray(rawMovies) && rawMovies.length > 0) {
          return enrichMovies(rawMovies);
        }
      }
    } catch (e) {
      console.warn('[AudienceLens Store] Fetch failed, falling back to static MOVIES_DATA module.', e);
    }
  }

  // Resilient fallback (Node.js test environment or file:/// protocol)
  return enrichMovies(MOVIES_DATA);
}

/* ==========================================================================
   WISHLIST LOCALSTORAGE API (RESILIENT & SAFE)
   ========================================================================== */

const WISHLIST_STORAGE_KEY = 'audiencelens_wishlist_v1';

export const wishlist = {
  /**
   * Safe getter: returns parsed array or empty array if empty/corrupted.
   * @returns {Array<Object>}
   */
  getAll() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const serialized = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!serialized) return [];
      const parsed = JSON.parse(serialized);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[AudienceLens Store] Wishlist corrupted in localStorage. Resetting to empty.', e);
      return [];
    }
  },

  _save(items) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.error('[AudienceLens Store] Failed to write wishlist to localStorage:', e);
    }
  },

  /**
   * Adds a movie to the wishlist.
   * @param {Object} movie 
   * @param {number} [priority=3] 1 (low) to 5 (urgent)
   * @param {string} [notes='']
   * @returns {Object} Newly created wishlist record
   */
  add(movie, priority = 3, notes = '') {
    const items = this.getAll();
    const existing = items.find(item => item.movieId === movie.id);
    if (existing) {
      existing.priority = Math.max(1, Math.min(5, Number(priority) || 3));
      if (notes) existing.notes = notes;
      this._save(items);
      return existing;
    }

    const newItem = {
      id: `wish-${movie.id || Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      movieId: movie.id,
      title: movie.title,
      year: movie.year,
      director: movie.director,
      poster: movie.poster,
      runtime: movie.runtime,
      rating: movie.rating,
      score: movie.score,
      priority: Math.max(1, Math.min(5, Number(priority) || 3)),
      notes: notes || '',
      watched: false,
      addedAt: Date.now()
    };

    items.push(newItem);
    this._save(items);
    return newItem;
  },

  /**
   * Removes an item by wishlist item id or movieId.
   * @param {string} id 
   * @returns {boolean} True if removed
   */
  remove(id) {
    const items = this.getAll();
    const initialLen = items.length;
    const filtered = items.filter(item => item.id !== id && item.movieId !== id);
    if (filtered.length !== initialLen) {
      this._save(filtered);
      return true;
    }
    return false;
  },

  /**
   * Toggles the watched state of an item.
   * @param {string} id 
   * @returns {boolean} New watched state, or null if not found
   */
  toggleWatched(id) {
    const items = this.getAll();
    const item = items.find(it => it.id === id || it.movieId === id);
    if (!item) return null;
    item.watched = !item.watched;
    this._save(items);
    return item.watched;
  },

  /**
   * Sets priority level (1 to 5).
   * @param {string} id 
   * @param {number} priority 
   * @returns {boolean} True if updated
   */
  setPriority(id, priority) {
    const items = this.getAll();
    const item = items.find(it => it.id === id || it.movieId === id);
    if (!item) return false;
    item.priority = Math.max(1, Math.min(5, Number(priority) || 3));
    this._save(items);
    return true;
  },

  /**
   * Clears the entire wishlist.
   */
  clear() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
      }
    } catch (e) {
      console.error('[AudienceLens Store] Failed to clear wishlist:', e);
    }
  }
};

/* ==========================================================================
   USER RATINGS LOCALSTORAGE API (RESILIENT & SAFE)
   ========================================================================== */

const USER_RATINGS_STORAGE_KEY = 'audiencelens_user_ratings_v1';

export const userRatings = {
  getAll() {
    try {
      if (typeof localStorage === 'undefined') return {};
      const serialized = localStorage.getItem(USER_RATINGS_STORAGE_KEY);
      if (!serialized) return {};
      const parsed = JSON.parse(serialized);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (e) {
      console.warn('[AudienceLens Store] User ratings corrupted. Resetting to empty.', e);
      return {};
    }
  },

  _save(ratingsMap) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(USER_RATINGS_STORAGE_KEY, JSON.stringify(ratingsMap));
      }
    } catch (e) {
      console.error('[AudienceLens Store] Failed to save user ratings:', e);
    }
  },

  getRating(movieId) {
    const all = this.getAll();
    return all[movieId] ? all[movieId].rating : null;
  },

  setRating(movieId, rating) {
    const all = this.getAll();
    const clamped = Math.max(0, Math.min(10, +(Number(rating) || 0).toFixed(1)));
    all[movieId] = {
      rating: clamped,
      ratedAt: Date.now()
    };
    this._save(all);
    return all[movieId];
  },

  removeRating(movieId) {
    const all = this.getAll();
    if (all[movieId]) {
      delete all[movieId];
      this._save(all);
      return true;
    }
    return false;
  },

  clear() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(USER_RATINGS_STORAGE_KEY);
      }
    } catch (e) {
      console.error('[AudienceLens Store] Failed to clear user ratings:', e);
    }
  }
};

/* ==========================================================================
   LOCALSTORAGE MIGRATION (ONE-TIME KEY MIGRATION)
   ========================================================================== */

/**
 * Migrates data from legacy storage keys to new AudienceLens storage keys.
 * Preserves user ratings, wishlist entries, priorities, and watch states.
 */
function migrateStorageKey(oldKey, newKey) {
  try {
    if (typeof localStorage !== 'undefined') {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldVal);
        localStorage.removeItem(oldKey);
      }
    }
  } catch (e) {
    console.warn('[AudienceLens Store] Storage migration failed for key:', oldKey, e);
  }
}

// Execute migration on module load
migrateStorageKey('kinothek_wishlist_v1', WISHLIST_STORAGE_KEY);
migrateStorageKey('kinothek_wishlist', WISHLIST_STORAGE_KEY);
migrateStorageKey('kinothek_user_ratings_v1', USER_RATINGS_STORAGE_KEY);
migrateStorageKey('kinothek_ratings', USER_RATINGS_STORAGE_KEY);
