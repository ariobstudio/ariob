import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TestLogger, useTestLogger } from '@/components/test-logger';
import {
  initMeshMonitoring,
  getPeerStatus,
  getAllPeers,
  addPeer as addMeshPeer,
  removePeer as removeMeshPeer,
  resetMeshStats,
  useMesh,
  usePeer,
  meshStore,
  graph,
} from '@ariob/core';

export default function MeshTestScreen() {
  const logger = useTestLogger();
  const [peerUrl, setPeerUrl] = useState('http://localhost:8765/gun');
  const [specificPeerUrl, setSpecificPeerUrl] = useState('');

  // Use the reactive hooks
  const meshState = useMesh();
  const specificPeerState = usePeer(specificPeerUrl);

  React.useEffect(() => {
    logger.info('Mesh Test Screen mounted');
    logger.info('Mesh monitoring hooks initialized');

    // Log initial mesh state
    logger.info('Initial mesh state', {
      peerCount: meshState.peers?.length || 0,
      isMonitoring: meshState.isMonitoring,
    });
  }, []);

  // Watch for mesh state changes
  React.useEffect(() => {
    if (meshState.peers && meshState.peers.length > 0) {
      logger.success('Mesh peers updated', {
        count: meshState.peers.length,
        peers: meshState.peers.map(p => ({
          url: p.url,
          connected: p.connected,
          messagesSent: p.messagesSent,
          messagesReceived: p.messagesReceived,
        })),
      });
    }
  }, [meshState.peers]);

  const testInitMeshMonitoring = () => {
    try {
      logger.info('📡 Testing initMeshMonitoring() - Start monitoring');

      initMeshMonitoring();

      logger.success('Mesh monitoring initialized!');
      logger.info('Monitoring should start collecting peer stats');

    } catch (error: any) {
      logger.error('initMeshMonitoring() failed', error.message);
    }
  };

  const testAddPeer = () => {
    try {
      if (!peerUrl.trim()) {
        logger.warn('Please enter a peer URL');
        return;
      }

      logger.info('➕ Testing addMeshPeer() - Add peer to mesh', { url: peerUrl });

      addMeshPeer(peerUrl);

      logger.success('Peer added to mesh!', { url: peerUrl });
      logger.info('Graph should now attempt to connect to this peer');

      // Also try to add it to the graph directly
      logger.info('Adding peer to graph instance...');
      graph.opt({ peers: [peerUrl] });

    } catch (error: any) {
      logger.error('addMeshPeer() failed', error.message);
    }
  };

  const testRemovePeer = () => {
    try {
      if (!peerUrl.trim()) {
        logger.warn('Please enter a peer URL');
        return;
      }

      logger.info('➖ Testing removeMeshPeer() - Remove peer from mesh', { url: peerUrl });

      removeMeshPeer(peerUrl);

      logger.success('Peer removed from mesh!', { url: peerUrl });

    } catch (error: any) {
      logger.error('removeMeshPeer() failed', error.message);
    }
  };

  const testGetAllPeers = () => {
    try {
      logger.info('📋 Testing getAllPeers() - Get all peer statuses');

      const peers = getAllPeers();

      if (peers && peers.length > 0) {
        logger.success('Retrieved all peers!', {
          count: peers.length,
          peers: peers.map(p => ({
            url: p.url,
            connected: p.connected,
            lastSeen: p.lastSeen,
            messagesSent: p.messagesSent,
            messagesReceived: p.messagesReceived,
          })),
        });
      } else {
        logger.warn('No peers found in mesh');
      }

    } catch (error: any) {
      logger.error('getAllPeers() failed', error.message);
    }
  };

  const testGetPeerStatus = () => {
    try {
      if (!specificPeerUrl.trim()) {
        logger.warn('Please enter a peer URL in the specific peer field');
        return;
      }

      logger.info('🔍 Testing getPeerStatus() - Get specific peer status', {
        url: specificPeerUrl,
      });

      const status = getPeerStatus(specificPeerUrl);

      if (status) {
        logger.success('Peer status retrieved!', {
          url: status.url,
          connected: status.connected,
          lastSeen: status.lastSeen,
          messagesSent: status.messagesSent,
          messagesReceived: status.messagesReceived,
          latency: status.latency,
        });
      } else {
        logger.warn('Peer not found in mesh', { url: specificPeerUrl });
      }

    } catch (error: any) {
      logger.error('getPeerStatus() failed', error.message);
    }
  };

  const testResetMeshStats = () => {
    try {
      logger.info('🔄 Testing resetMeshStats() - Reset all mesh statistics');

      resetMeshStats();

      logger.success('Mesh statistics reset!');
      logger.info('All peer counters have been reset to zero');

    } catch (error: any) {
      logger.error('resetMeshStats() failed', error.message);
    }
  };

  const testUseMeshHook = () => {
    try {
      logger.info('🪝 Testing useMesh() hook - Reactive mesh state');

      logger.info('Current mesh hook state', {
        isMonitoring: meshState.isMonitoring,
        peerCount: meshState.peers?.length || 0,
        connectedCount: meshState.peers?.filter(p => p.connected).length || 0,
      });

      if (meshState.peers && meshState.peers.length > 0) {
        logger.success('Mesh hook has peers!', {
          count: meshState.peers.length,
          peers: meshState.peers.map(p => ({
            url: p.url,
            connected: p.connected,
          })),
        });
      } else {
        logger.warn('Mesh hook has no peers. Try adding some.');
      }

    } catch (error: any) {
      logger.error('useMesh() hook test failed', error.message);
    }
  };

  const testUsePeerHook = () => {
    try {
      if (!specificPeerUrl.trim()) {
        logger.warn('Please enter a peer URL in the specific peer field');
        return;
      }

      logger.info('🪝 Testing usePeer() hook - Reactive peer state', {
        url: specificPeerUrl,
      });

      logger.info('Current peer hook state', {
        connected: specificPeerState?.connected,
        messagesSent: specificPeerState?.messagesSent,
        messagesReceived: specificPeerState?.messagesReceived,
        lastSeen: specificPeerState?.lastSeen,
      });

      if (specificPeerState) {
        logger.success('Peer hook has data!', specificPeerState);
      } else {
        logger.warn('Peer not found in mesh. Try adding it first.');
      }

    } catch (error: any) {
      logger.error('usePeer() hook test failed', error.message);
    }
  };

  const testMeshStore = () => {
    try {
      logger.info('📊 Testing meshStore - Inspect store state');

      const state = meshStore.getState();

      logger.info('Mesh store state', {
        isMonitoring: state.isMonitoring,
        peerCount: Object.keys(state.peers || {}).length,
        peers: state.peers,
      });

      logger.success('Mesh store inspection complete');

    } catch (error: any) {
      logger.error('meshStore inspection failed', error.message);
    }
  };

  const testPeerCommunication = () => {
    try {
      if (!peerUrl.trim()) {
        logger.warn('Please enter a peer URL');
        return;
      }

      logger.info('💬 Testing peer communication - Send data through mesh');

      // Add peer if not already added
      addMeshPeer(peerUrl);
      graph.opt({ peers: [peerUrl] });

      // Send some test data
      const testData = {
        message: 'Hello from mesh test!',
        timestamp: Date.now(),
      };

      logger.info('Sending test data to peer...', testData);

      const ref = graph.get('mesh-test-' + Date.now());
      ref.put(testData);

      logger.success('Test data sent! Check peer for synchronization.');

      // Try to read it back
      setTimeout(() => {
        ref.once((data: any) => {
          if (data) {
            logger.success('Data synced and read back!', data);
          } else {
            logger.warn('Could not read back data. Peer might not be connected.');
          }
        });
      }, 1000);

    } catch (error: any) {
      logger.error('Peer communication test failed', error.message);
    }
  };

  const runAllTests = async () => {
    logger.info('🧪 Running complete mesh test suite...');

    try {
      testInitMeshMonitoring();
      await new Promise(resolve => setTimeout(resolve, 500));

      testGetAllPeers();
      await new Promise(resolve => setTimeout(resolve, 500));

      testMeshStore();
      await new Promise(resolve => setTimeout(resolve, 500));

      testUseMeshHook();
      await new Promise(resolve => setTimeout(resolve, 500));

      if (specificPeerUrl.trim()) {
        testUsePeerHook();
        await new Promise(resolve => setTimeout(resolve, 500));

        testGetPeerStatus();
      }

      logger.success('🎉 All mesh tests completed!');
      logger.info('Note: Add a peer and run individual tests to test peer operations');

    } catch (error: any) {
      logger.error('Test suite error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Mesh API Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test mesh/DAM layer: peer monitoring, status tracking, hooks
        </ThemedText>
      </ThemedView>

      {/* Input Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Peer Configuration</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Peer URL (e.g., http://localhost:8765/gun)"
          value={peerUrl}
          onChangeText={setPeerUrl}
        />
        <TextInput
          style={styles.input}
          placeholder="Specific peer URL for hooks/status"
          value={specificPeerUrl}
          onChangeText={setSpecificPeerUrl}
        />
      </ThemedView>

      {/* Mesh Hook State Display */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">useMesh() Hook State</ThemedText>
        <ThemedView style={styles.statusCard}>
          <ThemedText style={styles.statusLabel}>Monitoring:</ThemedText>
          <ThemedText style={meshState.isMonitoring ? styles.statusYes : styles.statusNo}>
            {meshState.isMonitoring ? 'Active' : 'Inactive'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Peer Count:</ThemedText>
          <ThemedText style={styles.statusValue}>
            {meshState.peers?.length || 0}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Connected:</ThemedText>
          <ThemedText style={styles.statusValue}>
            {meshState.peers?.filter(p => p.connected).length || 0}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Specific Peer State */}
      {specificPeerUrl && specificPeerState && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Specific Peer State</ThemedText>
          <ThemedView style={styles.statusCard}>
            <ThemedText style={styles.statusLabel}>Connected:</ThemedText>
            <ThemedText style={specificPeerState.connected ? styles.statusYes : styles.statusNo}>
              {specificPeerState.connected ? 'Yes' : 'No'}
            </ThemedText>
            <ThemedText style={styles.statusLabel}>Messages Sent:</ThemedText>
            <ThemedText style={styles.statusValue}>
              {specificPeerState.messagesSent || 0}
            </ThemedText>
            <ThemedText style={styles.statusLabel}>Messages Received:</ThemedText>
            <ThemedText style={styles.statusValue}>
              {specificPeerState.messagesReceived || 0}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {/* Action Buttons */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Individual Tests</ThemedText>

        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={testInitMeshMonitoring}>
          <ThemedText style={styles.buttonText}>Init Mesh Monitoring</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testAddPeer}>
          <ThemedText style={styles.buttonText}>Add Peer</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonDanger]} onPress={testRemovePeer}>
          <ThemedText style={styles.buttonText}>Remove Peer</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testGetAllPeers}>
          <ThemedText style={styles.buttonText}>Get All Peers</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testGetPeerStatus}>
          <ThemedText style={styles.buttonText}>Get Specific Peer Status</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testResetMeshStats}>
          <ThemedText style={styles.buttonText}>Reset Mesh Stats</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testUseMeshHook}>
          <ThemedText style={styles.buttonText}>Inspect useMesh() Hook</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testUsePeerHook}>
          <ThemedText style={styles.buttonText}>Inspect usePeer() Hook</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testMeshStore}>
          <ThemedText style={styles.buttonText}>Inspect Mesh Store</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testPeerCommunication}>
          <ThemedText style={styles.buttonText}>Test Peer Communication</ThemedText>
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
