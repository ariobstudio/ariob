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
    // Initialize Gun with peer server for P2P sync
    graphRef.current = createGraph({
      peers: ['http://localhost:8765/gun'],
      localStorage: true,
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
