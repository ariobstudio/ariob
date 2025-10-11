/**
 * StreamTest Component
 *
 * Demonstrates the new FRP-style Gun streams and operators
 */

import { useMemo, useState, useEffect } from 'react';
import { useStream, stream, put, once } from '@ariob/core';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ariob/ui';
import { Button } from '@ariob/ui';
import { Column, Row, Text } from '@ariob/ui';

// Define a simple Counter type (avoiding Zod inference to prevent type issues)
interface Counter {
  value: number;
  lastUpdated: number;
}

export function StreamTest() {
  const [counterId] = useState(() => 'test-counter');

  // Create a stream for the counter (simplified - no complex operator chaining)
  const counterStream = useMemo(
    () => stream<Counter>(counterId),
    [counterId]
  );

  // Subscribe to the stream
  const streamResult = useStream(counterStream);
  const counter = streamResult.data;
  const loading = streamResult.loading;
  const error = streamResult.error;

  // Initialize counter if it doesn't exist
  useEffect(() => {
    const initCounter = async () => {
      const current = await once<Counter>(counterId);
      if (!current) {
        // Initialize with default value
        put(counterId, {
          value: 0,
          lastUpdated: Date.now(),
        }).subscribe();
      }
    };

    initCounter();
  }, [counterId]);

  // Increment counter
  const handleIncrement = async () => {
    const current = await once<Counter>(counterId);
    const newValue: Counter = {
      value: (current?.value ?? 0) + 1,
      lastUpdated: Date.now(),
    };

    put(counterId, newValue).subscribe({
      next: result => {
        if (!result.ok) {
          console.error('Failed to update counter:', result.err);
        }
      },
    });
  };

  // Reset counter
  const handleReset = () => {
    const newValue: Counter = {
      value: 0,
      lastUpdated: Date.now(),
    };

    put(counterId, newValue).subscribe({
      next: result => {
        if (!result.ok) {
          console.error('Failed to reset counter:', result.err);
        }
      },
    });
  };

  if (loading) {
    return (
      <Column spacing="md" className="p-4">
        <Text>Loading counter...</Text>
      </Column>
    );
  }

  if (error) {
    return (
      <Column spacing="md" className="p-4">
        <Text variant="destructive">Error: {error.message}</Text>
      </Column>
    );
  }

  return (
    <Column spacing="md" className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>FRP Stream Test</CardTitle>
          <CardDescription>
            Testing Gun streams with RxJS operators
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <Column spacing="lg" align="center">
            <Column spacing="xs" align="center">
              <Text variant="muted" size="sm">
                Counter Value
              </Text>
              <Text size="6xl" weight="bold">
                {counter?.value ?? 0}
              </Text>
              {counter?.lastUpdated && (
                <Text variant="muted" size="xs" className="mt-2">
                  Last updated: {new Date(counter.lastUpdated).toLocaleTimeString()}
                </Text>
              )}
            </Column>

            <Row spacing="sm" width="full">
              <Button onClick={handleIncrement} className="flex-1">
                Increment
              </Button>
              <Button onClick={handleReset} variant="secondary" className="flex-1">
                Reset
              </Button>
            </Row>
          </Column>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <Column spacing="xs">
            <Text variant="muted" size="sm">
              • Uses stream() to create reactive Gun observable
            </Text>
            <Text variant="muted" size="sm">
              • Uses once() to read current value
            </Text>
            <Text variant="muted" size="sm">
              • Uses put() to write data
            </Text>
            <Text variant="muted" size="sm">
              • Updates in real-time across devices
            </Text>
          </Column>
        </CardContent>
      </Card>
    </Column>
  );
}
