/**
 * CrudTest Component
 *
 * Demonstrates CRUD operations with Gun + Zod validation
 */

import { useState } from 'react';
import { createGraph, useSet, z } from '@ariob/core';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ariob/ui';
import { Button } from '@ariob/ui';
import { Column, Row, Text } from '@ariob/ui';
import { Input } from '@ariob/ui';
import { TextArea } from '@ariob/ui';

// Define Zod schema for runtime validation
const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  createdAt: z.number(),
});

type Note = z.infer<typeof noteSchema>;

// Create graph instance (at app level)
const graph = createGraph({
  peers: ['http://localhost:8765/gun'],
  localStorage: true
});
(globalThis as any).gun = graph;


export function CrudTest() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Use original useSet hook - simple and works!
  const { items, add, remove, isLoading, error } = useSet<Note>(
    graph.get('my-notes')
  );

  // Handle create with Zod validation
  const handleCreate = async () => {
    if (!title) return;

    try {
      const note = {
        title,
        content: content || undefined,
        createdAt: Date.now(),
      };
      console.log('note', note);
      // Validate with Zod before adding
      noteSchema.parse(note);

      console.log('note after validation', note);

      await add(note);
      setTitle('');
      setContent('');
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Validation error:', err.errors);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await remove(id);
  };

  return (
    <Column spacing="md" className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>CRUD Test</CardTitle>
          <CardDescription>
            Simple CRUD with Gun + Zod validation
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Card>
          <CardContent>
            <Text variant="destructive">Error: {error.message}</Text>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create Note</CardTitle>
        </CardHeader>
        <CardContent>
          <Column spacing="sm">
            <Column spacing="xs">
              <Text size="sm">Title *</Text>
              <Input
                value={title}
                onChange={setTitle}
                placeholder="Enter note title"
              />
            </Column>

            <Column spacing="xs">
              <Text size="sm">Content</Text>
              <Input
                value={content}
                onChange={setContent}
                placeholder="Enter note content"
              />
            </Column>

            <Button
              onClick={handleCreate}
              disabled={isLoading || !title}
            >
              Create
            </Button>
          </Column>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes List</CardTitle>
          <CardDescription>
            {items.length} note{items.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && items.length === 0 ? (
            <Text variant="muted">Loading notes...</Text>
          ) : items.length === 0 ? (
            <Text variant="muted">No notes yet. Create one above!</Text>
          ) : (
            <Column spacing="sm">
              {items.map(({ id, data }) => (
                <Card key={id}>
                  <CardContent>
                    <Column spacing="xs">
                      <Row spacing="xs" className="justify-between items-start">
                        <Column spacing="xs" className="flex-1">
                          <Text weight="semibold">{data.title}</Text>
                          {data.content && (
                            <Text variant="muted" size="sm">
                              {data.content}
                            </Text>
                          )}
                          <Text variant="muted" size="xs">
                            {new Date(data.createdAt).toLocaleString()}
                          </Text>
                        </Column>
                        <Button
                          onClick={() => handleDelete(id)}
                          variant="destructive"
                          size="sm"
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
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
              • Simple useSet() hook from @ariob/core
            </Text>
            <Text variant="muted" size="sm">
              • Optional Zod validation before add()
            </Text>
            <Text variant="muted" size="sm">
              • Real-time sync via Gun.js
            </Text>
            <Text variant="muted" size="sm">
              • UNIX philosophy: do one thing well
            </Text>
          </Column>
        </CardContent>
      </Card>
    </Column>
  );
}
