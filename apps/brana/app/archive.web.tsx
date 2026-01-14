import '../global.web.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { loadPapers, saveCurrentPaperId, generateTitle } from '../utils/storage';
import type { PaperItem } from '../types/paper';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const paperDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (paperDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (paperDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: paperDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

function groupPapersByDate(papers: PaperItem[]): Record<string, PaperItem[]> {
  const groups: Record<string, PaperItem[]> = {};
  const sortedPapers = [...papers].sort((a, b) => b.data.updatedAt - a.data.updatedAt);

  for (const paper of sortedPapers) {
    const dateKey = formatDate(paper.data.updatedAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(paper);
  }

  return groups;
}

export default function ArchiveWebPage() {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadPapers().then(setPapers);
  }, []);

  const groupedPapers = useMemo(() => groupPapersByDate(papers), [papers]);
  const dateGroups = Object.keys(groupedPapers);

  const handlePaperPress = useCallback(async (paperId: string) => {
    await saveCurrentPaperId(paperId);
    router.replace('/');
  }, [router]);

  return (
    <div className="archive-container">
      <header className="archive-header">
        <button
          className="archive-back-button"
          onClick={() => router.replace('/')}
          aria-label="Back to editor"
        >
          <i className="fa-solid fa-arrow-left" />
        </button>
        <h1 className="archive-title">Archive</h1>
      </header>

      <main className="archive-content">
        {papers.length === 0 ? (
          <div className="archive-empty">
            <i className="fa-solid fa-box-archive" style={{ fontSize: 32 }} />
            <p>No papers yet</p>
          </div>
        ) : (
          dateGroups.map((dateKey) => (
            <section key={dateKey} className="archive-group">
              <h2 className="archive-date">{dateKey}</h2>
              {groupedPapers[dateKey].map((paper) => (
                <button
                  key={paper.id}
                  className="archive-item"
                  onClick={() => handlePaperPress(paper.id)}
                >
                  <span className="archive-item-title">
                    {paper.data.content ? generateTitle(paper.data.content) : 'Untitled'}
                  </span>
                  {paper.data.content && (
                    <div
                      className="archive-item-preview"
                      dangerouslySetInnerHTML={{
                        __html: paper.data.content
                      }}
                    />
                  )}
                </button>
              ))}
            </section>
          ))
        )}
      </main>
    </div>
  );
}
