#!/usr/bin/env python3
"""
Enhanced OSB EPUB extractor with full styling support.

Extracts:
- All verses including verse 1 (chbeg pattern)
- Full styling: italic, divine names, line breaks, bold, etc.
- Lessons/commentary sections
- Book metadata
- Cross-references and footnotes
"""

import argparse
import json
import os
import re
import zipfile
from collections import defaultdict
from typing import Dict, List, Any, Optional, Tuple
from bs4 import BeautifulSoup, NavigableString, Tag


# Style mapping based on HTML classes and tags
STYLE_MAP = {
    'i': 'ITALIC',
    'b': 'BOLD',
    'u': 'UNDERLINE',
    'br': 'LINE_BREAK',
    'small-caps': 'SMALL_CAPS',
    'divine-name': 'DIVINE_NAME',
    'woj': 'WORDS_OF_JESUS',
}


def extract_footnotes(zipf: zipfile.ZipFile) -> Dict[str, Dict[str, Any]]:
    """Extract all footnotes from study*.html files."""
    footnotes = {}
    study_files = [f for f in zipf.namelist() if 'study' in f and f.endswith('.html')]

    for study_file in study_files:
        try:
            content = zipf.read(study_file).decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')

            for div in soup.find_all('div', class_='footnotedef'):
                note_id = div.get('id')
                if not note_id:
                    continue

                # Extract verse reference
                ref_link = div.find('a')
                ref_text = ref_link.get_text() if ref_link else ""

                # Extract note text
                text_parts = []
                for elem in div.contents:
                    if isinstance(elem, NavigableString):
                        text = str(elem).strip()
                        if text and text != '\xa0':
                            text_parts.append(text)
                    elif isinstance(elem, Tag) and elem.name not in ['a', 'b']:
                        text_parts.append(elem.get_text())

                plain_text = ' '.join(text_parts)

                footnotes[note_id] = {
                    'ref': ref_text,
                    'text': plain_text.strip(),
                }
        except Exception as e:
            print(f"Warning: Error extracting footnotes from {study_file}: {e}")

    return footnotes


def parse_verse_content(content_soup: Tag, footnotes_global: Dict,
                       cross_refs_global: Dict, cross_ref_map: Dict) -> Tuple[List[Any], str]:
    """
    Parse verse content with full styling support.

    Returns:
        (parts, plain_text)
    """
    parts = []
    plain_text_parts = []

    def process_node(node):
        if isinstance(node, NavigableString):
            text = str(node).strip()
            if text:
                parts.append(text)
                plain_text_parts.append(text)
        elif isinstance(node, Tag):
            # Handle different tag types
            if node.name == 'i':
                # Italic text
                text = node.get_text()
                if text:
                    parts.append({'style': 'ITALIC', 'text': text})
                    plain_text_parts.append(text)

            elif node.name == 'b':
                # Bold text
                text = node.get_text()
                if text:
                    parts.append({'style': 'BOLD', 'text': text})
                    plain_text_parts.append(text)

            elif node.name == 'br':
                # Line break
                parts.append({'style': 'LINE_BREAK', 'text': '\n'})
                plain_text_parts.append('\n')

            elif node.name == 'span':
                # Check for special span classes
                classes = node.get('class', [])

                # Check if it's a verse number marker (skip it)
                if 'chbeg' in classes:
                    return  # Skip chapter/verse markers

                # Process span contents
                for child in node.children:
                    process_node(child)

            elif node.name == 'a':
                # Link - could be footnote, liturgy, or cross-reference
                href = node.get('href', '')
                link_text = node.get_text()

                if 'study' in href or 'footnote' in href:
                    # Footnote link
                    note_id = href.split('#')[-1] if '#' in href else None
                    if note_id:
                        parts.append({'style': 'FOOTNOTE', 'note_id': note_id})

                elif 'liturgical' in href:
                    # Liturgy note
                    note_id = href.split('#')[-1] if '#' in href else None
                    if note_id:
                        parts.append({'style': 'LITURGY_NOTE', 'note_id': note_id})

                elif href and not href.startswith('#'):
                    # Cross-reference
                    cross_ref_id = f"r{len(cross_ref_map) + 1}"
                    cross_ref_map[cross_ref_id] = True
                    cross_refs_global[cross_ref_id] = {'href': href, 'text': link_text}
                    parts.append({'style': 'CROSS_REF', 'text': link_text, 'ref_id': cross_ref_id})
                    plain_text_parts.append(link_text)

                else:
                    # Regular link, process children
                    for child in node.children:
                        process_node(child)

            elif node.name == 'sup':
                # Superscript - usually verse numbers or note markers, skip or process
                sup_id = node.get('id', '')
                if '_vchap' in sup_id:
                    # Verse number marker, skip
                    return
                # Otherwise process children (could be footnote markers)
                for child in node.children:
                    process_node(child)

            elif node.name == 'small':
                # Small caps (often used for divine names)
                text = node.get_text()
                if text:
                    # Check if it's likely a divine name
                    if text.upper() == text and len(text) > 1:
                        parts.append({'style': 'DIVINE_NAME', 'text': text})
                    else:
                        parts.append({'style': 'SMALL_CAPS', 'text': text})
                    plain_text_parts.append(text)

            else:
                # For other tags, process children
                for child in node.children:
                    process_node(child)

    # Process all children of the content
    for child in content_soup.children:
        process_node(child)

    # Merge consecutive string parts
    merged_parts = []
    for part in parts:
        if isinstance(part, str):
            if merged_parts and isinstance(merged_parts[-1], str):
                merged_parts[-1] += ' ' + part
            else:
                merged_parts.append(part)
        else:
            merged_parts.append(part)

    # Clean up strings
    cleaned_parts = []
    for part in merged_parts:
        if isinstance(part, str):
            cleaned = re.sub(r'\s+', ' ', part).strip()
            if cleaned:
                cleaned_parts.append(cleaned)
        else:
            cleaned_parts.append(part)

    plain_text = ' '.join(plain_text_parts)
    plain_text = re.sub(r'\s+', ' ', plain_text).strip()

    return cleaned_parts, plain_text


def extract_verses_from_paragraph(p: Tag, verse_pattern: re.Pattern,
                                  footnotes_global: Dict, cross_refs_global: Dict,
                                  cross_ref_map: Dict) -> List[Dict[str, Any]]:
    """
    Extract all verses from a paragraph, including verse 1 with chbeg pattern.
    """
    verses = []

    # Check for chbeg span (marks verse 1 of a chapter)
    chbeg_span = p.find('span', class_='chbeg')
    if chbeg_span:
        # Extract chapter and verse from ID
        span_id = chbeg_span.get('id', '')
        match = verse_pattern.match(span_id)
        if match:
            book_abbr, chapter, verse = match.groups()
            chapter_num = int(chapter)
            verse_num = int(verse)

            # Collect content after chbeg span until first <sup> marker
            content = BeautifulSoup('<div></div>', 'html.parser').div
            current = chbeg_span.next_sibling

            while current:
                if isinstance(current, Tag) and current.name == 'sup':
                    next_id = current.get('id', '')
                    if verse_pattern.match(next_id):
                        break  # Stop at next verse

                if isinstance(current, NavigableString):
                    content.append(NavigableString(current))
                elif isinstance(current, Tag):
                    content.append(current)

                current = current.next_sibling

            parts, plain_text = parse_verse_content(content, footnotes_global,
                                                    cross_refs_global, cross_ref_map)

            if parts:
                verses.append({
                    'chapter': chapter_num,
                    'num': verse_num,
                    'text': plain_text,
                    'parts': parts
                })

    # Extract regular verses marked with <sup>
    verse_sups = p.find_all('sup', id=verse_pattern)
    for sup in verse_sups:
        verse_id = sup.get('id', '')
        match = verse_pattern.match(verse_id)
        if not match:
            continue

        book_abbr, chapter, verse = match.groups()
        chapter_num = int(chapter)
        verse_num = int(verse)

        # Collect content after this marker until next verse
        content = BeautifulSoup('<div></div>', 'html.parser').div
        current = sup.next_sibling

        while current:
            if isinstance(current, Tag) and current.name == 'sup':
                next_id = current.get('id', '')
                if verse_pattern.match(next_id):
                    break

            if isinstance(current, NavigableString):
                content.append(NavigableString(current))
            elif isinstance(current, Tag):
                content.append(current)

            current = current.next_sibling

        parts, plain_text = parse_verse_content(content, footnotes_global,
                                                cross_refs_global, cross_ref_map)

        if parts:
            verses.append({
                'chapter': chapter_num,
                'num': verse_num,
                'text': plain_text,
                'parts': parts
            })

    return verses


def extract_lessons(soup: BeautifulSoup, cross_refs_global: Dict,
                   cross_ref_map: Dict) -> List[Dict[str, Any]]:
    """Extract lessons/commentary sections."""
    lessons = []
    current_title = None
    current_entries = []

    for p in soup.find_all('p'):
        classes = p.get('class', [])

        # Check for lesson title
        if 'sub1' in classes or 'sub2' in classes:
            # Flush previous lesson
            if current_entries:
                lessons.append({
                    'title': current_title or '',
                    'entries': current_entries
                })
                current_entries = []

            # Set new title
            title_text = p.get_text().strip()
            # Remove decorative images
            for img in p.find_all('img'):
                img.extract()
            current_title = ' '.join(p.get_text().split())

        # Check for lesson content
        elif any(c in classes for c in ['tx', 'tx1', 'tx2', 'ext', 'ct']):
            # Parse as commentary
            parts, _ = parse_verse_content(p, {}, cross_refs_global, cross_ref_map)
            if parts:
                current_entries.append({'parts': parts})

    # Append last lesson
    if current_entries:
        lessons.append({
            'title': current_title or '',
            'entries': current_entries
        })

    return lessons


def extract_book_metadata(soup: BeautifulSoup, verse_pattern: re.Pattern,
                         cross_refs_global: Dict, cross_ref_map: Dict) -> Dict[str, Any]:
    """
    Extract book metadata: author, date, theme, outline.
    Returns a dict with these fields (may be None if not found).
    """
    metadata = {
        'author': None,
        'date': None,
        'theme': None,
        'outline': []
    }

    # Find where verses start (metadata is before verses)
    verse_start_index = None
    all_paragraphs = soup.find_all('p')

    for i, p in enumerate(all_paragraphs):
        chbeg = p.find('span', class_='chbeg')
        sups = p.find_all('sup', id=verse_pattern)
        if chbeg or sups:
            verse_start_index = i
            break

    # Only process paragraphs before verses
    intro_paragraphs = all_paragraphs[:verse_start_index] if verse_start_index else all_paragraphs

    # Extract author, date, theme from bookstarttxt paragraphs
    for p in intro_paragraphs:
        classes = p.get('class', [])
        if 'bookstarttxt' not in classes:
            continue

        text = p.get_text().strip()

        # Author (format: "Author—text" or "Author:text")
        if text.startswith('Author'):
            # Strip "Author—" or "Author:" prefix
            content = re.sub(r'^Author[—:-]\s*', '', text)
            metadata['author'] = content

        # Date
        elif text.startswith('Date'):
            content = re.sub(r'^Date[—:-]\s*', '', text)
            metadata['date'] = content

        # Theme (can be "Theme—" or "Major Theme—")
        elif 'Theme' in text[:20]:
            content = re.sub(r'^(Major\s+)?Theme[—:-]\s*', '', text)
            metadata['theme'] = content

    # Extract outline
    outline_items = []
    in_outline = False

    for i, p in enumerate(intro_paragraphs):
        classes = p.get('class', [])
        text = p.get_text().strip()

        # Check if this is the outline header
        if 'bookstart' in classes and text == 'Outline':
            in_outline = True
            continue

        # If we're in outline section, collect items
        if in_outline:
            # Outline content is in tx1, tx, or similar classes
            if any(c in classes for c in ['tx1', 'tx', 'tx2', 'bookstarttxt']):
                # Parse the outline item with full formatting
                parts, plain_text = parse_verse_content(p, {}, cross_refs_global, cross_ref_map)
                if parts:
                    outline_items.append({
                        'parts': parts,
                        'text': plain_text
                    })
            # Stop at next bookstart section or when we hit content without these classes
            elif 'bookstart' in classes or (text and not any(c in classes for c in ['tx1', 'tx', 'tx2', 'bookstarttxt'])):
                break

    metadata['outline'] = outline_items

    return metadata


def extract_book_content(zipf: zipfile.ZipFile, book_file: str,
                        footnotes_global: Dict, liturgy_global: Dict,
                        cross_refs_global: Dict, cross_ref_map: Dict) -> Optional[Dict[str, Any]]:
    """Extract content from a single book with full styling."""
    try:
        # Find all HTML files for this book
        html_files = []
        for name in zipf.namelist():
            basename = os.path.splitext(os.path.basename(name))[0]
            if basename == book_file or basename.startswith(book_file):
                html_files.append(name)

        if not html_files:
            return None

        # Combine HTML content
        combined_html = ''
        for html_file in sorted(html_files):
            try:
                combined_html += zipf.read(html_file).decode('utf-8')
            except:
                pass

        if not combined_html:
            return None

        soup = BeautifulSoup(combined_html, 'html.parser')

        # Extract book name from title
        book_name = book_file
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text().strip()
            if title and title.lower() not in ['study', 'contents', 'toc']:
                book_name = title

        # Clean up book name
        if book_name == book_file:
            book_name = re.sub(r'(\d)([A-Z])', r'\1 \2', book_file)
            book_name = re.sub(r'([a-z])([A-Z])', r'\1 \2', book_name)

        # Extract verses
        verse_pattern = re.compile(r'(\w+)_vchap(\d+)-(\d+)')
        verses_by_chapter = defaultdict(list)

        for p in soup.find_all('p'):
            paragraph_verses = extract_verses_from_paragraph(
                p, verse_pattern, footnotes_global, cross_refs_global, cross_ref_map
            )
            for verse in paragraph_verses:
                verses_by_chapter[verse['chapter']].append(verse)

        if not verses_by_chapter:
            return None

        # Extract section headers with proper chapter association
        headers_by_chapter = defaultdict(list)

        # Iterate through all paragraphs to track headers and their chapter context
        all_paragraphs = soup.find_all('p')
        current_chapter = None
        pending_headers = []

        for p in all_paragraphs:
            classes = p.get('class', [])

            # Check if this paragraph starts a new chapter
            chbeg = p.find('span', class_='chbeg')
            if chbeg:
                span_id = chbeg.get('id', '')
                match = verse_pattern.match(span_id)
                if match:
                    _, chapter, verse = match.groups()
                    if int(verse) == 1:
                        new_chapter = int(chapter)
                        # Flush pending headers to this chapter
                        if pending_headers:
                            for header in pending_headers:
                                headers_by_chapter[new_chapter].append(header)
                            pending_headers = []
                        current_chapter = new_chapter

            # Also check for sup tags for chapter starts
            sups = p.find_all('sup', id=verse_pattern)
            for sup in sups:
                verse_id = sup.get('id', '')
                match = verse_pattern.match(verse_id)
                if match:
                    _, chapter, verse = match.groups()
                    verse_num = int(verse)
                    if verse_num == 1:
                        new_chapter = int(chapter)
                        # Flush pending headers to this chapter
                        if pending_headers:
                            for header in pending_headers:
                                headers_by_chapter[new_chapter].append(header)
                            pending_headers = []
                        current_chapter = new_chapter

            # Check if this is a header
            if 'sub1' in classes or 'sub2' in classes:
                header_text = p.get_text().strip()
                # Remove images
                for img in p.find_all('img'):
                    img.extract()
                header_text = ' '.join(p.get_text().split())
                if header_text:
                    if current_chapter is not None:
                        # We've seen verses, so this header belongs to current chapter
                        headers_by_chapter[current_chapter].append(header_text)
                    else:
                        # No chapter yet, store as pending
                        pending_headers.append(header_text)

        # Extract lessons/commentary
        lessons = extract_lessons(soup, cross_refs_global, cross_ref_map)

        # Extract book metadata (author, date, theme, outline)
        book_metadata = extract_book_metadata(soup, verse_pattern, cross_refs_global, cross_ref_map)

        # Organize into chapters
        chapters = []
        for chapter_num in sorted(verses_by_chapter.keys()):
            verses = sorted(verses_by_chapter[chapter_num], key=lambda v: v['num'])

            # Remove chapter key from verses (already in chapter context)
            for v in verses:
                v.pop('chapter', None)

            chapters.append({
                'chapter_num': chapter_num,
                'verses_count': max(v['num'] for v in verses) if verses else 0,
                'verses': verses,
                'headers': headers_by_chapter.get(chapter_num, [])
            })

        result = {
            'en_name': book_name,
            'local_name': book_name,
            'abr': book_file.lower(),  # Will be made unique later
            'ch_count': len(chapters),
            'chapters': chapters
        }

        # Add metadata fields if available
        if book_metadata.get('author'):
            result['author'] = book_metadata['author']
        if book_metadata.get('date'):
            result['date'] = book_metadata['date']
        if book_metadata.get('theme'):
            result['theme'] = book_metadata['theme']
        if book_metadata.get('outline'):
            result['outline'] = book_metadata['outline']

        # Add lessons if any
        if lessons:
            result['lessons'] = lessons

        return result

    except Exception as e:
        print(f"Error extracting {book_file}: {e}")
        import traceback
        traceback.print_exc()
        return None


def generate_unique_abbreviations(books: list) -> None:
    """
    Generate unique 3-letter abbreviations for all books.
    Modifies books in-place.
    """
    used_abrs = set()

    for book in books:
        original_abr = book['abr'].lower()
        base_abr = original_abr[:3]

        # If the 3-letter abbreviation is unique, use it
        if base_abr not in used_abrs:
            book['abr'] = base_abr
            used_abrs.add(base_abr)
        else:
            # Try progressively longer abbreviations
            for length in range(4, len(original_abr) + 1):
                candidate = original_abr[:length]
                if candidate not in used_abrs:
                    book['abr'] = candidate
                    used_abrs.add(candidate)
                    break
            else:
                # If still not unique, append a number
                counter = 2
                while f"{base_abr}{counter}" in used_abrs:
                    counter += 1
                book['abr'] = f"{base_abr}{counter}"
                used_abrs.add(f"{base_abr}{counter}")


def main():
    parser = argparse.ArgumentParser(description='Enhanced OSB EPUB extractor with full styling')
    parser.add_argument('--input', '-i', required=True, help='Path to OSB EPUB file')
    parser.add_argument('--output', '-o', help='Path to output JSON file (single file mode)')
    parser.add_argument('--output-dir', '-d', help='Output directory for split files')
    parser.add_argument('--limit', type=int, help='Limit to first N books (for testing)')
    parser.add_argument('--split', action='store_true', help='Split into separate book files')
    args = parser.parse_args()

    if not args.output and not args.output_dir:
        parser.error("Either --output or --output-dir must be specified")

    print(f"Opening EPUB: {args.input}")

    with zipfile.ZipFile(args.input, 'r') as zipf:
        # Extract global data
        print("Extracting footnotes...")
        footnotes_global = extract_footnotes(zipf)
        print(f"  Found {len(footnotes_global)} footnotes")

        liturgy_global = {}
        cross_refs_global = {}
        cross_ref_map = {}

        # Get book files
        print("Discovering books...")
        all_files = []
        for f in zipf.namelist():
            if f.endswith('.html') and 'OEBPS/' in f:
                basename = os.path.splitext(os.path.basename(f))[0]
                base = re.sub(r'\d+$', '', basename)
                if base not in all_files:
                    all_files.append(base)

        # Filter out non-book files (be very specific to not skip actual books)
        skip_files = {'study', 'introduction', 'contents', 'copyright', 'acknowledgments',
                     'glossary', 'index', 'prayers', 'toc', 'cover', 'evening', 'morning',
                     'liturgical', 'citation', 'how', 'illustrations', 'introducing',
                     'lectionary', 'overview', 'source', 'special',
                     'alternative', 'background', 'dedication', 'half', 'titlepage',
                     'translation', 'variant', 'x-liturgical',
                     'old_testamentbooks', 'the_bible', 'the_seventy'}

        # Use exact matching to avoid skipping books that contain these keywords
        book_files = []
        for b in all_files:
            b_lower = b.lower()
            # Skip if the entire name matches a skip pattern
            if b_lower in skip_files:
                continue
            # Skip if it starts with certain patterns
            if any(b_lower.startswith(skip) for skip in ['study', 'introduction', 'how_to', 'the_bible', 'the_seventy']):
                continue
            # Otherwise keep it
            book_files.append(b)

        # Sort in canonical order (Orthodox Bible order)
        canonical_order = [
            # Old Testament
            'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
            'Joshua', 'Judges', 'Ruth', '1Kingdoms', '2Kingdoms', '3Kingdoms', '4Kingdoms',
            '1Chronicles', '2Chronicles', '1Ezra', '2Ezra', 'Nehemiah', 'Esther',
            'Judith', 'Tobit', '1Maccabees', '2Maccabees', '3Maccabees',
            'Psalms', 'Proverbs', 'Ecclesiastes', 'SongofSongs', 'Job',
            'WisdomofSolomon', 'WisdomofSirach',
            'Hosea', 'Amos', 'Micah', 'Joel', 'Obadiah', 'Jonah', 'Nahum',
            'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
            'Isaiah', 'Jeremiah', 'Baruch', 'Lamentations', 'EpistleofJeremiah',
            'Ezekiel', 'Daniel',
            # New Testament
            'Matthew', 'Mark', 'Luke', 'John', 'Acts',
            'James', '1Peter', '2Peter', '1John', '2John', '3John', 'Jude',
            'Romans', '1Corinthians', '2Corinthians', 'Galatians', 'Ephesians',
            'Philippians', 'Colossians', '1Thessalonians', '2Thessalonians',
            '1Timothy', '2Timothy', 'Titus', 'Philemon', 'Hebrews', 'Revelation'
        ]

        sorted_books = []
        for book in canonical_order:
            if book in book_files:
                sorted_books.append(book)
                book_files.remove(book)
        # Add any remaining books at the end (shouldn't be any)
        sorted_books.extend(sorted(book_files))
        book_files = sorted_books

        if args.limit:
            book_files = book_files[:args.limit]

        print(f"Processing {len(book_files)} books...")

        books = []
        for i, book_file in enumerate(book_files, 1):
            print(f"  [{i}/{len(book_files)}] Extracting {book_file}...")
            book_data = extract_book_content(zipf, book_file, footnotes_global, liturgy_global,
                                           cross_refs_global, cross_ref_map)
            if book_data:
                books.append(book_data)
                print(f"      Found {book_data['ch_count']} chapters, "
                      f"{sum(len(ch['verses']) for ch in book_data['chapters'])} verses")
                if 'lessons' in book_data:
                    print(f"      Found {len(book_data['lessons'])} lesson sections")

        # Generate unique abbreviations for all books
        print("\nGenerating unique abbreviations...")
        generate_unique_abbreviations(books)

        # Output
        if args.split or args.output_dir:
            output_dir = args.output_dir or os.path.dirname(args.output)
            books_dir = os.path.join(output_dir, 'books')
            os.makedirs(books_dir, exist_ok=True)

            print(f"\nWriting books to {books_dir}/...")
            book_index = []
            for book in books:
                book_filename = f"{book['abr']}.json"
                book_path = os.path.join(books_dir, book_filename)

                with open(book_path, 'w', encoding='utf-8') as f:
                    json.dump(book, f, ensure_ascii=False, indent=2)

                book_index.append({
                    'name': book['en_name'],
                    'abr': book['abr'],
                    'chapters': book['ch_count'],
                    'file': book_filename
                })

            # Write index
            index_path = os.path.join(books_dir, 'index.json')
            with open(index_path, 'w', encoding='utf-8') as f:
                json.dump(book_index, f, ensure_ascii=False, indent=2)

            # Write metadata
            metadata_path = os.path.join(output_dir, 'metadata.json')
            metadata = {
                'version': 'OSB',
                'lang': 'English',
                'footnotes': footnotes_global,
                'liturgy_notes': liturgy_global,
                'cross_refs': cross_refs_global
            }
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)

            print(f"\nDone! Extracted {len(books)} books")
            print(f"  Total verses: {sum(sum(len(ch['verses']) for ch in book['chapters']) for book in books)}")
            print(f"  Footnotes: {len(footnotes_global)}")
            print(f"  Cross-references: {len(cross_refs_global)}")
        else:
            # Single file mode
            output = {
                'version': 'OSB',
                'lang': 'English',
                'books': books,
                'footnotes': footnotes_global,
                'liturgy_notes': liturgy_global,
                'cross_refs': cross_refs_global
            }

            os.makedirs(os.path.dirname(args.output), exist_ok=True)
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=2)

            print(f"\nDone! Extracted {len(books)} books to {args.output}")


if __name__ == '__main__':
    main()
