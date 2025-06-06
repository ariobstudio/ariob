import React, { useEffect } from 'react';
import { useThing } from '@ariob/core';
import { useNotesStore } from '../services/note.service';
import type { Note } from '../schema/note.schema';

/**
 * Note List Component
 * 
 * Displays a list of notes with real-time updates
 */
export const NoteList: React.FC = () => {
  const { items, isLoading, error, fetchAll } = useNotesStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (isLoading) {
    return (
      <view className="flex-1 justify-center items-center">
        <text className="text-gray-500">Loading notes...</text>
      </view>
    );
  }

  if (error) {
    return (
      <view className="flex-1 justify-center items-center">
        <text className="text-red-500">Error: {error.message}</text>
      </view>
    );
  }

  return (
    <view className="flex-1 p-4">
      <text className="text-2xl font-bold mb-4">My Notes</text>
      
      {items.length === 0 ? (
        <view className="text-center py-8">
          <text className="text-gray-500">No notes yet. Create your first note!</text>
        </view>
      ) : (
        <view className="space-y-2">
          {items.map((note) => (
            <NoteItem key={note.id} noteId={note.id} />
          ))}
        </view>
      )}
    </view>
  );
};

/**
 * Note Item Component
 * 
 * Individual note with real-time updates
 */
const NoteItem: React.FC<{ noteId: string }> = ({ noteId }) => {
  const { item: note, update, remove } = useThing(useNotesStore, noteId);

  if (!note) return null;

  // Type assertion to ensure we have the full Note type
  const typedNote = note as Note;

  const handleTogglePin = () => {
    update({ pinned: !typedNote.pinned });
  };

  const handleDelete = () => {
    remove();
  };

  return (
    <view 
      className={`p-4 rounded-lg shadow-sm ${
        typedNote.pinned ? 'bg-yellow-50' : 'bg-white'
      }`}
      style={{ backgroundColor: typedNote.color || undefined }}
    >
      <view className="flex-row justify-between items-start">
        <view className="flex-1">
          {typedNote.title && (
            <text className="text-lg font-semibold mb-1">{typedNote.title}</text>
          )}
          {typedNote.body && (
            <text className="text-gray-700">{typedNote.body}</text>
          )}
          {typedNote.tags && typedNote.tags.length > 0 && (
            <view className="flex-row mt-2 space-x-1">
              {typedNote.tags.map((tag, index) => (
                <view key={index} className="bg-gray-200 px-2 py-1 rounded">
                  <text className="text-xs text-gray-600">#{tag}</text>
                </view>
              ))}
            </view>
          )}
        </view>
        
        <view className="flex-row space-x-2">
          <view 
            bindtap={handleTogglePin}
            className="p-2"
          >
            <text>{typedNote.pinned ? '📌' : '📍'}</text>
          </view>
          <view 
            bindtap={handleDelete}
            className="p-2"
          >
            <text>🗑️</text>
          </view>
        </view>
      </view>
      
      <text className="text-xs text-gray-500 mt-2">
        Updated: {new Date(typedNote.updatedAt || typedNote.createdAt).toLocaleString()}
      </text>
    </view>
  );
}; 