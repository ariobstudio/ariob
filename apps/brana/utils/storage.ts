import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Paper, PaperItem } from '../types/paper';

const PAPERS_KEY = '@brana_papers';
const CURRENT_PAPER_KEY = '@brana_current_paper';

// In-memory cache for faster subsequent loads
let papersCache: PaperItem[] | null = null;
let currentPaperIdCache: string | null = null;
let cacheInitialized = false;

// Debounced save to prevent excessive writes
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 500;

export async function savePapers(papers: PaperItem[]): Promise<void> {
  // Update cache immediately for fast reads
  papersCache = papers;

  // Debounce the actual persistence to reduce I/O
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }
  saveDebounceTimer = setTimeout(async () => {
    await AsyncStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
    saveDebounceTimer = null;
  }, SAVE_DEBOUNCE_MS);
}

// Force save immediately (use when navigating away)
export async function flushPapers(): Promise<void> {
  if (saveDebounceTimer && papersCache) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
    await AsyncStorage.setItem(PAPERS_KEY, JSON.stringify(papersCache));
  }
}

export async function loadPapers(): Promise<PaperItem[]> {
  // Return cached data if available (instant)
  if (papersCache !== null) {
    return papersCache;
  }

  // Load from storage on first access
  const data = await AsyncStorage.getItem(PAPERS_KEY);
  const papers: PaperItem[] = data ? JSON.parse(data) : [];
  papersCache = papers;
  return papers;
}

export async function saveCurrentPaperId(id: string | null): Promise<void> {
  currentPaperIdCache = id;
  if (id) {
    await AsyncStorage.setItem(CURRENT_PAPER_KEY, id);
  } else {
    await AsyncStorage.removeItem(CURRENT_PAPER_KEY);
  }
}

export async function loadCurrentPaperId(): Promise<string | null> {
  // Return cached data if available
  if (cacheInitialized) {
    return currentPaperIdCache;
  }

  currentPaperIdCache = await AsyncStorage.getItem(CURRENT_PAPER_KEY);
  cacheInitialized = true;
  return currentPaperIdCache;
}

// Invalidate cache (useful for testing or force refresh)
export function invalidateCache(): void {
  papersCache = null;
  currentPaperIdCache = null;
  cacheInitialized = false;
}

export function generateTitle(content: string): string {
  // Get the first line of text content (strip HTML, preserve spacing)
  const text = content
    .replace(/<\/[^>]+>/g, '\n') // Convert closing tags to newlines
    .replace(/<[^>]*>/g, '')     // Remove remaining tags
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)[0] || 'Untitled';

  return text.slice(0, 40) + (text.length > 40 ? '...' : '');
}

export function generatePreview(content: string): string {
  // Get all text after the first line
  const lines = content
    .replace(/<\/[^>]+>/g, '\n') // Convert closing tags to newlines
    .replace(/<[^>]*>/g, '')     // Remove remaining tags
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Skip first line (it's the title), join the rest
  const previewText = lines.slice(1).join(' ').trim();
  return previewText.slice(0, 100) + (previewText.length > 100 ? '...' : '');
}

export function generatePaperId(): string {
  return Date.now().toString();
}
