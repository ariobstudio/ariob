/**
 * Incremental Test Component
 *
 * Testing Gun operations step by step to identify what works
 */

import { useState } from 'react';
import { createGraph } from '@ariob/core';
import { Card, CardHeader, CardTitle, CardContent } from '@ariob/ui';
import { Button, Column, Row, Text } from '@ariob/ui';

const graph = createGraph({
  localStorage: true
});

export function IncrementalTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [counter, setCounter] = useState(0);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };

  // Test 1: Direct Gun.set() - You said this works
  const test1_DirectSet = () => {
    addResult('Test 1: Direct gun.set()...');
    graph.get('notes').set({
      title: "Test Note " + Date.now(),
      content: "This is a test",
      createdAt: Date.now()
    }, (ack: any) => {
      if (ack.err) {
        addResult(`❌ Test 1 FAILED: ${ack.err}`);
      } else {
        addResult(`✅ Test 1 PASSED: gun.set() worked!`);
      }
    });
  };

  // Test 2: Direct Gun.get().put()
  const test2_DirectPut = () => {
    addResult('Test 2: Direct gun.put()...');
    const id = 'test-counter-' + Date.now();
    graph.get(id).put({
      value: 42,
      timestamp: Date.now()
    }, (ack: any) => {
      if (ack.err) {
        addResult(`❌ Test 2 FAILED: ${ack.err}`);
      } else {
        addResult(`✅ Test 2 PASSED: gun.put() worked!`);
      }
    });
  };

  // Test 3: Gun.on() subscription
  const test3_Subscription = () => {
    addResult('Test 3: Setting up gun.on() subscription...');
    const testId = 'test-sub-' + Date.now();

    // Set up subscription first
    graph.get(testId).on((data: any) => {
      if (data) {
        addResult(`✅ Test 3 PASSED: Received data via gun.on(): ${JSON.stringify(data)}`);
      }
    });

    // Then put data
    setTimeout(() => {
      graph.get(testId).put({ hello: 'world', timestamp: Date.now() });
    }, 100);
  };

  // Test 4: Gun.map().on() for collections
  const test4_MapOn = () => {
    addResult('Test 4: Setting up gun.map().on() subscription...');
    const collectionPath = 'test-collection-' + Date.now();
    let itemCount = 0;

    // Subscribe to collection
    graph.get(collectionPath).map().on((data: any, key: string) => {
      if (data) {
        itemCount++;
        addResult(`✅ Test 4: Received item ${itemCount}: ${key} = ${JSON.stringify(data)}`);
      }
    });

    // Add some items
    setTimeout(() => {
      addResult('Test 4: Adding items...');
      graph.get(collectionPath).set({ id: '1', name: 'Item 1' });
      graph.get(collectionPath).set({ id: '2', name: 'Item 2' });
      graph.get(collectionPath).set({ id: '3', name: 'Item 3' });
    }, 100);
  };

  // Test 5: React state + Gun
  const test5_ReactState = () => {
    addResult('Test 5: React state + Gun...');
    const testId = 'react-state-test';

    // Subscribe
    graph.get(testId).on((data: any) => {
      if (data?.value !== undefined) {
        setCounter(data.value);
        addResult(`✅ Test 5: React state updated to ${data.value}`);
      }
    });

    // Update
    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 100);
      graph.get(testId).put({ value: newValue });
      addResult(`Test 5: Sent value ${newValue} to Gun`);
    }, 100);
  };

  const clearResults = () => {
    setTestResults([]);
    setCounter(0);
  };

  return (
    <Column spacing="md" className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Incremental Gun Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="muted" size="sm">
            Testing Gun operations step by step. Run each test individually to see what works.
          </Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Column spacing="sm">
            <Row spacing="sm">
              <Button onClick={test1_DirectSet} size="sm">
                Test 1: gun.set()
              </Button>
              <Button onClick={test2_DirectPut} size="sm">
                Test 2: gun.put()
              </Button>
              <Button onClick={test3_Subscription} size="sm">
                Test 3: gun.on()
              </Button>
            </Row>
            <Row spacing="sm">
              <Button onClick={test4_MapOn} size="sm">
                Test 4: gun.map().on()
              </Button>
              <Button onClick={test5_ReactState} size="sm">
                Test 5: React State
              </Button>
              <Button onClick={clearResults} variant="outline" size="sm">
                Clear Results
              </Button>
            </Row>
          </Column>
        </CardContent>
      </Card>

      {counter > 0 && (
        <Card>
          <CardContent>
            <Text size="xl" weight="bold">React State Counter: {counter}</Text>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <Text variant="muted" size="sm">
              No tests run yet. Click a test button above.
            </Text>
          ) : (
            <Column spacing="xs">
              {testResults.map((result, i) => (
                <Text
                  key={i}
                  size="sm"
                  className={result.includes('✅') ? 'text-green-600' : result.includes('❌') ? 'text-red-600' : ''}
                >
                  {result}
                </Text>
              ))}
            </Column>
          )}
        </CardContent>
      </Card>
    </Column>
  );
}
