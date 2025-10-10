// OSB Book Loader - uses index.json to dynamically load books
import booksIndex from '../assets/books/index.json';

interface BookIndex {
  name: string;
  abr: string;
  chapters: number;
  file: string;
}

// Cast the imported index to the correct type
const index = booksIndex as BookIndex[];

// Create a mapping from book index to file name
const indexToFile: Record<number, string> = {};
index.forEach((book, idx) => {
  indexToFile[idx] = book.file;
});

/**
 * Load book data by index.
 * @param bookIndex - The 0-based index of the book
 * @returns The book data
 */
export async function loadBookData(bookIndex: number): Promise<any> {
  const fileName = indexToFile[bookIndex];

  if (!fileName) {
    throw new Error(`Book ${bookIndex} not found in index`);
  }

  try {
    // Dynamic import based on the file name
    const bookData = await import(`../assets/books/${fileName}`);
    return bookData.default || bookData;
  } catch (error) {
    console.error(`Failed to load book ${bookIndex} (${fileName}):`, error);
    throw new Error(`Failed to load book ${bookIndex}`);
  }
}

/**
 * Get the book index (metadata from index.json)
 * @returns Array of book metadata
 */
export function getBooksIndex(): BookIndex[] {
  return index;
}

/**
 * Load book by abbreviation
 * @param abbr - The book abbreviation (e.g., "gen", "exo")
 * @returns The book data
 */
export async function loadBookByAbbr(abbr: string): Promise<any> {
  const bookEntry = index.find(b => b.abr.toLowerCase() === abbr.toLowerCase());

  if (!bookEntry) {
    throw new Error(`Book with abbreviation '${abbr}' not found`);
  }

  try {
    const bookData = await import(`../assets/books/${bookEntry.file}`);
    return bookData.default || bookData;
  } catch (error) {
    console.error(`Failed to load book '${abbr}' (${bookEntry.file}):`, error);
    throw new Error(`Failed to load book '${abbr}'`);
  }
}
