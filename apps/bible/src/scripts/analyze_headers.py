#!/usr/bin/env python3
"""
Analyze how headers/section titles are positioned relative to chapters and verses.
"""

import zipfile
import re
from bs4 import BeautifulSoup

def analyze_header_placement():
    """Analyze where headers appear in relation to verses."""
    print("=" * 80)
    print("ANALYZING HEADER PLACEMENT IN OSB")
    print("=" * 80)

    with zipfile.ZipFile('src/data/OSB.epub') as zf:
        # Analyze Genesis
        html_files = []
        for name in zf.namelist():
            if 'Genesis' in name and name.endswith('.html'):
                html_files.append(name)

        print(f"\nGenesis files: {sorted(html_files)}\n")

        for html_file in sorted(html_files)[:2]:  # Just first 2 files
            print(f"\n{'=' * 80}")
            print(f"Analyzing: {html_file}")
            print('=' * 80)

            content = zf.read(html_file).decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')

            # Find all paragraphs
            paragraphs = soup.find_all('p')

            verse_pattern = re.compile(r'(\w+)_vchap(\d+)-(\d+)')

            # Track current chapter
            current_chapter = None
            headers_found = []

            for i, p in enumerate(paragraphs):
                classes = p.get('class', [])

                # Check for headers
                if 'sub1' in classes or 'sub2' in classes or 'h1' in classes:
                    header_text = p.get_text().strip()
                    print(f"\n[Paragraph {i}] HEADER: {header_text}")
                    print(f"  Classes: {classes}")
                    print(f"  Current chapter context: {current_chapter}")
                    headers_found.append({
                        'text': header_text,
                        'chapter': current_chapter,
                        'paragraph_index': i
                    })

                # Check for verse markers to track chapter
                chbeg = p.find('span', class_='chbeg')
                if chbeg:
                    span_id = chbeg.get('id', '')
                    match = verse_pattern.match(span_id)
                    if match:
                        book, chapter, verse = match.groups()
                        if int(verse) == 1:
                            current_chapter = int(chapter)
                            print(f"\n[Paragraph {i}] CHAPTER START: {book} {chapter}:1")

                # Also check sup tags
                sups = p.find_all('sup', id=verse_pattern)
                for sup in sups:
                    verse_id = sup.get('id', '')
                    match = verse_pattern.match(verse_id)
                    if match:
                        book, chapter, verse = match.groups()
                        chapter_num = int(chapter)
                        verse_num = int(verse)
                        if verse_num == 1:
                            current_chapter = chapter_num
                            print(f"\n[Paragraph {i}] CHAPTER START: {book} {chapter}:{verse}")
                        # Show first few verses to see header context
                        if verse_num <= 3 and current_chapter and current_chapter <= 3:
                            print(f"  Verse {chapter}:{verse}: {p.get_text()[:100]}...")

            print(f"\n\nSummary for {html_file}:")
            print(f"Found {len(headers_found)} headers:")
            for h in headers_found:
                print(f"  '{h['text']}' -> Chapter {h['chapter']} (paragraph {h['paragraph_index']})")

def analyze_header_patterns():
    """Look for different header class patterns."""
    print("\n\n" + "=" * 80)
    print("ANALYZING HEADER CLASS PATTERNS")
    print("=" * 80)

    with zipfile.ZipFile('src/data/OSB.epub') as zf:
        # Check a few different books
        books = ['Genesis', 'Exodus', 'Matthew', 'John']

        for book in books:
            html_files = [n for n in zf.namelist() if book in n and n.endswith('.html')]
            if not html_files:
                continue

            print(f"\n--- {book} ---")

            content = zf.read(html_files[0]).decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')

            # Find potential header classes
            header_classes = set()
            for p in soup.find_all('p'):
                classes = p.get('class', [])
                # Look for header-like classes
                for cls in classes:
                    if any(x in cls for x in ['sub', 'head', 'title', 'h1', 'h2', 'h3']):
                        header_classes.add(cls)
                        # Show example
                        if len(header_classes) <= 5:
                            print(f"  Class '{cls}': {p.get_text()[:80]}...")

            print(f"  Total header classes found: {header_classes}")

if __name__ == '__main__':
    analyze_header_placement()
    analyze_header_patterns()
