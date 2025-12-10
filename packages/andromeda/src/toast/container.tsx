/** Toast Container - Renders all active toasts */

import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useToasts, connectToastAPI, disconnectToastAPI } from './context';
import { ToastItem } from './toast';
import { toastStyles } from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Container Props
// ─────────────────────────────────────────────────────────────────────────────

export interface ToastContainerProps {
  /** Top inset for safe area (pass from useSafeAreaInsets().top) */
  topInset?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Container
// ─────────────────────────────────────────────────────────────────────────────

export function ToastContainer({ topInset }: ToastContainerProps) {
  const ctx = useToasts();
  const { toasts, dismiss } = ctx;
  const [heights, setHeights] = useState<Record<string, number>>({});

  // Connect imperative API
  useEffect(() => {
    connectToastAPI(ctx);
    return () => disconnectToastAPI();
  }, [ctx]);

  // Handle height measurement
  const onMeasure = useCallback((id: string, height: number) => {
    setHeights((prev) => {
      if (prev[id] === height) return prev;
      return { ...prev, [id]: height };
    });
  }, []);

  // Clean up heights when toasts are dismissed
  useEffect(() => {
    const toastIds = new Set(toasts.map((t) => t.id));
    setHeights((prev) => {
      const next: Record<string, number> = {};
      for (const [id, h] of Object.entries(prev)) {
        if (toastIds.has(id)) {
          next[id] = h;
        }
      }
      return next;
    });
  }, [toasts]);

  if (toasts.length === 0) return null;

  // Create ordered list of toast IDs for proper stacking calculation
  const toastIds = toasts.map((t) => t.id);

  return (
    <View style={toastStyles.container} pointerEvents="box-none">
      {toasts.map((config, index) => (
        <ToastItem
          key={config.id}
          config={config}
          index={index}
          total={toasts.length}
          heights={heights}
          toastIds={toastIds}
          topInset={topInset}
          onMeasure={onMeasure}
          onDismiss={() => dismiss(config.id)}
        />
      ))}
    </View>
  );
}
