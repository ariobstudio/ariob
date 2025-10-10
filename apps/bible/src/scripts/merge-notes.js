import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Book name mappings: NKJV name -> OSB name
const BOOK_NAME_MAPPINGS = {
  // Kingdom books (Orthodox naming)
  '1 Samuel': '1Kingdoms',
  '2 Samuel': '2Kingdoms',
  '1 Kings': '3Kingdoms',
  '2 Kings': '4Kingdoms',

  // Chronicles (no space in OSB)
  '1 Chronicles': '1Chronicles',
  '2 Chronicles': '2Chronicles',

  // Ezra/Esdras books
  'Ezra': '2Ezra',  // Canonical Ezra
  '1 Esdras': '1Ezra',  // Apocryphal 1 Esdras

  // Maccabees (no space in OSB)
  '1 Maccabees': '1Maccabees',
  '2 Maccabees': '2Maccabees',
  '3 Maccabees': '3Maccabees',

  // Wisdom books (no space in OSB)
  'Song of Songs': 'SongofSongs',
  'Wisdom': 'WisdomofSolomon',
  'Sirach': 'WisdomofSirach',

  // Other OT books
  'Epistle of Jeremiah': 'EpistleofJeremiah',

  // New Testament (no space in OSB)
  '1 Corinthians': '1Corinthians',
  '2 Corinthians': '2Corinthians',
  '1 Thessalonians': '1Thessalonians',
  '2 Thessalonians': '2Thessalonians',
  '1 Timothy': '1Timothy',
  '2 Timothy': '2Timothy',
  '1 Peter': '1Peter',
  '2 Peter': '2Peter',
  '1 John': '1John',
  '2 John': '2John',
  '3 John': '3John',
};

// Read both JSON files
const osbPath = path.join(__dirname, '../data/bible.json');
const nkjvPath = path.join(__dirname, '../data/NKJV.json');

console.log('Reading OSB bible.json...');
const osb = JSON.parse(fs.readFileSync(osbPath, 'utf8'));

console.log('Reading NKJV.json...');
const nkjv = JSON.parse(fs.readFileSync(nkjvPath, 'utf8'));

console.log('\n=== Starting merge process ===\n');

// Copy global footnotes, liturgy_notes, and cross_refs from OSB
if (osb.footnotes) {
  console.log(`Copying ${Object.keys(osb.footnotes).length} global footnotes from OSB`);
  nkjv.footnotes = osb.footnotes;
}

if (osb.liturgy_notes) {
  console.log(`Copying ${Object.keys(osb.liturgy_notes).length} global liturgy notes from OSB`);
  nkjv.liturgy_notes = osb.liturgy_notes;
}

if (osb.cross_refs) {
  console.log(`Copying ${Object.keys(osb.cross_refs).length} global cross references from OSB`);
  nkjv.cross_refs = osb.cross_refs;
}

console.log('\n--- Processing books ---\n');

let matchedCount = 0;
let unmatchedBooks = [];

// Process each NKJV book
nkjv.books.forEach(nkjvBook => {
  // Try to find matching OSB book using the mapping or direct match
  const mappedName = BOOK_NAME_MAPPINGS[nkjvBook.en_name];
  const osbBook = osb.books.find(b => {
    if (mappedName && b.en_name === mappedName) return true;
    if (b.en_name === nkjvBook.en_name) return true;
    if (b.local_name === nkjvBook.local_name) return true;
    // Try removing spaces from NKJV name
    const nkjvNoSpace = nkjvBook.en_name.replace(/\s+/g, '');
    if (b.en_name === nkjvNoSpace) return true;
    return false;
  });

  if (!osbBook) {
    console.log(`⚠️  Warning: Could not find matching OSB book for "${nkjvBook.en_name}"`);
    unmatchedBooks.push(nkjvBook.en_name);
    return;
  }

  matchedCount++;
  console.log(`\n📖 Processing ${nkjvBook.en_name} → ${osbBook.en_name}`);

  // 1. Copy metadata from OSB
  if (osbBook.metadata) {
    console.log(`   ✓ Adding metadata (${osbBook.metadata.length} sections)`);
    nkjvBook.metadata = osbBook.metadata;
  }

  // 2. Copy lessons from OSB
  if (osbBook.lessons && osbBook.lessons.length > 0) {
    console.log(`   ✓ Adding ${osbBook.lessons.length} lesson(s)`);
    nkjvBook.lessons = osbBook.lessons;
  }

  // 3. Merge footnotes and liturgy notes at verse level
  if (nkjvBook.chapters_list && osbBook.chapters) {
    nkjvBook.chapters_list.forEach(nkjvChapter => {
      const osbChapter = osbBook.chapters.find(c => c.chapter_num === nkjvChapter.chapter_num);

      if (!osbChapter) return;

      // Process paragraphs and verses
      if (nkjvChapter.paragraphs_list && osbChapter.verses) {
        nkjvChapter.paragraphs_list.forEach(nkjvPara => {
          if (nkjvPara.type === 'section_paragraph' && nkjvPara.verses_list?.single_verses_list) {
            nkjvPara.verses_list.single_verses_list.forEach(nkjvVerse => {
              // Find matching verse in OSB (use simplified verses array)
              const osbVerse = osbChapter.verses.find(v =>
                v.num === nkjvVerse.num_int || v.num === parseInt(nkjvVerse.num_str)
              );

              if (osbVerse && osbVerse.parts) {
                // Extract footnote and liturgy note markers from OSB verse parts
                const footnoteMarkers = [];
                const liturgyMarkers = [];

                osbVerse.parts.forEach(part => {
                  if (typeof part === 'object') {
                    if (part.footnote) {
                      footnoteMarkers.push({ style: 'FOOTNOTE', note_id: part.footnote });
                    }
                    if (part.liturgy) {
                      liturgyMarkers.push({ style: 'LITURGY_NOTE', note_id: part.liturgy });
                    }
                  }
                });

                // Add markers to NKJV verse parts if any found
                if (footnoteMarkers.length > 0 || liturgyMarkers.length > 0) {
                  // Add footnote markers
                  footnoteMarkers.forEach(marker => {
                    nkjvVerse.verse_parts.push(marker);
                  });

                  // Add liturgy note markers
                  liturgyMarkers.forEach(marker => {
                    nkjvVerse.verse_parts.push(marker);
                  });
                }
              }
            });
          }
        });
      }
    });
  }
});

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '../../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write the merged NKJV to assets folder
const assetsPath = path.join(assetsDir, 'NKJV.json');
console.log('\n--- Writing merged data ---\n');
console.log(`Writing to: ${assetsPath}`);
fs.writeFileSync(assetsPath, JSON.stringify(nkjv, null, 4));

console.log('\n✅ Merge complete!\n');
console.log('Summary:');
console.log(`  • Total books in NKJV: ${nkjv.books.length}`);
console.log(`  • Books matched with OSB: ${matchedCount}`);
console.log(`  • Books not matched: ${unmatchedBooks.length}`);
if (unmatchedBooks.length > 0) {
  console.log(`    ${unmatchedBooks.join(', ')}`);
}
console.log(`  • Global footnotes: ${nkjv.footnotes ? Object.keys(nkjv.footnotes).length : 0}`);
console.log(`  • Global liturgy notes: ${nkjv.liturgy_notes ? Object.keys(nkjv.liturgy_notes).length : 0}`);
console.log(`  • Global cross references: ${nkjv.cross_refs ? Object.keys(nkjv.cross_refs).length : 0}`);
console.log(`  • Books with metadata: ${nkjv.books.filter(b => b.metadata).length}`);
console.log(`  • Books with lessons: ${nkjv.books.filter(b => b.lessons).length}`);
console.log(`\n📁 Output: apps/bible/assets/NKJV.json\n`);
