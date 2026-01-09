import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Paper, PaperItem } from '../types/paper';

const PAPERS_KEY = '@brana_papers';
const CURRENT_PAPER_KEY = '@brana_current_paper';

export async function savePapers(papers: PaperItem[]): Promise<void> {
  await AsyncStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
}

export async function loadPapers(): Promise<PaperItem[]> {
  const data = await AsyncStorage.getItem(PAPERS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveCurrentPaperId(id: string | null): Promise<void> {
  if (id) {
    await AsyncStorage.setItem(CURRENT_PAPER_KEY, id);
  } else {
    await AsyncStorage.removeItem(CURRENT_PAPER_KEY);
  }
}

export async function loadCurrentPaperId(): Promise<string | null> {
  return await AsyncStorage.getItem(CURRENT_PAPER_KEY);
}

export function generateTitle(content: string): string {
  const text = content.replace(/<[^>]*>/g, '').trim();
  // Get first line only
  const firstLine = text.split('\n')[0]?.trim() || 'Untitled';
  return firstLine.slice(0, 40) + (firstLine.length > 40 ? '...' : '');
}

export function generatePreview(content: string): string {
  const text = content.replace(/<[^>]*>/g, '').trim();
  return text.slice(0, 100) + (text.length > 100 ? '...' : '');
}

export function generatePaperId(): string {
  return Date.now().toString();
}
