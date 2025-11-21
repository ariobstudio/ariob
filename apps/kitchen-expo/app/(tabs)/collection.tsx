import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TestLogger, useTestLogger } from '@/components/test-logger';
import {
  collection,
  useCollection,
  createCollection,
  lex,
  z,
} from '@ariob/core';

// Define a test schema for collection items
// Note: Gun doesn't support arrays, only objects with scalar values
const ItemSchema = z.object({
  name: z.string(),
  value: z.number(),
  category: z.string().optional(), // Changed from tags array to single category
});

type ItemData = z.infer<typeof ItemSchema>;

/**
 * COLLECTION TEST SUITE
 *
 * Tests @ariob/core collection management (sets/maps):
 *   - collection.add(path, item, id?, schema?) - Add item to collection
 *   - collection.get(path, schema?) - Get all items
 *   - collection.update(path, id, updates) - Update specific item
 *   - collection.remove(path, id) - Remove item from collection
 *   - useCollection(config) - React hook for reactive collections
 *
 * Hook returns:
 *   { items, count, isEmpty, isLoading, isError, add, update, remove }
 *
 * Features tested:
 *   - Automatic ID generation
 *   - Lex ordering (chronological/reverse)
 *   - Zod schema validation
 *   - Result monad error handling
 *   - Reactive subscriptions
 *   - Sorting and filtering
 */
export default function CollectionTestScreen() {
  const logger = useTestLogger();
  const [collectionPath, setCollectionPath] = useState('test/collection');
  const [itemName, setItemName] = useState('Test Item');
  const [itemValue, setItemValue] = useState('100');

  // Use the reactive hook with new API
  const testCollection = useCollection<ItemData>({
    path: collectionPath,
    schema: ItemSchema,
  });

  React.useEffect(() => {
    logger.info('Collection Test Screen mounted');
    logger.info('useCollection hook initialized', { path: collectionPath });
  }, []);

  // Watch for collection items changes
  React.useEffect(() => {
    if (testCollection.items && testCollection.items.length > 0) {
      logger.success('Collection items updated via hook', {
        count: testCollection.count,
        isEmpty: testCollection.isEmpty,
      });
    }
  }, [testCollection.items]);

  /**
   * TEST: collection.add()
   * Method: @ariob/core/collection - collection.add(path, item, id?, schema?)
   * Purpose: Add item to Gun set/collection
   * Returns: Promise<Result<id, Error>> - Auto-generated or provided ID
   * ID: Optional custom ID, or auto-generated with lex.chrono()
   * Validation: Optional Zod schema validation before adding
   * Use Case: Lists, feeds, sets of related items
   */
  const testCollectionAdd = async () => {
    try {
      logger.info('➕ Testing collection.add() - Add item to collection');
      logger.info('Method: collection.add(path, item, id?, schema?) → Promise<Result<id, Error>>');

      const item: ItemData = {
        name: itemName,
        value: parseInt(itemValue) || 0,
        category: 'test',
      };

      logger.info('Adding item to collection', { path: collectionPath, item });

      // Use automatic ID generation (chronological)
      const result = await collection.add(collectionPath, item, undefined, ItemSchema);

      if (result.ok) {
        logger.success('Item added to collection!', { id: result.value, item });
      } else {
        logger.error('collection.add() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('collection.add() error', error.message);
    }
  };

  /**
   * TEST: collection.add() with lex
   * Feature: @ariob/core/lex - Lexical ordering utilities
   * Methods:
   *   - lex.chrono() - Chronological order (oldest first)
   *   - lex.reverse() - Reverse chronological (newest first)
   * Purpose: Sortable IDs for ordered collections
   * Use Case: Chat messages, activity feeds, timelines
   */
  const testCollectionAddWithLex = async () => {
    try {
      logger.info('➕🔢 Testing collection.add() with lex - Sorted IDs');
      logger.info('Feature: lex.reverse() → newest-first ordering');

      const item: ItemData = {
        name: `${itemName} (Reverse Time)`,
        value: parseInt(itemValue) || 0,
        category: 'lex-ordered',
      };

      // Use lex.reverse() for newest-first ordering
      const customId = lex.reverse();

      logger.info('Adding item with lex.reverse() ID', { id: customId, item });

      const result = await collection.add(collectionPath, item, customId, ItemSchema);

      if (result.ok) {
        logger.success('Item added with lex ID!', { id: result.value, item });
      } else {
        logger.error('collection.add() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('collection.add() with lex error', error.message);
    }
  };

  const testCollectionList = async () => {
    try {
      logger.info('📋 Testing collection.list() - Get all items');

      logger.info('Getting all items from collection', { path: collectionPath });

      const items = await collection.list<ItemData>(collectionPath, ItemSchema);

      if (items && items.length > 0) {
        logger.success('Items retrieved from collection!', {
          count: items.length,
          items,
        });
      } else {
        logger.warn('No items found in collection', { path: collectionPath });
      }

    } catch (error: any) {
      logger.error('collection.list() failed', error.message);
    }
  };

  const testCollectionUpdate = async () => {
    try {
      logger.info('🔄 Testing collection.update() - Update item');

      // First, get an item ID from the collection
      const items = await collection.list<ItemData>(collectionPath, ItemSchema);

      if (!items || items.length === 0) {
        logger.warn('No items to update. Add items first.');
        return;
      }

      const itemToUpdate = items[0];
      const updates = {
        name: itemToUpdate.data.name + ' (Updated)',
        value: itemToUpdate.data.value + 10,
      };

      logger.info('Updating item in collection', { id: itemToUpdate.id, updates });

      const result = await collection.update(collectionPath, itemToUpdate.id, updates, ItemSchema);

      if (result.ok) {
        logger.success('Item updated successfully!', updates);
      } else {
        logger.error('collection.update() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('collection.update() error', error.message);
    }
  };

  const testCollectionRemove = async () => {
    try {
      logger.info('🗑️ Testing collection.remove() - Remove item');

      // Get first item to remove
      const items = await collection.list<ItemData>(collectionPath, ItemSchema);

      if (!items || items.length === 0) {
        logger.warn('No items to remove');
        return;
      }

      const itemToRemove = items[0];

      logger.info('Removing item from collection', { id: itemToRemove.id });

      const result = await collection.remove(collectionPath, itemToRemove.id);

      if (result.ok) {
        logger.success('Item removed from collection!', { id: itemToRemove.id });
      } else {
        logger.error('collection.remove() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('collection.remove() error', error.message);
    }
  };

  const testCollectionClear = async () => {
    try {
      logger.info('🧹 Testing collection.clear() - Clear all items');

      logger.info('Clearing collection', { path: collectionPath });

      const result = await collection.clear(collectionPath);

      if (result.ok) {
        logger.success('Collection cleared successfully!');
      } else {
        logger.error('collection.clear() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('collection.clear() error', error.message);
    }
  };

  const testCreateCollection = async () => {
    try {
      logger.info('🆕 Testing createCollection() - Factory function');

      const customPath = 'custom/collection/' + Date.now();

      logger.info('Creating collection factory', { path: customPath });

      // createCollection returns a hook, so we test imperative API instead
      const testData: ItemData = {
        name: 'Created via imperative API',
        value: 999,
        category: 'factory',
      };

      const result = await collection.add(customPath, testData, undefined, ItemSchema);
      if (result.ok) {
        logger.success('Data added via imperative API', { id: result.value });
      } else {
        logger.error('Failed to add data', result.error?.message);
        return;
      }

      // Read it back
      const items = await collection.list<ItemData>(customPath, ItemSchema);
      if (items && items.length > 0) {
        logger.success('Data read back successfully', { count: items.length, items });
      }

    } catch (error: any) {
      logger.error('createCollection() test failed', error.message);
    }
  };

  const testUseCollectionHook = () => {
    try {
      logger.info('🪝 Testing useCollection() hook - Reactive data');

      logger.info('Current hook state', {
        hasItems: !testCollection.isEmpty,
        count: testCollection.count,
        isLoading: testCollection.isLoading,
        isError: testCollection.isError,
        isSynced: testCollection.isSynced,
        isEmpty: testCollection.isEmpty,
      });

      if (testCollection.isError) {
        logger.error('Hook has error', testCollection.error?.message);
      } else if (testCollection.isLoading) {
        logger.info('Hook is loading...');
      } else if (!testCollection.isEmpty) {
        logger.success('Hook has items!', {
          count: testCollection.count,
          sampleItem: testCollection.items[0],
        });
      } else {
        logger.warn('Hook has no items yet. Try adding first.');
      }

      logger.info('Hook methods available', {
        hasAdd: typeof testCollection.add === 'function',
        hasUpdate: typeof testCollection.update === 'function',
        hasRemove: typeof testCollection.remove === 'function',
      });

    } catch (error: any) {
      logger.error('useCollection() hook test failed', error.message);
    }
  };

  const testUseCollectionAdd = async () => {
    try {
      logger.info('➕ Testing useCollection().add() - Add via hook');

      const item: ItemData = {
        name: 'Added via hook',
        value: 888,
        category: 'hook',
      };

      logger.info('Adding item via hook', item);

      // Use lex for ID generation
      const result = await testCollection.add(item, lex.time());

      if (result.ok) {
        logger.success('Item added via hook! Check for reactive update.', { id: result.value });
      } else {
        logger.error('hook.add() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('useCollection().add() error', error.message);
    }
  };

  const testLexUtilities = async () => {
    try {
      logger.info('🔢 Testing lex utilities - Lexical ordering');

      // Test different lex patterns
      const timeId = lex.time();
      const reverseId = lex.reverse();
      const randomId = lex.random('msg');
      const userKey = lex.user('abc123', 'profile');

      logger.success('Lex utilities generated', {
        time: timeId,
        reverse: reverseId,
        random: randomId,
        userKey,
      });

      // Add items with different lex patterns
      logger.info('Adding items with different lex patterns...');

      await collection.add(collectionPath, {
        name: 'Oldest (lex.time)',
        value: 1,
      }, lex.time(), ItemSchema);

      await collection.add(collectionPath, {
        name: 'Newest (lex.reverse)',
        value: 2,
      }, lex.reverse(), ItemSchema);

      await collection.add(collectionPath, {
        name: 'Random (lex.random)',
        value: 3,
      }, lex.random('item'), ItemSchema);

      logger.success('Items added with lex patterns!');

      // List and show order
      const items = await collection.list<ItemData>(collectionPath, ItemSchema, 'asc');
      logger.success('Items in lexical order (asc)', {
        count: items.length,
        ids: items.map(i => i.id),
      });

    } catch (error: any) {
      logger.error('Lex utilities test failed', error.message);
    }
  };

  const testBulkOperations = async () => {
    try {
      logger.info('📦 Testing bulk operations');

      // Add multiple items
      logger.info('Adding 5 items in bulk...');
      for (let i = 1; i <= 5; i++) {
        await collection.add(
          collectionPath,
          {
            name: `Bulk Item ${i}`,
            value: i * 50,
            category: `batch-${Math.floor(i / 3)}`,
          },
          lex.id('bulk', i > 2), // Use reverse time for items > 2
          ItemSchema
        );
      }

      logger.success('Bulk add completed!');

      // Get all and count
      const items = await collection.list<ItemData>(collectionPath, ItemSchema);
      logger.success('Total items in collection', {
        count: items.length,
      });

      // Update some
      logger.info('Updating first 2 items...');
      for (let i = 0; i < Math.min(2, items.length); i++) {
        await collection.update(
          collectionPath,
          items[i].id,
          { value: items[i].data.value * 2 },
          ItemSchema
        );
      }

      logger.success('Bulk update completed!');

    } catch (error: any) {
      logger.error('Bulk operations failed', error.message);
    }
  };

  const runAllTests = async () => {
    logger.info('🧪 Running complete collection test suite...');

    try {
      await testCollectionAdd();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testCollectionAddWithLex();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testCollectionList();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testCollectionUpdate();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testCreateCollection();
      await new Promise(resolve => setTimeout(resolve, 500));

      testUseCollectionHook();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testUseCollectionAdd();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testLexUtilities();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testBulkOperations();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test remove and clear last to avoid affecting other tests
      await testCollectionRemove();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testCollectionClear();

      logger.success('🎉 All collection tests completed!');
    } catch (error: any) {
      logger.error('Test suite error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Collection API Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test collection operations: add, list, update, remove with reactive hooks and lex ordering
        </ThemedText>
      </ThemedView>

      {/* Input Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Test Data</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Collection path (e.g., test/collection)"
          value={collectionPath}
          onChangeText={setCollectionPath}
        />
        <TextInput
          style={styles.input}
          placeholder="Item name"
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={styles.input}
          placeholder="Item value (number)"
          value={itemValue}
          onChangeText={setItemValue}
          keyboardType="numeric"
        />
      </ThemedView>

      {/* Hook State Display */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">useCollection() Hook State</ThemedText>
        <ThemedView style={styles.statusCard}>
          <ThemedText style={styles.statusLabel}>Loading:</ThemedText>
          <ThemedText style={testCollection.isLoading ? styles.statusYes : styles.statusNo}>
            {testCollection.isLoading ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Error:</ThemedText>
          <ThemedText style={testCollection.isError ? styles.statusYes : styles.statusNo}>
            {testCollection.isError ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Synced:</ThemedText>
          <ThemedText style={testCollection.isSynced ? styles.statusYes : styles.statusNo}>
            {testCollection.isSynced ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Empty:</ThemedText>
          <ThemedText style={testCollection.isEmpty ? styles.statusYes : styles.statusNo}>
            {testCollection.isEmpty ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Item Count:</ThemedText>
          <ThemedText style={styles.statusValue}>
            {testCollection.count}
          </ThemedText>
          {testCollection.items && testCollection.items.length > 0 && (
            <>
              <ThemedText style={styles.statusLabel}>Sample Items:</ThemedText>
              <ThemedText style={styles.dataText}>
                {JSON.stringify(testCollection.items.slice(0, 3), null, 2)}
              </ThemedText>
            </>
          )}
        </ThemedView>
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Individual Tests</ThemedText>

        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={testCollectionAdd}>
          <ThemedText style={styles.buttonText}>Test collection.add()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={testCollectionAddWithLex}>
          <ThemedText style={styles.buttonText}>Test add() with lex</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testCollectionList}>
          <ThemedText style={styles.buttonText}>Test collection.list()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testCollectionUpdate}>
          <ThemedText style={styles.buttonText}>Test collection.update()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonDanger]} onPress={testCollectionRemove}>
          <ThemedText style={styles.buttonText}>Test collection.remove()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonDanger]} onPress={testCollectionClear}>
          <ThemedText style={styles.buttonText}>Test collection.clear()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testCreateCollection}>
          <ThemedText style={styles.buttonText}>Test Imperative API</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testUseCollectionHook}>
          <ThemedText style={styles.buttonText}>Inspect useCollection() Hook</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testUseCollectionAdd}>
          <ThemedText style={styles.buttonText}>Test useCollection().add()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testLexUtilities}>
          <ThemedText style={styles.buttonText}>Test Lex Utilities</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testBulkOperations}>
          <ThemedText style={styles.buttonText}>Test Bulk Operations</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSuccess]} onPress={runAllTests}>
          <ThemedText style={styles.buttonText}>Run All Tests</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonOutline]} onPress={logger.clear}>
          <ThemedText style={styles.buttonTextOutline}>Clear Logs</ThemedText>
        </Pressable>
      </ThemedView>

      {/* Logger */}
      <TestLogger logs={logger.logs} maxHeight={500} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  statusCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusYes: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
  },
  statusNo: {
    fontSize: 14,
    color: '#999',
  },
  dataText: {
    fontSize: 11,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    maxHeight: 200,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonInfo: {
    backgroundColor: '#5AC8FA',
  },
  buttonWarning: {
    backgroundColor: '#FF9500',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
