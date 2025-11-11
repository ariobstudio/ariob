import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import '@ariob/core';
import { pair, sign, verify, encrypt as seaEncrypt, decrypt as seaDecrypt, work } from '@ariob/core';

interface BenchmarkResult {
  operation: string;
  dataSize: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  opsPerSec: number;
}

interface TestSuite {
  name: string;
  results: BenchmarkResult[];
  error?: string;
}

export default function BenchmarkScreen() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [suites, setSuites] = useState<TestSuite[]>([]);

  useEffect(() => {
    // Auto-run benchmarks on mount
    runBenchmarks();
  }, []);

  // Helper to convert data to format accepted by crypto APIs
  const toArrayBuffer = (data: Uint8Array): ArrayBuffer => {
    // For React Native/Expo, we might need the typed array itself
    // For web, we need the underlying ArrayBuffer
    return data.buffer;
  };

  const runBenchmarks = async () => {
    setRunning(true);
    setSuites([]);

    const allSuites: TestSuite[] = [];

    // Suite 1: Key Generation (SEA pair)
    setProgress('Testing SEA key generation...');
    allSuites.push(await benchmarkKeyGeneration());

    // Suite 2: PBKDF2 (work function)
    setProgress('Testing SEA PBKDF2 (work)...');
    allSuites.push(await benchmarkPBKDF2());

    // Suite 3: Signing & Verification
    setProgress('Testing SEA signing & verification...');
    allSuites.push(await benchmarkSigning());

    // Suite 4: SEA Encryption/Decryption
    setProgress('Testing SEA encryption/decryption...');
    allSuites.push(await benchmarkSEAEncryption());

    setSuites(allSuites);
    setProgress('Benchmarks complete!');
    setRunning(false);
  };

  // Benchmark 1: SEA Key Generation
  const benchmarkKeyGeneration = async (): Promise<TestSuite> => {
    const results: BenchmarkResult[] = [];

    try {
      // Test SEA key pair generation
      const iterations = 50;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        await pair();
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / iterations;

      results.push({
        operation: 'SEA pair() - ECDSA Key Generation',
        dataSize: 'P-256',
        iterations,
        totalTime,
        avgTime,
        opsPerSec: 1000 / avgTime,
      });
    } catch (error: any) {
      console.error('[Benchmark] Key generation error:', error);
      return { name: 'SEA Key Generation', results, error: error.message };
    }

    return { name: 'SEA Key Generation', results };
  };

  // Benchmark 2: PBKDF2
  const benchmarkPBKDF2 = async (): Promise<TestSuite> => {
    const results: BenchmarkResult[] = [];

    try {
      const testData = 'test-password-for-benchmarking';
      const iterations = 10;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        await work(testData, undefined);
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / iterations;

      results.push({
        operation: 'PBKDF2 (100k iterations)',
        dataSize: `${testData.length} bytes`,
        iterations,
        totalTime,
        avgTime,
        opsPerSec: 1000 / avgTime,
      });
    } catch (error: any) {
      return { name: 'PBKDF2', results, error: error.message };
    }

    return { name: 'PBKDF2', results };
  };

  // Benchmark 4: Signing & Verification
  const benchmarkSigning = async (): Promise<TestSuite> => {
    const results: BenchmarkResult[] = [];
    const sizes = [
      { name: '1 KB', size: 1024 },
      { name: '10 KB', size: 10 * 1024 },
      { name: '100 KB', size: 100 * 1024 },
      { name: '1 MB', size: 1024 * 1024 },
    ];

    try {
      const keyPair = await pair();
      if (!keyPair.value) {
        throw new Error('Failed to generate key pair');
      }

      for (const { name, size } of sizes) {
        const data = 'x'.repeat(size);

        // Signing benchmark - adjust iterations based on data size
        const signIterations = size >= 1024 * 1024 ? 5 : size >= 100 * 1024 ? 10 : 20;
        const signStart = performance.now();

        let signResult;
        for (let i = 0; i < signIterations; i++) {
          signResult = await sign(data, keyPair.value);
        }

        const signEnd = performance.now();
        const signTotalTime = signEnd - signStart;
        const signAvgTime = signTotalTime / signIterations;

        results.push({
          operation: 'ECDSA Sign',
          dataSize: name,
          iterations: signIterations,
          totalTime: signTotalTime,
          avgTime: signAvgTime,
          opsPerSec: 1000 / signAvgTime,
        });

        // Verification benchmark - adjust iterations based on data size
        if (signResult && signResult.ok) {
          const signature = signResult.value;
          const verifyIterations = size >= 1024 * 1024 ? 5 : size >= 100 * 1024 ? 10 : 20;
          const verifyStart = performance.now();

          for (let i = 0; i < verifyIterations; i++) {
            await verify(signature, keyPair.value.pub);
          }

          const verifyEnd = performance.now();
          const verifyTotalTime = verifyEnd - verifyStart;
          const verifyAvgTime = verifyTotalTime / verifyIterations;

          results.push({
            operation: 'ECDSA Verify',
            dataSize: name,
            iterations: verifyIterations,
            totalTime: verifyTotalTime,
            avgTime: verifyAvgTime,
            opsPerSec: 1000 / verifyAvgTime,
          });
        }
      }
    } catch (error: any) {
      return { name: 'Signing & Verification', results, error: error.message };
    }

    return { name: 'Signing & Verification', results };
  };

  // Benchmark 4: SEA Encryption/Decryption
  const benchmarkSEAEncryption = async (): Promise<TestSuite> => {
    const results: BenchmarkResult[] = [];
    const sizes = [
      { name: '1 KB', size: 1024 },
      { name: '10 KB', size: 10 * 1024 },
      { name: '100 KB', size: 100 * 1024 },
      { name: '500 KB', size: 500 * 1024 },
      { name: '1 MB', size: 1024 * 1024 },
    ];

    try {
      const keyPair = await pair();
      if (!keyPair.value) {
        throw new Error('Failed to generate key pair');
      }

      for (const { name, size } of sizes) {
        const data = 'x'.repeat(size);

        // Encryption benchmark - adjust iterations based on data size
        const encIterations = size >= 1024 * 1024 ? 3 : size >= 500 * 1024 ? 5 : size >= 100 * 1024 ? 8 : 10;
        const encStart = performance.now();
        let encResult;

        for (let i = 0; i < encIterations; i++) {
          encResult = await seaEncrypt(data, keyPair.value);
        }

        const encEnd = performance.now();
        const encTotalTime = encEnd - encStart;
        const encAvgTime = encTotalTime / encIterations;

        results.push({
          operation: 'SEA Encrypt',
          dataSize: name,
          iterations: encIterations,
          totalTime: encTotalTime,
          avgTime: encAvgTime,
          opsPerSec: 1000 / encAvgTime,
        });

        // Decryption benchmark - adjust iterations based on data size
        if (encResult && encResult.ok) {
          const encrypted = encResult.value;
          const decIterations = size >= 1024 * 1024 ? 3 : size >= 500 * 1024 ? 5 : size >= 100 * 1024 ? 8 : 10;
          const decStart = performance.now();

          for (let i = 0; i < decIterations; i++) {
            await seaDecrypt(encrypted, keyPair.value);
          }

          const decEnd = performance.now();
          const decTotalTime = decEnd - decStart;
          const decAvgTime = decTotalTime / decIterations;

          results.push({
            operation: 'SEA Decrypt',
            dataSize: name,
            iterations: decIterations,
            totalTime: decTotalTime,
            avgTime: decAvgTime,
            opsPerSec: 1000 / decAvgTime,
          });
        }
      }
    } catch (error: any) {
      console.error('[Benchmark] SEA encryption error:', error);
      return { name: 'SEA Encryption', results, error: error.message };
    }

    return { name: 'SEA Encryption', results };
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">SEA Crypto Benchmark</ThemedText>
        <ThemedText style={styles.subtitle}>
          Gun.js SEA performance testing
        </ThemedText>
      </ThemedView>

      {running && (
        <ThemedView style={styles.loadingSection}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.progress}>{progress}</ThemedText>
        </ThemedView>
      )}

      {suites.map((suite, suiteIdx) => (
        <ThemedView key={suiteIdx} style={styles.suite}>
          <ThemedText type="subtitle">{suite.name}</ThemedText>

          {suite.error && (
            <ThemedView style={styles.errorBox}>
              <ThemedText style={styles.errorText}>Error: {suite.error}</ThemedText>
            </ThemedView>
          )}

          {suite.results.map((result, resultIdx) => (
            <ThemedView key={resultIdx} style={styles.resultCard}>
              <ThemedText style={styles.operation}>{result.operation}</ThemedText>
              <ThemedText style={styles.dataSize}>Data: {result.dataSize}</ThemedText>

              <ThemedView style={styles.metrics}>
                <ThemedView style={styles.metric}>
                  <ThemedText style={styles.metricLabel}>Iterations</ThemedText>
                  <ThemedText style={styles.metricValue}>{result.iterations}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.metric}>
                  <ThemedText style={styles.metricLabel}>Avg Time</ThemedText>
                  <ThemedText style={styles.metricValue}>
                    {result.avgTime.toFixed(2)}ms
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.metric}>
                  <ThemedText style={styles.metricLabel}>Ops/Sec</ThemedText>
                  <ThemedText style={styles.metricValue}>
                    {result.opsPerSec.toFixed(0)}
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.metric}>
                  <ThemedText style={styles.metricLabel}>Total Time</ThemedText>
                  <ThemedText style={styles.metricValue}>
                    {result.totalTime.toFixed(0)}ms
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      ))}

      {!running && suites.length > 0 && (
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Benchmarks completed. Higher ops/sec is better.
          </ThemedText>
        </ThemedView>
      )}
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
  },
  loadingSection: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  progress: {
    fontSize: 16,
    opacity: 0.8,
  },
  suite: {
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  operation: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataSize: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metric: {
    flex: 1,
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    opacity: 0.7,
    textAlign: 'center',
  },
});
