"""
Simplified extractor for the Orthodox Study Bible (OSB) EPUB.

This script produces a developer‑friendly JSON representation of the
Bible, flattening chapters and verses, extracting plain text for each
verse, normalising footnotes and liturgical notes into global tables,
and assigning short IDs to cross references to avoid repeated objects.

Key features:

1. **Simplified Chapter/Verse Access**: Each book has a `chapters` array,
   and each chapter has a `verses` array for direct indexing (`book.chapters[0].verses[0]`).

2. **Plain Text**: Each verse includes a `text` field containing the
   concatenated plain text (including italic and cross reference labels) to
   support fast searching without parsing `parts`.

3. **Global Footnotes and Liturgy Notes**: Footnotes and liturgical notes
   are stored in `footnotes` and `liturgy_notes` dictionaries keyed by
   their reference IDs (e.g. `f1`, `fx3`). Verse parts that reference
   these notes include only the note ID, reducing duplication.

4. **Cross Reference Normalisation**: All cross references (links to other
   verses) are assigned a short ID (e.g. `r1`, `r2`) and stored in a
   global `cross_refs` dictionary. Verse parts refer to these IDs via
   the `cross_ref` field.

5. **Developer‑Friendly Parts**: Within each verse, `parts` is an array
   containing either plain strings (for unstyled text) or objects for
   italicised text, footnote/liturgy note markers, or cross references.
   This structure is easy to map to JSX/TypeScript (e.g., by checking
   for `italic`, `footnote`, `liturgy` or `cross_ref` keys).

6. **Hybrid Backwards Compatibility**: For migration, the original
   `paragraphs_list` structure is retained under each chapter,
   allowing existing consumers to continue functioning while the new
   `chapters` and `verses` fields are adopted.

Usage:
    python extract_osb_simplified.py --input path/to/epub --output path/to/json

"""

import argparse
import json
import os
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from typing import Dict, List, Tuple, Any

from bs4 import BeautifulSoup

from extract_osb_enhanced import parse_nav_map, build_footnote_dict, group_book_files, parse_cross_reference
from extract_osb_enhanced import extract_book_info, collect_section_headers  # reuse helpers
from extract_osb_enhanced import parse_cross_reference  # for commentary parsing

def parse_commentary_parts(p_tag, current_book: str, cross_ref_map: Dict[Tuple[Any, ...], str], cross_refs: Dict[str, Any]) -> List[Any]:
    """Parse a commentary paragraph (<p> with class tx/tx1/ext/ct) into simplified parts.

    This function extracts plain text, italicised segments, and cross references from a commentary
    paragraph. It cleans up duplicate punctuation and whitespace, merges consecutive strings, and
    also detects cross references within plain text (e.g., "Ps 103:30; 32:6") and converts them
    into cross‑reference objects. Links to notes are treated as plain text to avoid
    duplication since the notes themselves are stored separately.

    Args:
        p_tag: BeautifulSoup tag for the paragraph.
        current_book: Current book name for relative references.
        cross_ref_map: Mapping from target tuples to cross ref IDs.
        cross_refs: Global cross refs dictionary to populate.
    Returns:
        List of simplified parts: plain strings, italic segments, cross references.
    """
    raw_parts: List[Any] = []
    # Iterate over the immediate contents of the <p> tag
    for elem in p_tag.contents:
        if isinstance(elem, str):
            text = elem
            if text:
                raw_parts.append(text)
        elif elem.name == 'span':
            # treat <span> as plain text
            text = elem.get_text()
            if text:
                raw_parts.append(text)
        elif elem.name == 'i':
            text = elem.get_text()
            if text:
                raw_parts.append({'italic': text})
        elif elem.name == 'a':
            href = elem.get('href')
            anchor_text = elem.get_text()
            if href and anchor_text:
                # Determine if link is a note (footnote or liturgy) or cross reference
                file_part = None
                href_clean = href.lstrip('#')
                if '#' in href_clean:
                    file_part = href_clean.split('#', 1)[0]
                elif '.html' in href_clean:
                    file_part = href_clean
                is_note = False
                if file_part:
                    base_name = os.path.basename(file_part).lower()
                    if base_name.startswith('study') or 'citation' in base_name:
                        is_note = True
                    elif 'liturgical' in base_name:
                        is_note = True
                if not is_note:
                    # cross reference
                    target = parse_cross_reference(href)
                    key = tuple(sorted(target.items()))
                    cid = cross_ref_map.get(key)
                    if not cid:
                        cid = f"r{len(cross_ref_map) + 1}"
                        cross_ref_map[key] = cid
                        cross_refs[cid] = target
                    raw_parts.append({'text': anchor_text, 'cross_ref': cid})
                else:
                    # Note link inside commentary: treat the visible text as plain text; actual note
                    # content is handled elsewhere.
                    raw_parts.append(anchor_text)
        else:
            # For any other tag, append its text
            text = elem.get_text()
            if text:
                raw_parts.append(text)

    # Clean up: merge adjacent strings and remove whitespace-only segments
    merged_parts: List[Any] = []
    for part in raw_parts:
        if isinstance(part, str):
            # Skip empty or whitespace-only strings
            if not part.strip():
                continue
            if merged_parts and isinstance(merged_parts[-1], str):
                merged_parts[-1] += part
            else:
                merged_parts.append(part)
        else:
            merged_parts.append(part)

    # Further process string parts to detect cross references within them (e.g. "Ps 103:30; 32:6")
    processed_parts: List[Any] = []
    # Regex pattern to find verse references with optional book abbreviation
    # Supports references like "Ps 103:30", "32:6", "1:4-25"
    ref_pattern = re.compile(r'(?:(?P<book>[A-Za-z]{1,3})\s)?(?P<chap>\d+):(?P<start>\d+)(?:[–-](?P<end>\d+))?')
    for part in merged_parts:
        if isinstance(part, str):
            text = part
            idx = 0
            last_book_abbrev: str = None
            for m in ref_pattern.finditer(text):
                start, end = m.span()
                # add preceding text if any
                if start > idx:
                    prefix = text[idx:start]
                    if prefix:
                        processed_parts.append(prefix)
                ref_text = m.group(0)
                book_abbrev = m.group('book')
                chap = int(m.group('chap'))
                verse_start = int(m.group('start'))
                verse_end = int(m.group('end')) if m.group('end') else verse_start
                # Determine the book abbreviation for this ref
                if book_abbrev:
                    last_book_abbrev = book_abbrev
                if not book_abbrev and last_book_abbrev:
                    book_abbrev = last_book_abbrev
                # Build target dict
                target: Dict[str, Any] = {'chapter': chap, 'verse': verse_start}
                if verse_end != verse_start:
                    target['verse_end'] = verse_end
                if book_abbrev:
                    target['book_abbrev'] = book_abbrev
                else:
                    # If no book abbreviation specified at all, use current book file
                    target['book_file'] = current_book
                # Get cross ref ID
                key = tuple(sorted(target.items()))
                cid = cross_ref_map.get(key)
                if not cid:
                    cid = f"r{len(cross_ref_map) + 1}"
                    cross_ref_map[key] = cid
                    cross_refs[cid] = target
                processed_parts.append({'text': ref_text, 'cross_ref': cid})
                idx = end
            if idx < len(text):
                suffix = text[idx:]
                if suffix:
                    processed_parts.append(suffix)
        else:
            processed_parts.append(part)
    return processed_parts


def parse_note_text_simple(text: str, current_book: str) -> List[Dict[str, Any]]:
    """Parse a footnote text string into parts for simplified output.

    Recognises references like `1:4-25`, `Mk 7:8`, `Is 29:13` and
    converts them into cross references (with IDs assigned later). All
    other text is returned as plain strings.
    """
    parts: List[Dict[str, Any]] = []
    pattern = re.compile(r'(?:(?P<book>[A-Za-z]{1,3})\s)?(?P<chap>\d+):(?P<start>\d+)(?:[–-](?P<end>\d+))?')
    idx = 0
    for m in pattern.finditer(text):
        start, end = m.span()
        if start > idx:
            parts.append(text[idx:start])
        ref_text = m.group(0)
        book_abbrev = m.group('book')
        chap = int(m.group('chap'))
        verse_start = int(m.group('start'))
        verse_end = int(m.group('end')) if m.group('end') else verse_start
        target: Dict[str, Any] = {'chapter': chap, 'verse': verse_start}
        if verse_end != verse_start:
            target['verse_end'] = verse_end
        if book_abbrev:
            target['book_abbrev'] = book_abbrev
        else:
            target['book_file'] = current_book
        parts.append({'cross_target': target, 'text': ref_text})
        idx = end
    if idx < len(text):
        parts.append(text[idx:])
    return parts


def simplify_parts(parts: List[Dict[str, Any]], cross_ref_map: Dict[Tuple[Any, ...], str], cross_refs: Dict[str, Any]) -> Tuple[List[Any], List[str], List[str]]:
    """Convert detailed parts into simplified parts for a verse.

    Args:
        parts: List of detailed parts from extract_verses (each part is a dict with style and fields).
        cross_ref_map: Mapping from target tuples to cross ref IDs.
        cross_refs: Dictionary to populate with cross ref definitions.

    Returns:
        simplified_parts: List where plain strings remain strings and objects are used for italic, cross refs, footnote/liturgy markers.
        footnote_ids: List of footnote IDs referenced in this verse.
        liturgy_ids: List of liturgy IDs referenced in this verse.
    """
    simplified_parts: List[Any] = []
    footnote_ids: List[str] = []
    liturgy_ids: List[str] = []
    for part in parts:
        style = part.get('style')
        if style == 'NONE':
            simplified_parts.append(part['text'])
        elif style == 'ITALIC':
            simplified_parts.append({'italic': part['text']})
        elif style == 'CROSS_REF':
            target = part['target']
            # Build a key for the cross reference (tuple of sorted items)
            key_items = []
            for k in sorted(target.keys()):
                key_items.append((k, target[k]))
            key = tuple(key_items)
            cross_id = cross_ref_map.get(key)
            if not cross_id:
                cross_id = f"r{len(cross_ref_map) + 1}"
                cross_ref_map[key] = cross_id
                # Store the definition in cross_refs
                cross_refs[cross_id] = target
            simplified_parts.append({'text': part['text'], 'cross_ref': cross_id})
        elif style in ('FOOTNOTE', 'LITURGY_NOTE'):
            note_id = part.get('note_id') or None
            # Our extract_verses stores 'text' and 'note_parts' but not note_id; we need to extract id from note text or part
            # We'll set note_id to part['_id'] if present; else user must supply id
            # For simplified extraction, we assume note id is provided in part['id']
            # However, in our earlier code we didn't store id; thus we will attach the note id externally
            raise RuntimeError('simplify_parts expects note_id to be provided')
        else:
            # Unknown style: treat as plain
            simplified_parts.append(part.get('text', ''))
    return simplified_parts, footnote_ids, liturgy_ids


def extract_verses_simplified(html: str, footnotes: Dict[str, str], current_book: str,
                              cross_ref_map: Dict[Tuple[Any, ...], str], cross_refs: Dict[str, Any],
                              footnote_map: Dict[str, Any], liturgy_map: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract verses and produce simplified verse objects.

    This function reuses logic from extract_verses but outputs simplified parts
    and collects cross reference IDs. Footnote and liturgy notes are
    referenced by their IDs.
    """
    from extract_osb_enhanced import extract_verses  # reuse existing extractor for detailed parts
    detailed_verses = extract_verses(html, footnotes, current_book)
    simplified_verses: List[Dict[str, Any]] = []
    for dv in detailed_verses:
        verse_num = dv['verse']
        detailed_parts = dv['parts']
        # Build plain text for search: concatenate all part texts, ignoring footnote markers (we exclude footnote markers entirely)
        plain_text_parts = []
        for p in detailed_parts:
            if p['style'] in ('NONE', 'ITALIC', 'CROSS_REF'):
                plain_text_parts.append(p['text'])
            # footnotes and liturgy notes markers do not contribute to plain text
        plain_text = ''.join(plain_text_parts)
        # Build simplified parts: We'll flatten italics and cross refs, but not footnotes/liturgy notes yet
        simplified_parts: List[Any] = []
        footnote_ids: List[str] = []
        liturgy_ids: List[str] = []
        for p in detailed_parts:
            s = p['style']
            if s == 'NONE':
                simplified_parts.append(p['text'])
            elif s == 'ITALIC':
                simplified_parts.append({'italic': p['text']})
            elif s == 'CROSS_REF':
                # Normalise cross ref
                target = p['target']
                key_items = []
                for k in sorted(target.keys()):
                    key_items.append((k, target[k]))
                key = tuple(key_items)
                cross_id = cross_ref_map.get(key)
                if not cross_id:
                    cross_id = f"r{len(cross_ref_map) + 1}"
                    cross_ref_map[key] = cross_id
                    cross_refs[cross_id] = target
                simplified_parts.append({'text': p['text'], 'cross_ref': cross_id})
            elif s in ('FOOTNOTE', 'LITURGY_NOTE'):
                # Determine note ID. We need a unique ID for footnote or liturgy note. We'll extract from the note text header
                # In extract_osb_enhanced, the note text includes a prefix like '1:2   ...'; the id is derived from the verse; but we need actual footnote id
                # Instead of deriving here, we'll rely on anchor's ID: We need to fetch note id from part
                # We cannot get note id because our detailed part does not include id; we will attach in extract_verses using part['note_id']
                raise RuntimeError('extract_verses_simplified expects note_id in detailed parts')
        simplified_verses.append({
            'num': verse_num,
            'text': plain_text,
            'parts': simplified_parts,
            # footnote_ids and liturgy_ids will be filled later once we have note_id in detailed parts
        })
    return simplified_verses


def main():
    parser = argparse.ArgumentParser(description='Simplified OSB extractor with flattened verses and normalised notes and cross refs.')
    parser.add_argument('--input', '-i', required=True, help='Path to input EPUB file')
    parser.add_argument('--output', '-o', required=True, help='Path to output JSON file')
    args = parser.parse_args()
    epub_path = args.input
    out_path = args.output
    with zipfile.ZipFile(epub_path) as zipf:
        toc_content = zipf.read('OEBPS/toc.ncx').decode('utf-8')
        book_order = parse_nav_map(toc_content)
        footnotes = build_footnote_dict(zipf)
        grouped = group_book_files(zipf, book_order)
        books: List[Dict[str, Any]] = []
        # Global note dictionaries and cross ref dictionary
        footnotes_global: Dict[str, Any] = {}
        liturgy_global: Dict[str, Any] = {}
        cross_refs_global: Dict[str, Any] = {}
        cross_ref_map: Dict[Tuple[Any, ...], str] = {}
        for book_name, files in grouped:
            combined_html = ''
            for fname in files:
                combined_html += zipf.read(fname).decode('utf-8')
            # Skip if no verse anchors
            if not re.search(r'<sup id="[A-Za-z0-9_]+_vchap\d+-\d+"', combined_html):
                continue
            book_info = extract_book_info(combined_html)
            headers = collect_section_headers(combined_html)
            # Detailed verse extraction
            from extract_osb_enhanced import extract_verses
            detailed_verses = extract_verses(combined_html, footnotes, book_name)
            # Build simplified verses and collect notes
            simplified_verses: List[Dict[str, Any]] = []
            for dv in detailed_verses:
                num = dv['verse']
                parts = dv['parts']
                # Build plain text
                plain_text_parts = []
                footnote_ids_for_verse: List[str] = []
                liturgy_ids_for_verse: List[str] = []
                simplified_parts: List[Any] = []
                for p in parts:
                    s = p['style']
                    if s == 'NONE':
                        plain_text_parts.append(p['text'])
                        simplified_parts.append(p['text'])
                    elif s == 'ITALIC':
                        plain_text_parts.append(p['text'])
                        simplified_parts.append({'italic': p['text']})
                    elif s == 'CROSS_REF':
                        plain_text_parts.append(p['text'])
                        target = p['target']
                        key = tuple(sorted(target.items()))
                        cid = cross_ref_map.get(key)
                        if not cid:
                            cid = f"r{len(cross_ref_map) + 1}"
                            cross_ref_map[key] = cid
                            cross_refs_global[cid] = target
                        simplified_parts.append({'text': p['text'], 'cross_ref': cid})
                    elif s in ('FOOTNOTE', 'LITURGY_NOTE'):
                        # Determine note id: note text begins with something like '1:2...' but the id is not included; derive from the original footnote dictionary key
                        # We can find the note id by looking up in footnotes dict for a match to note_text
                        note_text = p['text']
                        # We'll compute a key from the first 20 characters of the note text
                        note_key = note_text[:40]
                        # Try to find the id in footnotes dict that matches this text
                        note_id_candidate = None
                        for fid, ftext in footnotes.items():
                            if ftext.startswith(note_text[:30]):
                                note_id_candidate = fid
                                break
                        if not note_id_candidate:
                            # Create a synthetic ID if not found
                            note_id_candidate = f"auto_{len(footnotes_global) + len(liturgy_global) + 1}"
                        # Determine destination map (footnotes_global or liturgy_global)
                        if s == 'FOOTNOTE':
                            footnote_ids_for_verse.append(note_id_candidate)
                            if note_id_candidate not in footnotes_global:
                                # Build note parts for the note text
                                note_parts = parse_note_text_simple(note_text, book_name)
                                # Convert cross_target to cross_ref ids
                                sparts = []
                                for np in note_parts:
                                    if isinstance(np, str):
                                        sparts.append(np)
                                    else:
                                        # cross_target
                                        target = np['cross_target']
                                        key = tuple(sorted(target.items()))
                                        cid2 = cross_ref_map.get(key)
                                        if not cid2:
                                            cid2 = f"r{len(cross_ref_map) + 1}"
                                            cross_ref_map[key] = cid2
                                            cross_refs_global[cid2] = target
                                        sparts.append({'text': np['text'], 'cross_ref': cid2})
                                footnotes_global[note_id_candidate] = {
                                    'text': note_text,
                                    'parts': sparts
                                }
                            simplified_parts.append({'footnote': note_id_candidate})
                        else:
                            # Liturgy note
                            liturgy_ids_for_verse.append(note_id_candidate)
                            if note_id_candidate not in liturgy_global:
                                note_parts = parse_note_text_simple(note_text, book_name)
                                sparts = []
                                for np in note_parts:
                                    if isinstance(np, str):
                                        sparts.append(np)
                                    else:
                                        target = np['cross_target']
                                        key = tuple(sorted(target.items()))
                                        cid2 = cross_ref_map.get(key)
                                        if not cid2:
                                            cid2 = f"r{len(cross_ref_map) + 1}"
                                            cross_ref_map[key] = cid2
                                            cross_refs_global[cid2] = target
                                        sparts.append({'text': np['text'], 'cross_ref': cid2})
                                liturgy_global[note_id_candidate] = {
                                    'text': note_text,
                                    'parts': sparts
                                }
                            simplified_parts.append({'liturgy': note_id_candidate})
                plain_text = ''.join(plain_text_parts)
                simplified_verses.append({
                    'num': num,
                    'text': plain_text,
                    'parts': simplified_parts,
                    # Optionally include lists of note ids for quick lookup
                    'footnotes': footnote_ids_for_verse if footnote_ids_for_verse else None,
                    'liturgy_notes': liturgy_ids_for_verse if liturgy_ids_for_verse else None
                })

            # Group simplified verses by chapter using the original detailed structure
            chapters_map: Dict[int, Dict[str, Any]] = {}
            # We zip simplified_verses with detailed_verses assuming they are in the same order
            for sv, dv in zip(simplified_verses, detailed_verses):
                chap_num = dv['chapter']
                if chap_num not in chapters_map:
                    chapters_map[chap_num] = {
                        'chapter_num': chap_num,
                        'verses_count': 0,
                        'verses': [],
                        'headers': [],
                        'paragraphs_list': []  # to be filled later
                    }
                chapters_map[chap_num]['verses'].append(sv)
                chapters_map[chap_num]['verses_count'] = max(chapters_map[chap_num]['verses_count'], sv['num'])
            # Assign headers to chapters: for each header, find the first verse after its offset
            headers_by_chap: Dict[int, List[str]] = defaultdict(list)
            for pos, text in headers:
                # Find the first detailed verse after this header
                assigned = False
                for sv, dv in zip(simplified_verses, detailed_verses):
                    if dv['offset'] > pos:
                        headers_by_chap[dv['chapter']].append(text)
                        assigned = True
                        break
                if not assigned:
                    # If header after last verse, assign to last chapter
                    if detailed_verses:
                        headers_by_chap[detailed_verses[-1]['chapter']].append(text)
            # Fill headers in chapters_map
            for chap_num, hdrs in headers_by_chap.items():
                chapters_map[chap_num]['headers'] = hdrs
            # Use original assemble_book to get paragraphs_list for each chapter
            from extract_osb_enhanced import assemble_book
            tmp_book = assemble_book(book_name, book_info, detailed_verses, headers)
            for chap in tmp_book['chapters_list']:
                cnum = chap['chapter_num']
                if cnum in chapters_map:
                    chapters_map[cnum]['paragraphs_list'] = chap['paragraphs_list']
            # Sort chapters
            chapters_list = [chapters_map[c] for c in sorted(chapters_map.keys())]

            # Parse commentary (lessons) outside verse paragraphs
            # We will identify paragraphs with classes tx, tx1, ext, ct and group them under the latest sub1 heading
            lessons: List[Dict[str, Any]] = []
            current_title: Any = None
            current_entries: List[Dict[str, Any]] = []
            soup_book = BeautifulSoup(combined_html, 'html.parser')
            for p in soup_book.find_all('p'):
                cls = p.get('class', [])
                # Determine heading
                if 'sub1' in cls or 'ct' in cls:
                    # flush previous lesson if exists
                    if current_entries:
                        lessons.append({'title': current_title or '', 'entries': current_entries})
                        current_entries = []
                    # Set new title
                    title_text = p.get_text().strip()
                    # Normalise whitespace
                    title_text = ' '.join(title_text.split())
                    current_title = title_text
                elif any(c in {'tx', 'tx1', 'ext', 'tx2'} for c in cls):
                    # commentary entry
                    parts = parse_commentary_parts(p, book_name, cross_ref_map, cross_refs_global)
                    current_entries.append({'parts': parts})
            # Append last lesson
            if current_entries:
                lessons.append({'title': current_title or '', 'entries': current_entries})

            # ---- Filter commentary titles from verses and headers ----
            # Build a set of normalised lesson titles to aid removal from verses and headers
            lesson_title_norms: set = set()
            for lesson in lessons:
                title = lesson.get('title', '')
                if not title:
                    continue
                norm = ''.join(title.split()).upper()
                lesson_title_norms.add(norm)
            # Filter out commentary titles from verses
            if lesson_title_norms:
                for chap in chapters_list:
                    for verse in chap['verses']:
                        new_parts: List[Any] = []
                        removed_any = False
                        for part in verse['parts']:
                            remove = False
                            if isinstance(part, str):
                                # Normalise candidate and check against lesson titles
                                text_norm = ''.join(part.split()).upper()
                                for lt in lesson_title_norms:
                                    if text_norm == lt or lt in text_norm or text_norm in lt:
                                        remove = True
                                        break
                            if not remove:
                                new_parts.append(part)
                            else:
                                removed_any = True
                        if removed_any:
                            # Recompute plain text from remaining parts
                            plain = ''
                            for p2 in new_parts:
                                if isinstance(p2, str):
                                    plain += p2
                                elif isinstance(p2, dict):
                                    if 'italic' in p2:
                                        plain += p2['italic']
                                    elif 'text' in p2:
                                        plain += p2['text']
                            verse['parts'] = new_parts
                            verse['text'] = plain
                # Also filter headers in chapters
                for chap in chapters_list:
                    filtered_hdrs = []
                    for hdr in chap['headers']:
                        hdr_norm = ''.join(hdr.split()).upper()
                        keep = True
                        for lt in lesson_title_norms:
                            if hdr_norm == lt or lt in hdr_norm or hdr_norm in lt:
                                keep = False
                                break
                        if keep:
                            filtered_hdrs.append(hdr)
                    chap['headers'] = filtered_hdrs

            # Now append book entry
            books.append({
                'en_name': book_name,
                'local_name': book_name,
                'ch_count': len(chapters_list),
                'metadata': book_info,
                # simplified chapters array
                'chapters': chapters_list,
                # include the full paragraphs_list for backwards compatibility
                'chapters_list': tmp_book['chapters_list'],
                # include commentary lessons if any
                'lessons': lessons if lessons else None,
            })

        # Build final output. Include global footnotes, liturgy notes and cross references.
        output_data = {
            'version': 'OSB',
            'lang': 'English',
            'books': books,
            'footnotes': footnotes_global,
            'liturgy_notes': liturgy_global,
            'cross_refs': cross_refs_global,
        }
        # Write output JSON
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"Wrote simplified OSB JSON to {out_path}")


if __name__ == '__main__':
    main()
