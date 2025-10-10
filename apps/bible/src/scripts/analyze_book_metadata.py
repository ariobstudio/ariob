#!/usr/bin/env python3
"""
Analyze book metadata structure (author, date, outline, theme, etc.)
"""

import zipfile
import re
from bs4 import BeautifulSoup

def analyze_book_intro():
    """Analyze introductory metadata for books."""
    print("=" * 80)
    print("ANALYZING BOOK METADATA STRUCTURE")
    print("=" * 80)

    with zipfile.ZipFile('src/data/OSB.epub') as zf:
        # Check a few books
        books = ['Genesis', 'Exodus', 'Matthew', 'Romans']

        for book in books:
            html_files = [n for n in zf.namelist() if book in n and n.endswith('.html')]
            if not html_files:
                continue

            print(f"\n{'=' * 80}")
            print(f"Book: {book}")
            print('=' * 80)

            content = zf.read(html_files[0]).decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')

            # Look for paragraphs before first chapter
            verse_pattern = re.compile(r'(\w+)_vchap(\d+)-(\d+)')

            found_first_verse = False
            intro_paragraphs = []

            for p in soup.find_all('p'):
                # Check if we've reached the first verse
                chbeg = p.find('span', class_='chbeg')
                sups = p.find_all('sup', id=verse_pattern)

                if chbeg or sups:
                    found_first_verse = True
                    break

                # Collect intro paragraphs
                classes = p.get('class', [])
                text = p.get_text().strip()

                if text and classes:
                    intro_paragraphs.append({
                        'classes': classes,
                        'text': text[:200]
                    })

            print(f"\nIntro paragraphs (before first verse): {len(intro_paragraphs)}")

            # Show first 20 intro paragraphs
            for i, para in enumerate(intro_paragraphs[:20]):
                print(f"\n[{i+1}] Classes: {para['classes']}")
                print(f"    Text: {para['text']}...")

            # Look for specific metadata patterns
            print(f"\n\n--- Searching for metadata patterns ---")

            for p in soup.find_all('p', limit=100):
                text = p.get_text().strip()

                # Look for author
                if text.startswith('AUTHOR:') or 'Author:' in text or text.startswith('- '):
                    print(f"\nPossible AUTHOR: {text[:150]}")
                    print(f"  Classes: {p.get('class', [])}")

                # Look for date
                if text.startswith('DATE:') or 'Date:' in text or 'written' in text.lower():
                    print(f"\nPossible DATE: {text[:150]}")
                    print(f"  Classes: {p.get('class', [])}")

                # Look for theme
                if text.startswith('THEME:') or 'Theme:' in text:
                    print(f"\nPossible THEME: {text[:150]}")
                    print(f"  Classes: {p.get('class', [])}")

                # Look for outline
                if text.startswith('OUTLINE:') or 'Outline:' in text:
                    print(f"\nPossible OUTLINE: {text[:150]}")
                    print(f"  Classes: {p.get('class', [])}")

def analyze_paragraph_classes():
    """Analyze all paragraph class types in the EPUB."""
    print("\n\n" + "=" * 80)
    print("ALL PARAGRAPH CLASSES IN EPUB")
    print("=" * 80)

    with zipfile.ZipFile('src/data/OSB.epub') as zf:
        all_classes = set()
        class_examples = {}

        # Sample a few books
        books_to_check = ['Genesis', 'Matthew', 'Romans']

        for book in books_to_check:
            html_files = [n for n in zf.namelist() if book in n and n.endswith('.html')]
            if not html_files:
                continue

            content = zf.read(html_files[0]).decode('utf-8')
            soup = BeautifulSoup(content, 'html.parser')

            for p in soup.find_all('p'):
                classes = tuple(p.get('class', []))
                if classes:
                    all_classes.add(classes)
                    if classes not in class_examples:
                        class_examples[classes] = p.get_text().strip()[:100]

        print(f"\nTotal unique class combinations: {len(all_classes)}\n")

        for classes in sorted(all_classes, key=lambda x: ' '.join(x)):
            print(f"\nClass: {' '.join(classes)}")
            print(f"  Example: {class_examples.get(classes, '')}...")

if __name__ == '__main__':
    analyze_book_intro()
    analyze_paragraph_classes()
