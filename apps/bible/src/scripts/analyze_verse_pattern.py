#!/usr/bin/env python3
"""
Analyze verse patterns in OSB EPUB to understand why verse 1 is missing.
"""

import zipfile
import re
from bs4 import BeautifulSoup

def analyze_genesis_chapter1():
    """Analyze Genesis Chapter 1 verse structure."""
    print("=" * 80)
    print("ANALYZING GENESIS CHAPTER 1 VERSE STRUCTURE")
    print("=" * 80)

    with zipfile.ZipFile('src/data/OSB.epub') as zf:
        # Read Genesis1.html
        content = zf.read('OEBPS/Genesis1.html').decode('utf-8')
        soup = BeautifulSoup(content, 'html.parser')

        # Find all paragraphs
        paragraphs = soup.find_all('p')

        print(f"\nTotal paragraphs in Genesis1.html: {len(paragraphs)}\n")

        # Look for verse markers
        verse_pattern = re.compile(r'Gen_vchap(\d+)-(\d+)')

        # Analyze first few paragraphs
        for i, p in enumerate(paragraphs[:10]):
            classes = p.get('class', [])
            print(f"\n--- Paragraph {i+1} ---")
            print(f"Classes: {classes}")

            # Find verse markers in this paragraph
            verse_sups = p.find_all('sup', id=verse_pattern)
            if verse_sups:
                print(f"Verse markers found: {len(verse_sups)}")
                for sup in verse_sups:
                    verse_id = sup.get('id', '')
                    match = verse_pattern.match(verse_id)
                    if match:
                        chapter, verse = match.groups()
                        print(f"  - Chapter {chapter}, Verse {verse} (ID: {verse_id})")

            # Show text preview
            text = p.get_text()[:200]
            print(f"Text preview: {text}...")

            # Show HTML structure
            print(f"HTML: {str(p)[:300]}...")

def analyze_verse1_pattern():
    """Check how verse 1 appears in different books."""
    print("\n" + "=" * 80)
    print("ANALYZING VERSE 1 PATTERN ACROSS BOOKS")
    print("=" * 80)

    with zipfile.ZipFile('src/data/OSB.epub') as zf:
        books_to_check = ['Genesis1', 'Exodus1', 'Matthew', 'John']

        for book in books_to_check:
            print(f"\n--- {book} ---")
            try:
                # Try to read the file
                filename = f'OEBPS/{book}.html'
                content = zf.read(filename).decode('utf-8')
                soup = BeautifulSoup(content, 'html.parser')

                # Look for chapter 1, verse 1
                verse_pattern = re.compile(r'(\w+)_vchap1-1')
                verse1 = soup.find('sup', id=verse_pattern)

                if verse1:
                    print(f"  ✓ Found verse 1 marker: {verse1.get('id')}")
                    # Get parent paragraph
                    parent = verse1.find_parent('p')
                    if parent:
                        print(f"  Parent class: {parent.get('class', [])}")
                        # Check if there's a class="chbeg" span
                        chbeg = parent.find('span', class_='chbeg')
                        if chbeg:
                            print(f"  Found chbeg span: {chbeg}")
                else:
                    print(f"  ✗ Verse 1 marker NOT found")

                    # Look for alternative patterns
                    # Check for class="chapter1" or class="chbeg"
                    chbeg_span = soup.find('span', class_='chbeg')
                    if chbeg_span:
                        print(f"  Found chbeg span: {chbeg_span}")
                        parent = chbeg_span.find_parent('p')
                        if parent:
                            print(f"  Parent class: {parent.get('class', [])}")
                            print(f"  Text: {parent.get_text()[:200]}...")

                    chapter1_p = soup.find('p', class_='chapter1')
                    if chapter1_p:
                        print(f"  Found chapter1 paragraph")
                        print(f"  Text: {chapter1_p.get_text()[:200]}...")

            except Exception as e:
                print(f"  Error reading {book}: {e}")

def analyze_lessons_pattern():
    """Analyze how lessons/commentary are structured."""
    print("\n" + "=" * 80)
    print("ANALYZING LESSONS/COMMENTARY PATTERN")
    print("=" * 80)

    with zipfile.ZipFile('src/data/OSB.epub') as zf:
        content = zf.read('OEBPS/Genesis1.html').decode('utf-8')
        soup = BeautifulSoup(content, 'html.parser')

        # Look for different paragraph classes
        class_counts = {}
        for p in soup.find_all('p'):
            classes = ' '.join(p.get('class', []))
            if classes:
                class_counts[classes] = class_counts.get(classes, 0) + 1

        print("\nParagraph class distribution:")
        for cls, count in sorted(class_counts.items(), key=lambda x: -x[1]):
            print(f"  {cls}: {count}")

        # Look for specific commentary classes
        print("\n--- Sample paragraphs by class ---")
        for cls in ['sub1', 'sub2', 'tx', 'tx1', 'ext', 'ct']:
            samples = soup.find_all('p', class_=cls, limit=2)
            if samples:
                print(f"\nClass '{cls}' ({len(samples)} samples):")
                for p in samples[:1]:
                    print(f"  Text: {p.get_text()[:150]}...")

if __name__ == '__main__':
    analyze_genesis_chapter1()
    analyze_verse1_pattern()
    analyze_lessons_pattern()
