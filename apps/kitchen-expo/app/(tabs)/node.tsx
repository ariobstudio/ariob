import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TestLogger, useTestLogger } from '@/components/test-logger';
import {
  node,
  useNode,
  createNode,
  z,
} from '@ariob/core';

// Define a test schema
const TestSchema = z.object({
  title: z.string(),
  count: z.number(),
  active: z.boolean().optional(),
});

type TestData = z.infer<typeof TestSchema>;

/**
 * NODE TEST SUITE
 *
 * Tests @ariob/core node management:
 *   - node.put(path, data, schema?) - Write data to node
 *   - node.get(path, schema?) - Read data from node
 *   - node.update(path, updates) - Partial update
 *   - node.delete(path) - Delete node
 *   - useNode(config) - React hook for reactive subscriptions
 *
 * Hook returns:
 *   { data, isLoading, isError, isSynced, mutate, update, refetch }
 *
 * Features tested:
 *   - Zod schema validation
 *   - Result monad error handling
 *   - Reactive subscriptions
 *   - Partial updates
 */
export default function NodeTestScreen() {
  const logger = useTestLogger();
  const [nodePath, setNodePath] = useState('test/node');
  const [title, setTitle] = useState('Test Node');
  const [count, setCount] = useState('42');

  // Use the reactive hook with new API
  const testNode = useNode<TestData>({
    path: nodePath,
    schema: TestSchema,
  });

  React.useEffect(() => {
    logger.info('Node Test Screen mounted');
    logger.info('useNode hook initialized', { path: nodePath });
  }, []);

  // Watch for node data changes
  React.useEffect(() => {
    if (testNode.data) {
      logger.success('Node data updated via hook', testNode.data);
    }
  }, [testNode.data]);

  /**
   * TEST: node.put()
   * Method: @ariob/core/node - node.put(path, data, schema?)
   * Purpose: Write complete data object to a Gun node
   * Returns: Promise<Result<void, Error>>
   * Validation: Optional Zod schema validation before writing
   * Use Case: Creating or replacing node data
   */
  const testNodePut = async () => {
    try {
      logger.info('📝 Testing node.put() - Write data to node');
      logger.info('Method: node.put(path, data, schema?) → Promise<Result<void, Error>>');

      const data: TestData = {
        title,
        count: parseInt(count) || 0,
        active: true,
      };

      logger.info('Writing data to node', { path: nodePath, data });

      const result = await node.put(nodePath, data, TestSchema);

      if (result.ok) {
        logger.success('Data written to node successfully!', data);
      } else {
        logger.error('node.put() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('node.put() error', error.message);
    }
  };

  /**
   * TEST: node.get()
   * Method: @ariob/core/node - node.get(path, schema?)
   * Purpose: Read data from a Gun node (one-time read)
   * Returns: Promise<T | null> - Data or null if not found
   * Validation: Optional Zod schema validation after reading
   * Use Case: Fetching static data, checking existence
   */
  const testNodeGet = async () => {
    try {
      logger.info('🔍 Testing node.get() - Read data from node');
      logger.info('Method: node.get(path, schema?) → Promise<T | null>');

      logger.info('Reading from node', { path: nodePath });

      const data = await node.get<TestData>(nodePath, TestSchema);

      if (data) {
        logger.success('Data retrieved from node!', data);
      } else {
        logger.warn('No data found at path', { path: nodePath });
      }

    } catch (error: any) {
      logger.error('node.get() failed', error.message);
    }
  };

  /**
   * TEST: node.update()
   * Method: @ariob/core/node - node.update(path, updates)
   * Purpose: Partially update node data (merges with existing)
   * Returns: Promise<Result<void, Error>>
   * Behavior: Merges updates with existing data (Gun's default)
   * Use Case: Updating specific fields without replacing entire object
   */
  const testNodeUpdate = async () => {
    try {
      logger.info('🔄 Testing node.update() - Partial update');
      logger.info('Method: node.update(path, updates) → Promise<Result<void, Error>>');

      const updates = {
        count: parseInt(count) + 1 || 1,
        active: false,
      };

      logger.info('Updating node', { path: nodePath, updates });

      const result = await node.update(nodePath, updates);

      if (result.ok) {
        logger.success('Node updated successfully!', updates);
      } else {
        logger.error('node.update() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('node.update() error', error.message);
    }
  };

  const testCreateNode = async () => {
    try {
      logger.info('🆕 Testing createNode() - Factory function');

      const customPath = 'custom/node/' + Date.now();

      logger.info('Creating node factory', { path: customPath });

      // createNode returns a hook, so we can't use it directly in tests
      // Instead, test the imperative API
      const testData: TestData = {
        title: 'Created via imperative API',
        count: 999,
        active: true,
      };

      const result = await node.put(customPath, testData, TestSchema);
      if (result.ok) {
        logger.success('Data written via imperative API', testData);
      } else {
        logger.error('Failed to write data', result.error?.message);
        return;
      }

      // Read it back
      const readData = await node.get<TestData>(customPath, TestSchema);
      if (readData) {
        logger.success('Data read back successfully', readData);
      }

    } catch (error: any) {
      logger.error('createNode() test failed', error.message);
    }
  };

  /**
   * TEST: useNode()
   * Hook: @ariob/core/node - useNode(config)
   * Purpose: React hook for reactive Gun node subscriptions
   * Config: { path, schema?, transform? }
   * Returns: {
   *   data: T | null,
   *   isLoading: boolean,
   *   isError: boolean,
   *   isSynced: boolean,
   *   mutate: (data) => Promise<Result>,
   *   update: (updates) => Promise<Result>,
   *   refetch: () => void
   * }
   * Use Case: Real-time data in React components
   */
  const testUseNodeHook = () => {
    try {
      logger.info('🪝 Testing useNode() hook - Reactive data');
      logger.info('Hook: useNode(config) → { data, isLoading, mutate, update, ... }');

      logger.info('Current hook state', {
        hasData: !!testNode.data,
        data: testNode.data,
        isLoading: testNode.isLoading,
        isError: testNode.isError,
        isSynced: testNode.isSynced,
      });

      if (testNode.isError) {
        logger.error('Hook has error', testNode.error?.message);
      } else if (testNode.isLoading) {
        logger.info('Hook is loading...');
      } else if (testNode.data) {
        logger.success('Hook has data!', testNode.data);
      } else {
        logger.warn('Hook has no data yet. Try writing first.');
      }

      logger.info('Hook methods available', {
        hasMutate: typeof testNode.mutate === 'function',
        hasUpdate: typeof testNode.update === 'function',
        hasRefetch: typeof testNode.refetch === 'function',
      });

    } catch (error: any) {
      logger.error('useNode() hook test failed', error.message);
    }
  };

  /**
   * TEST: useNode().mutate()
   * Method: Hook method - mutate(data)
   * Purpose: Write complete data via hook (triggers reactive update)
   * Returns: Promise<Result<void, Error>>
   * Benefit: Automatic re-render when data changes
   * Use Case: Form submissions, user actions
   */
  const testUseNodeMutate = async () => {
    try {
      logger.info('📝 Testing useNode().mutate() - Write via hook');
      logger.info('Method: hook.mutate(data) → Promise<Result<void, Error>>');

      const data: TestData = {
        title: 'Written via hook mutate',
        count: 777,
        active: true,
      };

      logger.info('Writing via hook.mutate()', data);
      const result = await testNode.mutate(data);

      if (result.ok) {
        logger.success('Data written via hook! Check for reactive update.');
      } else {
        logger.error('hook.mutate() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('useNode().mutate() error', error.message);
    }
  };

  /**
   * TEST: useNode().update()
   * Method: Hook method - update(updates)
   * Purpose: Partial update via hook (triggers reactive update)
   * Returns: Promise<Result<void, Error>>
   * Benefit: Automatic re-render, only sends changed fields
   * Use Case: Toggle states, increment counters
   */
  const testUseNodeUpdate = async () => {
    try {
      logger.info('🔄 Testing useNode().update() - Partial update via hook');
      logger.info('Method: hook.update(updates) → Promise<Result<void, Error>>');

      const updates = {
        count: 888,
        active: false,
      };

      logger.info('Updating via hook.update()', updates);
      const result = await testNode.update(updates);

      if (result.ok) {
        logger.success('Data updated via hook! Check for reactive update.');
      } else {
        logger.error('hook.update() failed', result.error?.message);
      }

    } catch (error: any) {
      logger.error('useNode().update() error', error.message);
    }
  };

  /**
   * TEST: Schema Validation
   * Feature: Zod schema validation on put/get
   * Purpose: Ensure data integrity and type safety
   * Behavior: Validates before writing, after reading
   * Result: Returns error for invalid data
   * Use Case: Preventing corrupt data, enforcing contracts
   */
  const testSchemaValidation = async () => {
    try {
      logger.info('✅ Testing schema validation');
      logger.info('Feature: Zod schema validation ensures data integrity');

      // Test valid data
      logger.info('Testing valid data...');
      const validData: TestData = {
        title: 'Valid',
        count: 123,
        active: true,
      };

      const validResult = await node.put(nodePath, validData, TestSchema);
      if (validResult.ok) {
        logger.success('Valid data accepted!', validData);
      } else {
        logger.error('Valid data rejected!', validResult.error?.message);
      }

      // Test invalid data (should fail)
      logger.info('Testing invalid data (should fail)...');
      try {
        // @ts-expect-error - Intentionally invalid
        const invalidResult = await node.put(nodePath, { title: 'Missing count field' }, TestSchema);
        if (invalidResult.ok) {
          logger.error('❌ Invalid data was accepted! Schema validation may not be working.');
        } else {
          logger.success('✅ Invalid data rejected correctly!', invalidResult.error?.message);
        }
      } catch (err: any) {
        logger.success('✅ Invalid data rejected correctly!', err.message);
      }

    } catch (error: any) {
      logger.error('Schema validation test failed', error.message);
    }
  };

  /**
   * TEST: node.delete()
   * Method: @ariob/core/node - node.delete(path)
   * Purpose: Delete a Gun node (tombstoning - all properties set to null)
   * Returns: Promise<Result<void, Error>>
   * Behavior: Reads current data and sets each property to null (Gun's delete pattern)
   * Use Case: Removing data, cleanup
   * Note: Gun doesn't support true deletion - uses tombstoning instead
   */
  const testNodeDelete = async () => {
    try {
      logger.info('🗑️ Testing node.delete() - Delete node (tombstoning)');
      logger.info('Method: node.delete(path) → Promise<Result<void, Error>>');
      logger.info('Note: Gun uses "tombstoning" - setting all properties to null');

      const testPath = 'test/delete/' + Date.now();

      // First write some data
      await node.put(testPath, { title: 'To be deleted', count: 1 }, TestSchema);
      logger.info('Created test node', { path: testPath });

      // Then delete it
      const result = await node.delete(testPath);
      if (result.ok) {
        logger.success('Node deleted successfully!');
      } else {
        logger.error('node.delete() failed', result.error?.message);
        return;
      }

      // Verify deletion - with tombstoning, all properties should be null
      const data = await node.get(testPath);
      if (!data) {
        logger.success('✅ Verified: node is deleted (returns null)');
      } else {
        // Check if all properties are null (tombstone)
        const allNull = Object.keys(data).every(key =>
          key === '_' || data[key] === null
        );
        if (allNull) {
          logger.success('✅ Verified: node is tombstoned (all properties null)', data);
        } else {
          logger.error('❌ Node still has non-null data after deletion', data);
        }
      }

    } catch (error: any) {
      logger.error('node.delete() error', error.message);
    }
  };

  const runAllTests = async () => {
    logger.info('🧪 Running complete node test suite...');

    try {
      await testNodePut();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testNodeGet();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testNodeUpdate();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testCreateNode();
      await new Promise(resolve => setTimeout(resolve, 500));

      testUseNodeHook();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testUseNodeMutate();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testUseNodeUpdate();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testSchemaValidation();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testNodeDelete();

      logger.success('🎉 All node tests completed!');
    } catch (error: any) {
      logger.error('Test suite error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Node API Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test node operations: node.put, node.get, node.update, useNode hook with auto-subscriptions
        </ThemedText>
      </ThemedView>

      {/* Input Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Test Data</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Node path (e.g., test/node)"
          value={nodePath}
          onChangeText={setNodePath}
        />
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Count (number)"
          value={count}
          onChangeText={setCount}
          keyboardType="numeric"
        />
      </ThemedView>

      {/* Hook State Display */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">useNode() Hook State</ThemedText>
        <ThemedView style={styles.statusCard}>
          <ThemedText style={styles.statusLabel}>Loading:</ThemedText>
          <ThemedText style={testNode.isLoading ? styles.statusYes : styles.statusNo}>
            {testNode.isLoading ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Error:</ThemedText>
          <ThemedText style={testNode.isError ? styles.statusYes : styles.statusNo}>
            {testNode.isError ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Synced:</ThemedText>
          <ThemedText style={testNode.isSynced ? styles.statusYes : styles.statusNo}>
            {testNode.isSynced ? 'Yes' : 'No'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Has Data:</ThemedText>
          <ThemedText style={testNode.data ? styles.statusYes : styles.statusNo}>
            {testNode.data ? 'Yes' : 'No'}
          </ThemedText>
          {testNode.data && (
            <>
              <ThemedText style={styles.statusLabel}>Data:</ThemedText>
              <ThemedText style={styles.dataText}>
                {JSON.stringify(testNode.data, null, 2)}
              </ThemedText>
            </>
          )}
        </ThemedView>
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Individual Tests</ThemedText>

        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={testNodePut}>
          <ThemedText style={styles.buttonText}>Test node.put()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testNodeGet}>
          <ThemedText style={styles.buttonText}>Test node.get()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testNodeUpdate}>
          <ThemedText style={styles.buttonText}>Test node.update()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testCreateNode}>
          <ThemedText style={styles.buttonText}>Test Imperative API</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testUseNodeHook}>
          <ThemedText style={styles.buttonText}>Inspect useNode() Hook</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testUseNodeMutate}>
          <ThemedText style={styles.buttonText}>Test useNode().mutate()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testUseNodeUpdate}>
          <ThemedText style={styles.buttonText}>Test useNode().update()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testSchemaValidation}>
          <ThemedText style={styles.buttonText}>Test Schema Validation</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonDanger]} onPress={testNodeDelete}>
          <ThemedText style={styles.buttonText}>Test node.delete()</ThemedText>
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
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
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
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
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
