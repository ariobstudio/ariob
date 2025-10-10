#!/usr/bin/env python3
"""
Orthodox Study Bible (OSB) EPUB extractor.

Extracts the OSB EPUB into a JSON format matching the NKJV structure with:
- Chapters with verses
- Plain text for search
- Rich parts (strings, italic, cross_ref, footnote, liturgy)
- Global footnotes, liturgy_notes, and cross_refs dictionaries
- Book metadata and lessons (commentary)
"""

import argparse
import json
import os
import re
import zipfile
from collections import defaultdict
from typing import Dict, List, Any, Optional, Tuple
from bs4 import BeautifulSoup, NavigableString, Tag


def extract_toc(zipf: zipfile.ZipFile) -> List[str]:
    """Extract book order from toc.ncx."""
    try:
        toc_content = zipf.read('OEBPS/toc.ncx').decode('utf-8')
        soup = BeautifulSoup(toc_content, 'xml')
        nav_points = soup.find_all('navPoint')

        books = []
        for nav in nav_points:
            content_tag = nav.find('content')
            if content_tag and 'src' in content_tag.attrs:
                src = content_tag['src']
                # Extract book filename without .html
                book_file = os.path.splitext(os.path.basename(src.split('#')[0]))[0]
                if book_file and book_file not in books:
                    books.append(book_file)

        return books
    except Exception as e:
        print(f"Warning: Could not extract TOC: {e}")
        return []


def extract_footnotes(zipf: zipfile.ZipFile) -> Dict[str, Dict[str, Any]]:
    """Extract all footnotes from study*.html files."""
    footnotes = {}
    study_files = [f for f in zipf.namelist() if 'study' in f and f.endswith('.html')]

    for study_file in study_files:
        try:
            content = zipf.read(study_file).decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')

            # Find all footnote definitions
            for div in soup.find_all('div', class_='footnotedef'):
                note_id = div.get('id')
                if not note_id:
                    continue

                # Extract verse reference (e.g., "1:1")
                ref_link = div.find('a')
                ref_text = ref_link.get_text() if ref_link else ""

                # Extract note text parts
                parts = []
                for content in div.contents:
                    if isinstance(content, NavigableString):
                        text = str(content).strip()
                        if text and text != '\xa0':  # Skip nbsp
                            parts.append(text)
                    elif isinstance(content, Tag):
                        if content.name == 'a':
                            continue  # Skip the reference link
                        elif content.name == 'i':
                            parts.append({'italic': content.get_text()})
                        elif content.name == 'span':
                            text = content.get_text().strip()
                            if text:
                                parts.append(text)
                        elif content.name == 'b':
                            continue  # Skip bold verse numbers
                        else:
                            text = content.get_text().strip()
                            if text:
                                parts.append(text)

                # Merge consecutive strings
                merged_parts = []
                for part in parts:
                    if isinstance(part, str):
                        if merged_parts and isinstance(merged_parts[-1], str):
                            merged_parts[-1] += ' ' + part
                        else:
                            merged_parts.append(part)
                    else:
                        merged_parts.append(part)

                # Calculate plain text
                plain_text = ''.join(
                    p if isinstance(p, str) else p.get('italic', '')
                    for p in merged_parts
                )

                footnotes[note_id] = {
                    'ref': ref_text,
                    'text': plain_text.strip(),
                    'parts': merged_parts
                }
        except Exception as e:
            print(f"Warning: Error extracting footnotes from {study_file}: {e}")

    return footnotes


def parse_verse_parts(elem: Tag, footnotes_global: Dict, liturgy_global: Dict,
                      cross_refs_global: Dict, cross_ref_map: Dict) -> List[Any]:
    """Parse a verse element into parts (strings, italic, cross_ref, footnote, liturgy)."""
    parts = []

    def process_element(element):
        if isinstance(element, NavigableString):
            text = str(element)
            if text.strip():
                # Skip verse numbers in sup tags
                if not (hasattr(element.parent, 'name') and element.parent.name == 'sup' and
                       element.parent.get('id', '').startswith(('Gen_', 'Exo_', 'Lev_'))):
                    parts.append(text)
        elif isinstance(element, Tag):
            if element.name == 'i':
                text = element.get_text()
                if text.strip():
                    parts.append({'italic': text})
            elif element.name == 'a':
                href = element.get('href', '')
                # Check if it's a footnote/liturgy link
                if 'study' in href or 'liturgical' in href:
                    # Extract footnote ID from href (e.g., "study1.html#f138" -> "f138")
                    note_id = href.split('#')[-1] if '#' in href else None
                    if note_id:
                        # Determine if it's a footnote or liturgy note based on href
                        if 'liturgical' in href:
                            parts.append({'liturgy': note_id})
                        else:
                            parts.append({'footnote': note_id})
                elif href and not href.startswith('#'):
                    # Cross-reference link
                    cross_ref_id = f"r{len(cross_ref_map) + 1}"
                    cross_ref_map[cross_ref_id] = True
                    cross_refs_global[cross_ref_id] = {'href': href}
                    parts.append({'text': element.get_text(), 'cross_ref': cross_ref_id})
                else:
                    # Regular link, treat as text
                    for child in element.children:
                        process_element(child)
            elif element.name == 'sup':
                # Verse number - skip if it's a verse marker
                verse_id = element.get('id', '')
                if '_vchap' in verse_id:
                    # This is a verse number marker, skip it
                    return
                # Otherwise process children (might be footnote links)
                for child in element.children:
                    process_element(child)
            elif element.name == 'span':
                # Process span contents
                for child in element.children:
                    process_element(child)
            elif element.name == 'br':
                parts.append('\n')
            else:
                # For other tags, process children
                for child in element.children:
                    process_element(child)

    for child in elem.children:
        process_element(child)

    # Merge consecutive strings
    merged_parts = []
    for part in parts:
        if isinstance(part, str):
            if merged_parts and isinstance(merged_parts[-1], str):
                merged_parts[-1] += part
            else:
                merged_parts.append(part)
        else:
            merged_parts.append(part)

    # Clean up strings
    cleaned_parts = []
    for part in merged_parts:
        if isinstance(part, str):
            # Clean up whitespace
            cleaned = re.sub(r'\s+', ' ', part).strip()
            if cleaned:
                cleaned_parts.append(cleaned)
        else:
            cleaned_parts.append(part)

    return cleaned_parts


def extract_book_content(zipf: zipfile.ZipFile, book_file: str,
                        footnotes_global: Dict, liturgy_global: Dict,
                        cross_refs_global: Dict, cross_ref_map: Dict) -> Optional[Dict[str, Any]]:
    """Extract content from a single book file."""
    try:
        # Try to read the main book file
        html_files = []
        for name in zipf.namelist():
            basename = os.path.splitext(os.path.basename(name))[0]
            if basename == book_file or basename.startswith(book_file):
                html_files.append(name)

        if not html_files:
            print(f"Warning: No HTML files found for {book_file}")
            return None

        # Combine all HTML content for this book
        combined_html = ''
        for html_file in sorted(html_files):
            try:
                combined_html += zipf.read(html_file).decode('utf-8')
            except Exception as e:
                print(f"Warning: Could not read {html_file}: {e}")

        if not combined_html:
            return None

        soup = BeautifulSoup(combined_html, 'html.parser')

        # Extract book name - prefer from title or use file name
        book_name = book_file

        # Try to get from title tag first
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text().strip()
            if title and title.lower() not in ['study', 'contents', 'toc']:
                book_name = title

        # If title is generic, use the file name (cleaned up)
        if book_name == book_file:
            # Convert camelCase to spaces (e.g., "1Kingdoms" -> "1 Kingdoms")
            book_name = re.sub(r'(\d)([A-Z])', r'\1 \2', book_file)
            book_name = re.sub(r'([a-z])([A-Z])', r'\1 \2', book_name)

        # Find all verses by looking for verse markers
        verse_pattern = re.compile(r'(\w+)_vchap(\d+)-(\d+)')
        verses_by_chapter = defaultdict(list)
        section_headers = []

        # First pass: collect section headers with their positions
        for i, p in enumerate(soup.find_all('p')):
            classes = p.get('class', [])
            if 'sub1' in classes or 'sub2' in classes:
                header_text = p.get_text().strip()
                # Remove image references
                header_text = re.sub(r'<img[^>]*>', '', header_text)
                if header_text:
                    section_headers.append((i, header_text))

        # Second pass: extract verses
        for p in soup.find_all('p'):
            # Find all verse markers in this paragraph
            verse_sups = p.find_all('sup', id=verse_pattern)

            for sup in verse_sups:
                verse_id = sup.get('id', '')
                match = verse_pattern.match(verse_id)
                if not match:
                    continue

                book_abbr, chapter, verse = match.groups()
                chapter_num = int(chapter)
                verse_num = int(verse)

                # Extract verse text starting from this marker
                verse_content = []
                current = sup.next_sibling

                # Collect content until next verse marker or end of paragraph
                while current:
                    if isinstance(current, Tag) and current.name == 'sup':
                        next_id = current.get('id', '')
                        if verse_pattern.match(next_id):
                            break  # Stop at next verse
                    verse_content.append(current)
                    current = current.next_sibling

                # Parse verse parts
                temp_tag = soup.new_tag('span')
                for content in verse_content:
                    if isinstance(content, NavigableString):
                        temp_tag.append(NavigableString(content))
                    elif isinstance(content, Tag):
                        temp_tag.append(content)

                parts = parse_verse_parts(temp_tag, footnotes_global, liturgy_global,
                                        cross_refs_global, cross_ref_map)

                # Calculate plain text
                plain_text = ''
                for part in parts:
                    if isinstance(part, str):
                        plain_text += part
                    elif isinstance(part, dict):
                        if 'italic' in part:
                            plain_text += part['italic']
                        elif 'text' in part:
                            plain_text += part['text']

                verses_by_chapter[chapter_num].append({
                    'num': verse_num,
                    'text': plain_text.strip(),
                    'parts': parts
                })

        # Organize into chapters
        if not verses_by_chapter:
            print(f"Warning: No verses found for {book_file}")
            return None

        chapters = []
        for chapter_num in sorted(verses_by_chapter.keys()):
            verses = sorted(verses_by_chapter[chapter_num], key=lambda v: v['num'])

            # Find section headers for this chapter
            chapter_headers = []
            for idx, header in section_headers:
                # Simple heuristic: assign header to chapter based on content
                chapter_headers.append(header)

            chapters.append({
                'chapter_num': chapter_num,
                'verses_count': max(v['num'] for v in verses) if verses else 0,
                'verses': verses,
                'headers': chapter_headers[:3] if chapter_headers else []  # Limit headers
            })

        return {
            'en_name': book_name,
            'local_name': book_name,
            'abr': book_file.lower()[:3],
            'ch_count': len(chapters),
            'chapters': chapters
        }

    except Exception as e:
        print(f"Error extracting {book_file}: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    parser = argparse.ArgumentParser(description='Extract OSB EPUB to JSON')
    parser.add_argument('--input', '-i', required=True, help='Path to OSB EPUB file')
    parser.add_argument('--output', '-o', help='Path to output JSON file (single file mode)')
    parser.add_argument('--output-dir', '-d', help='Output directory for split files (books/, metadata.json)')
    parser.add_argument('--limit', type=int, help='Limit to first N books (for testing)')
    parser.add_argument('--split', action='store_true', help='Split into separate book files and metadata')
    args = parser.parse_args()

    if not args.output and not args.output_dir:
        parser.error("Either --output or --output-dir must be specified")

    print(f"Opening EPUB: {args.input}")

    with zipfile.ZipFile(args.input, 'r') as zipf:
        # Extract global data
        print("Extracting footnotes...")
        footnotes_global = extract_footnotes(zipf)
        print(f"  Found {len(footnotes_global)} footnotes")

        liturgy_global = {}  # Will be populated during verse extraction
        cross_refs_global = {}
        cross_ref_map = {}

        # Get book order from TOC
        print("Extracting book order from TOC...")
        book_files = extract_toc(zipf)

        # Always use fallback: get all HTML files and filter
        # Get unique base names (without numbers)
        all_files = []
        for f in zipf.namelist():
            if f.endswith('.html') and 'OEBPS/' in f:
                basename = os.path.splitext(os.path.basename(f))[0]
                # Remove trailing numbers (e.g., "Genesis1" -> "Genesis")
                base = re.sub(r'\d+$', '', basename)
                if base not in all_files:
                    all_files.append(base)

        book_files = all_files

        # Filter to known books (skip study, introduction, etc.)
        skip_files = {'study', 'introduction', 'contents', 'copyright', 'acknowledgments',
                     'glossary', 'index', 'prayers', 'toc', 'cover', 'evening', 'morning',
                     'liturgical', 'citation'}
        book_files = [b for b in book_files if not any(skip in b.lower() for skip in skip_files)]

        # Sort books in canonical order if possible
        canonical_order = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
                          'Joshua', 'Judges', 'Ruth', '1Kingdoms', '2Kingdoms', '3Kingdoms', '4Kingdoms']
        sorted_books = []
        for book in canonical_order:
            if book in book_files:
                sorted_books.append(book)
                book_files.remove(book)
        sorted_books.extend(sorted(book_files))  # Add remaining books
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
                print(f"      Found {book_data['ch_count']} chapters")

        # Build final output
        if args.split or args.output_dir:
            # Split mode: separate files for each book and metadata
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

                # Add to index
                book_index.append({
                    'name': book['en_name'],
                    'abr': book['abr'],
                    'chapters': book['ch_count'],
                    'file': book_filename
                })
                print(f"  Wrote {book['en_name']} -> {book_filename}")

            # Write book index
            index_path = os.path.join(books_dir, 'index.json')
            with open(index_path, 'w', encoding='utf-8') as f:
                json.dump(book_index, f, ensure_ascii=False, indent=2)
            print(f"  Wrote book index -> index.json")

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
            print(f"  Wrote metadata -> metadata.json")

            print(f"\nDone! Extracted {len(books)} books with {len(footnotes_global)} footnotes")
            print(f"Total cross-references: {len(cross_refs_global)}")
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

            # Write to file
            print(f"\nWriting output to {args.output}...")
            os.makedirs(os.path.dirname(args.output), exist_ok=True)
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=2)

            print(f"\nDone! Extracted {len(books)} books with {len(footnotes_global)} footnotes")
            print(f"Total cross-references: {len(cross_refs_global)}")


if __name__ == '__main__':
    main()
