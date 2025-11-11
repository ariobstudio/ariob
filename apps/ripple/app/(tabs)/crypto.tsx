import { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import '@ariob/core';
import { pair } from '@ariob/core';

export default function CryptoScreen() {
  const [inputText, setInputText] = useState('Hello, Ariob!');
  const [hashResult, setHashResult] = useState('');
  const [encryptResult, setEncryptResult] = useState('');
  const [decryptResult, setDecryptResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  // Test SHA-256 Hashing
  const testHash = async () => {
    try {
      setLoading(true);
      const data = await pair();

      console.log("ENCODED DATA:", data);
      console.log("HASH RESULT:", data.value?.pub);
      setHashResult(data.value?.pub || 'Error generating pair');
      Alert.alert('Success', 'Hash computed successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Hash error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test AES-GCM Encryption
  const testEncryption = async () => {
    try {
      setLoading(true);

      // Generate a key if we don't have one
      let key = cryptoKey;
      if (!key) {
        console.log("GENERATING KEY...");
        key = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        ) as CryptoKey;
        console.log("KEY GENERATED:", key);
        setCryptoKey(key);
      }

      // Encrypt the data
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      const encryptedArray = Array.from(new Uint8Array(encrypted));
      const ivArray = Array.from(iv);

      setEncryptResult(`IV: ${ivArray.join(',')}\nData: ${encryptedArray.slice(0, 20).join(',')}...`);
      Alert.alert('Success', 'Data encrypted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Encryption error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test AES-GCM Decryption
  const testDecryption = async () => {
    try {
      if (!cryptoKey) {
        Alert.alert('Error', 'Please encrypt some data first to generate a key');
        return;
      }

      setLoading(true);

      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );

      console.log("ENCRYPTED:", encrypted);
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
      );

      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decrypted);

      setDecryptResult(decryptedText);
      console.log("DECRYPTED:", decryptedText);
      Alert.alert('Success', `Decrypted: "${decryptedText}"`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Decryption error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test Random Generation
  const testRandom = () => {
    try {
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const randomHex = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      Alert.alert('Random Bytes', randomHex);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.error('Random error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">WebCrypto Demo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Testing @ariob/webcrypto integration
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Input Text</ThemedText>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter text to test..."
          placeholderTextColor="#999"
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Operations</ThemedText>

        <ThemedView style={styles.buttonContainer}>
          <ThemedView style={styles.button} onTouchEnd={testHash}>
            <ThemedText style={styles.buttonText}>SHA-256 Hash</ThemedText>
          </ThemedView>

          <ThemedView style={styles.button} onTouchEnd={testEncryption}>
            <ThemedText style={styles.buttonText}>AES-GCM Encrypt</ThemedText>
          </ThemedView>

          <ThemedView style={styles.button} onTouchEnd={testDecryption}>
            <ThemedText style={styles.buttonText}>AES-GCM Decrypt</ThemedText>
          </ThemedView>

          <ThemedView style={styles.button} onTouchEnd={testRandom}>
            <ThemedText style={styles.buttonText}>Random Bytes</ThemedText>
          </ThemedView>
        </ThemedView>

        {loading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText>Processing...</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {hashResult && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Hash Result</ThemedText>
          <ThemedView style={styles.resultBox}>
            <ThemedText style={styles.resultText}>{hashResult}</ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {encryptResult && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Encryption Result</ThemedText>
          <ThemedView style={styles.resultBox}>
            <ThemedText style={styles.resultText}>{encryptResult}</ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {decryptResult && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Decryption Result</ThemedText>
          <ThemedView style={styles.resultBox}>
            <ThemedText style={styles.resultText}>{decryptResult}</ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText style={styles.infoText}>
          This demo showcases WebCrypto API integration across all platforms. On web, it uses the native browser WebCrypto API. On iOS and Android, it uses @ariob/webcrypto with CryptoKit and KeyStore respectively for native performance.{'\n\n'}Performance: Native crypto operations are 10-100x faster than pure JavaScript implementations.{'\n\n'}The crypto bridge is automatically detected and loaded when you import @ariob/core.
        </ThemedText>
      </ThemedView>
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
  section: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  resultBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  infoText: {
    marginTop: 8,
    lineHeight: 20,
    opacity: 0.8,
  },
});
