#!/usr/bin/env python3
"""
Split the monolithic NKJV.json into separate files:
- bible-metadata.json: Contains version info and book index
- books/{index}.json: Individual book files
- global-notes.json: Global footnotes, liturgy_notes, and cross_refs
"""

import json
import os
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
ASSETS_DIR = SCRIPT_DIR.parent.parent / 'assets'
NKJV_PATH = ASSETS_DIR / 'NKJV.json'
BOOKS_DIR = ASSETS_DIR / 'books'
METADATA_PATH = ASSETS_DIR / 'bible-metadata.json'
GLOBAL_NOTES_PATH = ASSETS_DIR / 'global-notes.json'

print('Reading NKJV.json...')
with open(NKJV_PATH, 'r', encoding='utf-8') as f:
    nkjv_data = json.load(f)

# Create books directory if it doesn't exist
BOOKS_DIR.mkdir(exist_ok=True)
print(f'Created/verified books directory: {BOOKS_DIR}')

# Extract books
books = nkjv_data.get('books', [])
print(f'\nFound {len(books)} books to process')

# Create metadata file
metadata = {
    'version': nkjv_data.get('version', 'NKJV'),
    'bookCount': len(books),
    'books': []
}

# Process each book
for index, book in enumerate(books):
    book_name = book.get('en_name', f'Book{index}')
    print(f'Processing {index}: {book_name}')

    # Add to metadata
    ch_count = book.get('ch_count', 0)
    if 'chapters_list' in book:
        ch_count = len(book['chapters_list'])

    metadata['books'].append({
        'index': index,
        'en_name': book.get('en_name', ''),
        'local_name': book.get('local_name', book.get('en_name', '')),
        'chapterCount': ch_count
    })

    # Create individual book file
    # Extract simplified chapters structure similar to OSB format
    book_data = {
        'index': index,
        'en_name': book.get('en_name', ''),
        'local_name': book.get('local_name', book.get('en_name', '')),
        'chapters': []
    }

    # If the book has chapters_list, convert it to simplified chapters format
    if 'chapters_list' in book:
        for chapter in book['chapters_list']:
            simplified_chapter = {
                'chapter_num': chapter.get('chapter_num', 0),
                'verses_count': chapter.get('verses_count', 0),
                'verses': [],
                'headers': [],
                'paragraphs_list': chapter.get('paragraphs_list', [])
            }

            # Extract verses from paragraphs_list
            if 'paragraphs_list' in chapter:
                for para in chapter['paragraphs_list']:
                    if para.get('type') == 'section_paragraph':
                        verses_list = para.get('verses_list', {})
                        single_verses = verses_list.get('single_verses_list', [])

                        for verse in single_verses:
                            # Create simplified verse structure
                            verse_num = verse.get('num_int', verse.get('num_str', 0))
                            if isinstance(verse_num, str):
                                try:
                                    verse_num = int(verse_num)
                                except:
                                    verse_num = 0

                            # Build verse text from verse_parts
                            verse_text = ''
                            verse_parts = verse.get('verse_parts', [])
                            simplified_parts = []
                            footnote_ids = []
                            liturgy_ids = []

                            for part in verse_parts:
                                if isinstance(part, dict):
                                    if part.get('style') == 'NONE':
                                        verse_text += part.get('text', '')
                                        simplified_parts.append(part.get('text', ''))
                                    elif part.get('style') == 'ITALIC':
                                        verse_text += part.get('text', '')
                                        simplified_parts.append({'italic': part.get('text', '')})
                                    elif part.get('style') == 'FOOTNOTE':
                                        note_id = part.get('note_id')
                                        if note_id:
                                            footnote_ids.append(note_id)
                                            simplified_parts.append({'footnote': note_id})
                                    elif part.get('style') == 'LITURGY_NOTE':
                                        note_id = part.get('note_id')
                                        if note_id:
                                            liturgy_ids.append(note_id)
                                            simplified_parts.append({'liturgy': note_id})
                                else:
                                    # Plain string
                                    verse_text += str(part)
                                    simplified_parts.append(str(part))

                            simplified_verse = {
                                'num': verse_num,
                                'text': verse_text,
                                'parts': simplified_parts,
                                'footnotes': footnote_ids if footnote_ids else None,
                                'liturgy_notes': liturgy_ids if liturgy_ids else None
                            }

                            simplified_chapter['verses'].append(simplified_verse)

                    elif para.get('type') == 'section_header':
                        header_text = para.get('text', '')
                        if header_text:
                            simplified_chapter['headers'].append(header_text)

            book_data['chapters'].append(simplified_chapter)

    # Add metadata and lessons if present
    if 'metadata' in book:
        book_data['metadata'] = book['metadata']

    if 'lessons' in book:
        book_data['lessons'] = book['lessons']

    # Write individual book file
    book_path = BOOKS_DIR / f'{index}.json'
    with open(book_path, 'w', encoding='utf-8') as f:
        json.dump(book_data, f, ensure_ascii=False)
    print(f'  ✓ Wrote {book_path}')

# Write metadata file
print(f'\nWriting metadata file: {METADATA_PATH}')
with open(METADATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)

# Write global notes file
print(f'Writing global notes file: {GLOBAL_NOTES_PATH}')
global_notes = {
    'footnotes': nkjv_data.get('footnotes', {}),
    'liturgy_notes': nkjv_data.get('liturgy_notes', {}),
    'cross_refs': nkjv_data.get('cross_refs', {})
}
with open(GLOBAL_NOTES_PATH, 'w', encoding='utf-8') as f:
    json.dump(global_notes, f, ensure_ascii=False)

print('\n✅ Split complete!')
print(f'  • Metadata: {METADATA_PATH}')
print(f'  • Global notes: {GLOBAL_NOTES_PATH}')
print(f'  • Book files: {BOOKS_DIR}/')
print(f'  • Total books: {len(books)}')
