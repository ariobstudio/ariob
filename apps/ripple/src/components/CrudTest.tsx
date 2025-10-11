/**
 * CrudTest Component
 *
 * Demonstrates CRUD operations with FRP streams
 * - Create thing
 * - List things using map() operator
 * - Update thing
 * - Delete thing
 */

import { useState, useEffect, useMemo } from 'react';
import { createThingStore, useThing, map, useStream, put, remove, stream, once } from '@ariob/core';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ariob/ui';
import { Button } from '@ariob/ui';
import { Column, Row, Text } from '@ariob/ui';
import { Input } from '@ariob/ui';
import { TextArea } from '@ariob/ui';

// Define a simple Note type (avoiding Zod to prevent type instantiation issues)
interface Note {
  id: string;
  soul: string;
  schema: string;
  createdAt: number;
  updatedAt?: number;
  public: boolean;
  createdBy?: string;
  title: string;
  content?: string;
}

// Create a simple note service without Zod (for testing purposes)
const createNoteService = () => {
  const generateId = () => Math.random().toString(36).substring(2, 15);

  return {
    async create(data: { title: string; content?: string }) {
      const id = generateId();
      const note: Note = {
        id,
        soul: `notes/${id}`,
        schema: 'note',
        createdAt: Date.now(),
        public: true,
        ...data,
      };

      return new Promise<{ ok: boolean; data?: Note; error?: string }>((resolve) => {
        put(`notes/${id}`, note).subscribe({
          next: (result) => {
            if (result.ok) {
              resolve({ ok: true, data: note });
            } else {
              resolve({ ok: false, error: result.err });
            }
          },
        });
      });
    },

    async update(id: string, updates: Partial<Note>) {
      const current = await once<Note>(`notes/${id}`);
      if (!current) {
        return { ok: false, error: 'Note not found' };
      }

      const updated: Note = {
        ...current,
        ...updates,
        updatedAt: Date.now(),
      };

      return new Promise<{ ok: boolean; data?: Note; error?: string }>((resolve) => {
        put(`notes/${id}`, updated).subscribe({
          next: (result) => {
            if (result.ok) {
              resolve({ ok: true, data: updated });
            } else {
              resolve({ ok: false, error: result.err });
            }
          },
        });
      });
    },

    async remove(id: string) {
      return new Promise<{ ok: boolean; error?: string }>((resolve) => {
        remove(`notes/${id}`).subscribe({
          next: (result) => {
            resolve(result);
          },
        });
      });
    },
  };
};

const noteService = createNoteService();

export function CrudTest() {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stream for listing notes using map() operator
  const notesStream = useMemo(
    () => map<Note>('notes'),
    []
  );

  // Subscribe to notes stream
  useEffect(() => {
    const subscription = notesStream.subscribe({
      next: ({ key, value }) => {
        setNotes(prev => {
          const existing = prev.findIndex(n => n.id === value.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = value;
            return updated;
          }
          return [...prev, value];
        });
      },
      error: (err) => {
        console.error('Stream error:', err);
        setError(err.message);
      }
    });

    return () => subscription.unsubscribe();
  }, [notesStream]);

  // Handle create
  const handleCreate = async () => {
    if (!title) return;

    setLoading(true);
    setError(null);

    const result = await noteService.create({
      title,
      content: content || undefined,
    });

    setLoading(false);

    if (result.ok) {
      console.log('Note created:', result.data);
      setTitle('');
      setContent('');
    } else {
      console.error('Create failed:', result.error);
      setError(result.error || 'Failed to create note');
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedNoteId || !title) return;

    setLoading(true);
    setError(null);

    const result = await noteService.update(selectedNoteId, {
      title,
      content: content || undefined,
    });

    setLoading(false);

    if (result.ok) {
      console.log('Note updated:', result.data);
      setEditMode(false);
      setTitle('');
      setContent('');
      setSelectedNoteId(null);
    } else {
      console.error('Update failed:', result.error);
      setError(result.error || 'Failed to update note');
    }
  };

  // Handle delete
  const handleDelete = async (noteId: string) => {
    setLoading(true);
    setError(null);

    const result = await noteService.remove(noteId);

    setLoading(false);

    if (result.ok) {
      console.log('Note deleted');
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
        setEditMode(false);
      }
    } else {
      console.error('Delete failed:', result.error);
      setError(result.error || 'Failed to delete note');
    }
  };

  // Handle edit
  const handleEdit = (note: Note) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content || '');
    setEditMode(true);
  };

  // Cancel edit
  const handleCancel = () => {
    setSelectedNoteId(null);
    setEditMode(false);
    setTitle('');
    setContent('');
  };

  return (
    <Column spacing="md" className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>CRUD Test</CardTitle>
          <CardDescription>
            Testing create, read, update, and delete operations
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Card>
          <CardContent>
            <Text variant="destructive">Error: {error}</Text>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{editMode ? 'Update Note' : 'Create Note'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Column spacing="sm">
            <Column spacing="xs">
              <Text size="sm">Title</Text>
              <Input
                value={title}
                onChange={setTitle}
                placeholder="Enter note title"
              />
            </Column>

            <Column spacing="xs">
              <Text size="sm">Content</Text>
              <TextArea
                value={content}
                onChange={setContent}
                placeholder="Enter note content"
              />
            </Column>

            <Row spacing="sm" width="full">
              <Button
                onClick={editMode ? handleUpdate : handleCreate}
                className="flex-1"
              >
                {editMode ? 'Update' : 'Create'}
              </Button>
              {editMode && (
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </Row>
          </Column>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes List (using map() stream)</CardTitle>
          <CardDescription>
            Real-time list using FRP map() operator
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Text variant="muted">Loading notes...</Text>
          ) : notes.length === 0 ? (
            <Text variant="muted">No notes yet. Create one above!</Text>
          ) : (
            <Column spacing="sm">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent>
                    <Column spacing="xs">
                      <Row spacing="xs" className="justify-between items-start">
                        <Column spacing="xs" className="flex-1">
                          <Text weight="semibold">{note.title}</Text>
                          {note.content && (
                            <Text variant="muted" size="sm">
                              {note.content}
                            </Text>
                          )}
                          <Text variant="muted" size="xs">
                            Created: {new Date(note.createdAt).toLocaleString()}
                          </Text>
                        </Column>
                        <Row spacing="xs">
                          <Button
                            onClick={() => handleEdit(note)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(note.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </Row>
                      </Row>
                    </Column>
                  </CardContent>
                </Card>
              ))}
            </Column>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <Column spacing="xs">
            <Text variant="muted" size="sm">
              • Uses map() operator for real-time list streaming
            </Text>
            <Text variant="muted" size="sm">
              • useThing hook for individual note operations
            </Text>
            <Text variant="muted" size="sm">
              • Creates notes with title and content
            </Text>
            <Text variant="muted" size="sm">
              • Updates and deletes in real-time
            </Text>
          </Column>
        </CardContent>
      </Card>
    </Column>
  );
}
