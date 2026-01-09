// Paper data (ID is managed separately by the collection)
export interface Paper {
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  preview?: string;
}

// Item wrapper from useCollection
export interface PaperItem {
  id: string;
  data: Paper;
}

export interface PapersState {
  papers: PaperItem[];
  currentPaperId: string | null;
}
