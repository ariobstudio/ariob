import * as React from '@lynx-js/react';
import { createGraph } from '@ariob/core';
import type { GunInstance } from '@ariob/core';

interface GraphContextValue {
  graph: GunInstance;
}

const GraphContext = React.createContext<GraphContextValue | null>(null);

export function GraphProvider({ children }: { children: React.ReactNode }) {
  const graphRef = React.useRef<GunInstance>();

  if (!graphRef.current) {
    console.log('[GraphProvider] Initializing Gun instance...');
    // Initialize Gun WITHOUT peers first to test if Gun works at all
    // Testing local-only like ripple/IncrementalTest does
    graphRef.current = createGraph({
      localStorage: true,
      peers: ['http://localhost:8765/gun'], // Disabled to test local-only first
    });
    console.log('[GraphProvider] Gun instance created:', {
      hasGraph: !!graphRef.current,
      peers: ['http://localhost:8765/gun'],
    });

    // Test Gun is working
    console.log('[GraphProvider] Testing Gun basic functionality...');
    (graphRef.current as any).get('test').put({ hello: 'world', timestamp: Date.now() }, (ack: any) => {
      console.log('[GraphProvider] Gun test put ack:', ack);
    });

    // Log connection events
    graphRef.current.on('hi', (peer: any) => {
      console.log('[Gun] Connected to peer:', peer);
    });

    graphRef.current.on('bye', (peer: any) => {
      console.log('[Gun] Disconnected from peer:', peer);
    });

    // Monitor all Gun traffic
    const testRef = graphRef.current.get('senterej').get('sessions');
    console.log('[GraphProvider] Setting up monitor on senterej/sessions');
    testRef.map().on((data: any, key: any) => {
      console.log('[Gun Monitor] Session data received:', { key, data });
    });
  }

  return (
    <GraphContext.Provider value={{ graph: graphRef.current }}>
      {children}
    </GraphContext.Provider>
  );
}

export function useGraph(): GunInstance {
  const context = React.useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context.graph;
}
