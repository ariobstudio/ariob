import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type LogLevel = 'info' | 'success' | 'error' | 'warn';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

interface TestLoggerProps {
  logs: LogEntry[];
  maxHeight?: number;
}

export function TestLogger({ logs, maxHeight = 400 }: TestLoggerProps) {
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs.length]);

  const getLevelStyle = (level: LogLevel) => {
    switch (level) {
      case 'success':
        return styles.successLog;
      case 'error':
        return styles.errorLog;
      case 'warn':
        return styles.warnLog;
      default:
        return styles.infoLog;
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.header}>
        Console Logs ({logs.length})
      </ThemedText>
      <ScrollView
        ref={scrollViewRef}
        style={[styles.logContainer, { maxHeight }]}
        contentContainerStyle={styles.logContent}
      >
        {logs.length === 0 ? (
          <ThemedText style={styles.emptyText}>No logs yet...</ThemedText>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={[styles.logEntry, getLevelStyle(log.level)]}>
              <View style={styles.logHeader}>
                <Text style={styles.logIcon}>{getLevelIcon(log.level)}</Text>
                <ThemedText style={styles.timestamp}>
                  {log.timestamp.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  })}
                </ThemedText>
                <ThemedText style={styles.level}>{log.level.toUpperCase()}</ThemedText>
              </View>
              <ThemedText style={styles.message}>{log.message}</ThemedText>
              {log.data !== undefined && (
                <View style={styles.dataContainer}>
                  <ThemedText style={styles.dataLabel}>Data:</ThemedText>
                  <ThemedText style={styles.data}>
                    {typeof log.data === 'string'
                      ? log.data
                      : JSON.stringify(log.data, null, 2)}
                  </ThemedText>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logContainer: {
    backgroundColor: '#1e1e1e',
  },
  logContent: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.5,
    color: '#999',
  },
  logEntry: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  infoLog: {
    backgroundColor: '#2d2d2d',
    borderLeftColor: '#4a9eff',
  },
  successLog: {
    backgroundColor: '#1e3a1e',
    borderLeftColor: '#4caf50',
  },
  errorLog: {
    backgroundColor: '#3a1e1e',
    borderLeftColor: '#f44336',
  },
  warnLog: {
    backgroundColor: '#3a351e',
    borderLeftColor: '#ff9800',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.7,
    marginRight: 8,
    color: '#999',
  },
  level: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.8,
    color: '#ccc',
  },
  message: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 18,
    color: '#e0e0e0',
  },
  dataContainer: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    color: '#888',
  },
  data: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
    color: '#aaa',
  },
});

// Hook for managing logs
export function useTestLogger() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);

  const log = React.useCallback((level: LogLevel, message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
    };
    setLogs(prev => [...prev, entry]);

    // Also log to console
    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         console.log;
    consoleMethod(`[${level.toUpperCase()}] ${message}`, data || '');
  }, []);

  const info = React.useCallback((message: string, data?: any) => log('info', message, data), [log]);
  const success = React.useCallback((message: string, data?: any) => log('success', message, data), [log]);
  const error = React.useCallback((message: string, data?: any) => log('error', message, data), [log]);
  const warn = React.useCallback((message: string, data?: any) => log('warn', message, data), [log]);

  const clear = React.useCallback(() => {
    setLogs([]);
    console.clear();
  }, []);

  return {
    logs,
    info,
    success,
    error,
    warn,
    clear,
  };
}
