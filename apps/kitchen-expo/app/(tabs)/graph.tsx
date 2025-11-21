import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TestLogger, useTestLogger } from '@/components/test-logger';
import {
  graph,
  createGraph,
  graphStore,
  addPeersToGraph,
  GunInstance,
} from '@ariob/core';

/**
 * GRAPH TEST SUITE
 *
 * Tests @ariob/core graph management:
 *   - graph() - Get singleton Gun instance
 *   - createGraph(options) - Create isolated instance
 *   - addPeersToGraph(peers) - Add peers dynamically
 *   - graphStore - Zustand store with direct selectors
 *
 * Gun API methods tested:
 *   - .get(key) - Get reference to node
 *   - .put(data) - Write data to node
 *   - .once(callback) - Read data once
 *   - .on(callback) - Subscribe to real-time updates
 *   - .map() - Iterate over sets
 */
export default function GraphTestScreen() {
  const logger = useTestLogger();
  const [customPeer, setCustomPeer] = useState('');
  const [testKey, setTestKey] = useState('test-key');
  const [testValue, setTestValue] = useState('test-value');
  const [customGraphInstance, setCustomGraphInstance] = useState<GunInstance | null>(null);

  React.useEffect(() => {
    logger.info('Graph Test Screen mounted');
    logger.info('Default graph instance available', { graph: typeof graph });

    // Log initial graph store state
    const state = graphStore.getState();
    logger.info('Initial graph store state', {
      instanceCount: state.instances?.size || 0,
    });
  }, []);

  /**
   * TEST: graph()
   * Method: @ariob/core/graph - graph(options?)
   * Purpose: Get singleton Gun instance (initialized via init() at app startup)
   * Returns: GunInstance with .get(), .put(), .on(), .once(), .map()
   * Pattern: Call once with init(), then graph() anywhere in your app
   */
  const testDefaultGraph = () => {
    try {
      logger.info('🌐 Testing default graph instance');
      logger.info('Method: graph() → GunInstance');
      logger.success('Default graph is available', { type: typeof graph });

      // Get Gun instance by calling graph()
      logger.info('Calling graph() to get Gun instance...');
      const g = graph();
      logger.success('Got Gun instance', { hasGet: typeof g.get === 'function' });

      // Test basic graph methods
      logger.info('Testing graph().get()...');
      const ref = g.get(testKey);
      logger.success('graph().get() successful', { key: testKey });

      // Test chaining
      logger.info('Testing graph().get().put()...');
      ref.put({ value: testValue, timestamp: Date.now() });
      logger.success('Data written to graph', { key: testKey, value: testValue });

      // Test retrieval
      logger.info('Testing graph().get().once() for retrieval...');
      ref.once((data: any) => {
        if (data) {
          logger.success('Data retrieved from graph!', data);
        } else {
          logger.warn('No data found for key', { key: testKey });
        }
      });

    } catch (error: any) {
      logger.error('Default graph test failed', error.message);
    }
  };

  /**
   * TEST: createGraph()
   * Method: @ariob/core/graph - createGraph(options)
   * Purpose: Create isolated Gun instance for testing or separate state
   * Returns: New GunInstance (not stored in singleton)
   * Use Case: Unit tests, isolated data contexts
   */
  const testCreateGraph = () => {
    try {
      logger.info('🆕 Testing createGraph() - Create new graph instance');
      logger.info('Method: createGraph(options) → GunInstance');

      const newGraph = createGraph({
        peers: [],
        localStorage: false,
        radisk: false,
      });

      setCustomGraphInstance(newGraph);
      logger.success('New graph instance created!', {
        type: typeof newGraph,
        hasGet: typeof newGraph.get === 'function',
        hasPut: typeof newGraph.put === 'function',
      });

      // Test the new instance
      logger.info('Testing new instance with .get()...');
      const ref = newGraph.get('custom-test');
      ref.put({ message: 'Hello from custom graph!', timestamp: Date.now() });

      ref.once((data: any) => {
        if (data) {
          logger.success('Custom graph instance working!', data);
        }
      });

    } catch (error: any) {
      logger.error('createGraph() failed', error.message);
    }
  };

  /**
   * TEST: addPeersToGraph()
   * Method: @ariob/core/graph - addPeersToGraph(peers)
   * Purpose: Dynamically add relay peers to existing Gun instance
   * Parameters: peers: string[] - Array of peer URLs
   * Use Case: Runtime peer discovery, failover relays
   */
  const testAddPeers = () => {
    try {
      if (!customPeer.trim()) {
        logger.warn('Please enter a peer URL');
        return;
      }

      logger.info('👥 Testing addPeersToGraph()', { peer: customPeer });
      logger.info('Method: addPeersToGraph(peers: string[]) → void');

      // Add peer to default graph
      addPeersToGraph(graph, [customPeer]);
      logger.success('Peer added to graph', { peer: customPeer });

      // Optionally test connection
      logger.info('Testing peer connection...');
      const testRef = graph().get('peer-test-' + Date.now());
      testRef.put({ test: true, timestamp: Date.now() });

      testRef.once((data: any) => {
        if (data) {
          logger.success('Peer test data synced', data);
        }
      });

    } catch (error: any) {
      logger.error('addPeersToGraph() failed', error.message);
    }
  };

  /**
   * TEST: graphStore
   * Store: @ariob/core/graph - graphStore
   * Purpose: Zustand store for graph state
   * Access: Direct selectors - graphStore((s) => s.instance)
   * State: { instance: GunInstance | null, peers: string[] }
   */
  const testGraphStore = () => {
    try {
      logger.info('📊 Inspecting graphStore');
      logger.info('Store: graphStore - Zustand with direct selectors');

      const state = graphStore.getState();
      logger.info('Graph store state', {
        instances: state.instances?.size || 0,
        hasDefaultInstance: !!state.instance,
      });

      logger.success('Graph store inspection complete');

    } catch (error: any) {
      logger.error('Graph store inspection failed', error.message);
    }
  };

  /**
   * TEST: Gun Chaining
   * Methods: .get().get().put() - Nested path operations
   * Purpose: Access nested nodes in the graph
   * Pattern: graph().get('users').get('userId').get('profile')
   * Use Case: Hierarchical data structures
   */
  const testGraphChaining = () => {
    try {
      logger.info('⛓️ Testing graph chaining operations');
      logger.info('Pattern: graph().get(key1).get(key2).put(data)');

      // Test complex chaining
      logger.info('Testing graph().get().get().put()...');

      graph()
        .get('users')
        .get('user1')
        .put({
          name: 'Test User',
          email: 'test@example.com',
          timestamp: Date.now(),
        });

      logger.success('Nested data written');

      // Retrieve nested data
      logger.info('Retrieving nested data...');
      graph()
        .get('users')
        .get('user1')
        .once((data: any) => {
          if (data) {
            logger.success('Nested data retrieved!', data);
          } else {
            logger.warn('No nested data found');
          }
        });

    } catch (error: any) {
      logger.error('Graph chaining test failed', error.message);
    }
  };

  /**
   * TEST: .map()
   * Method: Gun API - .map().once(callback)
   * Purpose: Iterate over all items in a set/collection
   * Returns: Calls callback for each item in the set
   * Use Case: Rendering lists, finding items
   */
  const testGraphMap = () => {
    try {
      logger.info('🗺️ Testing graph().get().map() - Iterate over sets');
      logger.info('Method: .map().once(callback) → iterate items');

      // Write some test data first
      const testSet = graph().get('test-set');
      testSet.get('item1').put({ value: 'First item', timestamp: Date.now() });
      testSet.get('item2').put({ value: 'Second item', timestamp: Date.now() });
      testSet.get('item3').put({ value: 'Third item', timestamp: Date.now() });

      logger.success('Test data written to set');

      // Map over the set
      logger.info('Mapping over set items...');
      let count = 0;
      testSet.map().once((data: any, key: string) => {
        if (data) {
          count++;
          logger.success(`Item ${count} retrieved`, { key, data });
        }
      });

      setTimeout(() => {
        logger.info(`Map iteration complete. Found ${count} items`);
      }, 1000);

    } catch (error: any) {
      logger.error('Graph map test failed', error.message);
    }
  };

  /**
   * TEST: .on()
   * Method: Gun API - .on(callback)
   * Purpose: Subscribe to real-time updates on a node
   * Returns: Calls callback whenever data changes
   * Use Case: Live data, collaborative apps, chat
   * Note: Remember to .off() when unmounting
   */
  const testGraphOn = () => {
    try {
      logger.info('👂 Testing graph().get().on() - Real-time updates');
      logger.info('Method: .on(callback) → subscribe to changes');

      const liveRef = graph().get('live-data');

      // Set up listener
      logger.info('Setting up real-time listener...');
      liveRef.on((data: any) => {
        logger.success('Real-time update received!', data);
      });

      // Write some data to trigger the listener
      setTimeout(() => {
        logger.info('Writing data to trigger listener...');
        liveRef.put({ message: 'Hello real-time!', timestamp: Date.now() });
      }, 1000);

      setTimeout(() => {
        logger.info('Writing second update...');
        liveRef.put({ message: 'Second update!', timestamp: Date.now() });
      }, 2000);

    } catch (error: any) {
      logger.error('Graph .on() test failed', error.message);
    }
  };

  const runAllTests = async () => {
    logger.info('🧪 Running complete graph test suite...');

    try {
      testDefaultGraph();
      await new Promise(resolve => setTimeout(resolve, 500));

      testCreateGraph();
      await new Promise(resolve => setTimeout(resolve, 500));

      testGraphStore();
      await new Promise(resolve => setTimeout(resolve, 500));

      testGraphChaining();
      await new Promise(resolve => setTimeout(resolve, 500));

      testGraphMap();
      await new Promise(resolve => setTimeout(resolve, 500));

      testGraphOn();

      logger.success('🎉 All graph tests initiated! Check logs for results.');
    } catch (error: any) {
      logger.error('Test suite error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Graph API Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test graph operations: get, put, once, on, map, createGraph, addPeers
        </ThemedText>
      </ThemedView>

      {/* Input Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Test Data</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Key name"
          value={testKey}
          onChangeText={setTestKey}
        />
        <TextInput
          style={styles.input}
          placeholder="Value"
          value={testValue}
          onChangeText={setTestValue}
        />
        <TextInput
          style={styles.input}
          placeholder="Custom peer URL (e.g., http://localhost:8765/gun)"
          value={customPeer}
          onChangeText={setCustomPeer}
        />
      </ThemedView>

      {/* Status */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Status</ThemedText>
        <ThemedView style={styles.statusCard}>
          <ThemedText style={styles.statusLabel}>Default Graph:</ThemedText>
          <ThemedText style={styles.statusYes}>✓ Available</ThemedText>
          <ThemedText style={styles.statusLabel}>Custom Graph:</ThemedText>
          <ThemedText style={customGraphInstance ? styles.statusYes : styles.statusNo}>
            {customGraphInstance ? '✓ Created' : '✗ Not created'}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Individual Tests</ThemedText>

        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={testDefaultGraph}>
          <ThemedText style={styles.buttonText}>Test Default Graph</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testCreateGraph}>
          <ThemedText style={styles.buttonText}>Test createGraph()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testAddPeers}>
          <ThemedText style={styles.buttonText}>Test Add Peers</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testGraphStore}>
          <ThemedText style={styles.buttonText}>Inspect Graph Store</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testGraphChaining}>
          <ThemedText style={styles.buttonText}>Test Chaining</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testGraphMap}>
          <ThemedText style={styles.buttonText}>Test .map()</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testGraphOn}>
          <ThemedText style={styles.buttonText}>Test .on() (Real-time)</ThemedText>
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
