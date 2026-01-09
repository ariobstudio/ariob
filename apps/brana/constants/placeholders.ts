export const editorPlaceholders = [
  "What's on your mind?",
  "Start writing...",
  "Capture your thoughts...",
  "Write something amazing...",
  "Let your ideas flow...",
  "Begin your story...",
  "What are you thinking about?",
  "Jot down your ideas...",
  "Express yourself...",
  "Start creating...",
] as const;

export function getRandomPlaceholder(): string {
  return editorPlaceholders[Math.floor(Math.random() * editorPlaceholders.length)];
}
