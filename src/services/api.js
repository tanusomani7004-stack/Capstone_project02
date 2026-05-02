// ─── API Service Layer ────────────────────────────────────────────────────────
// Centralized API calls with error handling, loading states, retry logic
import { useState, useEffect, useCallback } from 'react';

const BASE = {
  quotes:  'https://api.quotable.io',
  books:   'https://openlibrary.org',
  numbers: 'http://numbersapi.com',
};

// Generic fetch wrapper with timeout + error handling
async function apiFetch(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out. Check your internet connection.');
    throw err;
  }
}

// ─── Quotes API (quotable.io) ─────────────────────────────────────────────────
export const QuotesAPI = {
  // Get a random motivational quote
  getRandom: async (tags = 'motivational,success,education') => {
    try {
      const data = await apiFetch(`${BASE.quotes}/quotes/random?tags=${tags}&maxLength=150`);
      return {
        text: data[0]?.content || 'The secret of getting ahead is getting started.',
        author: data[0]?.author || 'Mark Twain',
        tags: data[0]?.tags || [],
        id: data[0]?._id || '1',
      };
    } catch {
      // Fallback quotes if API fails
      const fallbacks = [
        { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
        { text: 'An investment in knowledge pays the best interest.', author: 'Benjamin Franklin' },
        { text: 'Education is the most powerful weapon you can use to change the world.', author: 'Nelson Mandela' },
        { text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss' },
        { text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.', author: 'Mahatma Gandhi' },
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  },

  // Get multiple quotes for insights page
  getMultiple: async (count = 3) => {
    try {
      const data = await apiFetch(`${BASE.quotes}/quotes?tags=motivational,success&limit=${count}&page=1`);
      return data.results?.map(q => ({ text: q.content, author: q.author, id: q._id })) || [];
    } catch {
      return [];
    }
  },
};

// ─── Open Library API ─────────────────────────────────────────────────────────
export const BooksAPI = {
  // Search books by query
  search: async (query, limit = 8) => {
    if (!query?.trim()) return { books: [], total: 0 };
    try {
      const encoded = encodeURIComponent(query.trim());
      const data = await apiFetch(
        `${BASE.books}/search.json?q=${encoded}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,subject,number_of_pages_median,ratings_average`
      );
      const books = (data.docs || []).map(b => ({
        id: b.key,
        title: b.title || 'Unknown Title',
        author: b.author_name?.[0] || 'Unknown Author',
        year: b.first_publish_year || null,
        cover: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null,
        subjects: b.subject?.slice(0, 3) || [],
        pages: b.number_of_pages_median || null,
        rating: b.ratings_average ? Number(b.ratings_average.toFixed(1)) : null,
      }));
      return { books, total: data.numFound || 0 };
    } catch (err) {
      throw new Error(`Book search failed: ${err.message}`);
    }
  },

  // Get trending / featured books for study
  getTrending: async () => {
    try {
      const data = await apiFetch(
        `${BASE.books}/search.json?subject=computer+science&sort=rating+desc&limit=6&fields=key,title,author_name,first_publish_year,cover_i,ratings_average`
      );
      return (data.docs || []).map(b => ({
        id: b.key,
        title: b.title,
        author: b.author_name?.[0] || 'Unknown',
        year: b.first_publish_year,
        cover: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null,
        rating: b.ratings_average ? Number(b.ratings_average.toFixed(1)) : null,
      }));
    } catch {
      return [];
    }
  },
};

// ─── Numbers API ──────────────────────────────────────────────────────────────
export const NumbersAPI = {
  // Get a math fact about a number
  getMathFact: async (n) => {
    const num = n || Math.floor(Math.random() * 100) + 1;
    try {
      const res = await fetch(`${BASE.numbers}/${num}/math?json`);
      const data = await res.json();
      return { number: num, fact: data.text || `${num} is a fascinating number!`, type: 'math' };
    } catch {
      return { number: num, fact: `${num} tasks completed is a great milestone! Keep going!`, type: 'math' };
    }
  },

  // Get a date fact
  getDateFact: async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    try {
      const res = await fetch(`${BASE.numbers}/${month}/${day}/date?json`);
      const data = await res.json();
      return { fact: data.text, type: 'date' };
    } catch {
      return { fact: `Today is a great day to be productive!`, type: 'date' };
    }
  },
};

// ─── Custom hook for API calls ────────────────────────────────────────────────
// Usage: const { data, loading, error, refetch } = useAPI(QuotesAPI.getRandom)

export function useAPI(apiFn, params = null, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = params ? await apiFn(params) : await apiFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
