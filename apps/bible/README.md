# Orthodox Study Bible App

A complete Bible reading app built with Lynx.js, featuring the Orthodox Study Bible (OSB) translation with study notes, liturgical notes, and cross-references.

## Features

- **📖 Complete Bible Text**: Full Orthodox Study Bible with Old and New Testaments
- **📝 Study Notes**: Expandable footnotes and liturgical notes
- **🔗 Cross References**: Clickable verse references that navigate between passages
- **🔍 Search**: Full-text search across all books and verses
- **📱 Responsive Navigation**: Easy navigation between books, chapters, and verses
- **🎨 Beautiful UI**: Clean, readable interface using Tailwind CSS and custom components

## Architecture

### Components

- **BookList** (`src/components/BookList.tsx`): Displays all 66 books grouped by testament
- **ChapterList** (`src/components/ChapterList.tsx`): Shows all chapters in a book with verse counts
- **VerseReader** (`src/components/VerseReader.tsx`): Main reading view with verses, notes, and navigation
- **SearchView** (`src/components/SearchView.tsx`): Search interface with results
- **VersePart** (`src/components/VersePart.tsx`): Renders individual verse parts with proper styling

### State Management

- **Zustand Store** (`src/store/bible-store.ts`): Manages app state including:
  - Bible data
  - Current view mode (books/chapters/reader/search)
  - Navigation state
  - Search functionality

### Services

- **Bible Service** (`src/services/bible-service.ts`): Handles data loading and search operations

### Data Structure

The app uses `src/data/bible_osb.json` which contains:
- Version and language metadata
- 66 books with:
  - Book information (author, date, theme, etc.)
  - Chapters with verses
  - Section headers
  - Footnotes and liturgical notes
  - Cross-references with precise targets

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Scan the QRCode in the terminal with your LynxExplorer App to see the result.

Build for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

## Navigation Flow

1. **Books View**: Select a book from Old or New Testament
2. **Chapters View**: Choose a chapter from the selected book
3. **Reader View**: Read verses with expandable notes and cross-references
4. **Search View**: Search for any text across the entire Bible

## Technologies

- **Lynx.js**: Cross-platform UI framework
- **React**: Component library
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety

## Data Extraction

Bible data is extracted from `data/The Orthodox Study Bible.epub` using:

```bash
python src/scripts/extract_osb.py
```

This generates the structured JSON file used by the app.
