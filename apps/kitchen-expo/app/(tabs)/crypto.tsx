import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TestLogger, useTestLogger } from '@/components/test-logger';
import {
  pair,
  sign,
  verify,
  encrypt,
  decrypt,
  work,
  secret,
  certify,
  encryptData,
  decryptData,
  isEncrypted,
  KeyPair,
} from '@ariob/core';

export default function CryptoTestScreen() {
  const logger = useTestLogger();
  const [inputText, setInputText] = useState('Hello from Ariob!');
  const [password, setPassword] = useState('test-password-123');
  const [keyPair1, setKeyPair1] = useState<KeyPair | null>(null);
  const [keyPair2, setKeyPair2] = useState<KeyPair | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    logger.info('Crypto Test Screen mounted');
  }, []);

  /**
   * TEST: pair()
   * Method: @ariob/core/crypto - pair()
   * Purpose: Generate ECDSA keypair for signing and encryption
   * Returns: Result<KeyPair, Error> with { pub, priv, epub, epriv }
   * Runtime: Uses native WebCrypto for 10-100x performance
   */
  const testPair = async () => {
    try {
      logger.info('🔑 Testing pair() - Generate ECDSA key pair');
      logger.info('Method: pair() → Result<KeyPair, Error>');
      const result = await pair();

      if (result.ok && result.value) {
        setKeyPair1(result.value);
        logger.success('Key pair generated successfully', {
          pub: result.value.pub?.substring(0, 30) + '...',
          epub: result.value.epub?.substring(0, 30) + '...',
        });
      } else {
        logger.error('Failed to generate key pair', result.error);
      }
    } catch (error: any) {
      logger.error('pair() error', error.message);
    }
  };

  /**
   * TEST: work()
   * Method: @ariob/core/crypto - work(data, salt?)
   * Purpose: PBKDF2 password hashing with configurable salt
   * Returns: Result<string, Error> with proof-of-work hash
   * Use Case: Password verification, rate limiting
   */
  const testWork = async () => {
    try {
      logger.info('🔐 Testing work() - PBKDF2 password hashing');
      logger.info('Method: work(data, salt?) → Result<string, Error>');
      const result = await work(password, undefined);

      if (result.ok && result.value) {
        logger.success('PBKDF2 hash generated', {
          hash: result.value.substring(0, 40) + '...',
          length: result.value.length,
        });
      } else {
        logger.error('work() failed', result.error);
      }
    } catch (error: any) {
      logger.error('work() error', error.message);
    }
  };

  /**
   * TEST: sign() and verify()
   * Methods:
   *   - sign(data, keypair) → Result<signature, Error>
   *   - verify(signature, publicKey) → Result<data, Error>
   * Purpose: ECDSA signing and signature verification
   * Use Case: Data integrity, authentication, non-repudiation
   */
  const testSignVerify = async () => {
    try {
      if (!keyPair1) {
        logger.warn('Please generate a key pair first');
        return;
      }

      logger.info('✍️ Testing sign() - ECDSA signing');
      logger.info('Method: sign(data, keypair) → Result<signature, Error>');
      const signResult = await sign(inputText, keyPair1);

      if (!signResult.ok || !signResult.value) {
        logger.error('sign() failed', signResult.error);
        return;
      }

      const signature = signResult.value;
      logger.success('Data signed successfully', {
        signature: signature.substring(0, 50) + '...',
      });

      logger.info('✅ Testing verify() - ECDSA signature verification');
      logger.info('Method: verify(signature, publicKey) → Result<data, Error>');
      const verifyResult = await verify(signature, keyPair1.pub!);

      if (verifyResult.ok && verifyResult.value) {
        logger.success('Signature verified!', {
          message: verifyResult.value,
        });

        if (verifyResult.value === inputText) {
          logger.success('✅ Decrypted message matches original!');
        } else {
          logger.error('❌ Decrypted message does not match', {
            original: inputText,
            decrypted: verifyResult.value,
          });
        }
      } else {
        logger.error('verify() failed', verifyResult.error);
      }
    } catch (error: any) {
      logger.error('Sign/Verify error', error.message);
    }
  };

  /**
   * TEST: encrypt() and decrypt()
   * Methods:
   *   - encrypt(data, keys) → Result<encrypted, Error>
   *   - decrypt(encrypted, keys) → Result<data, Error>
   * Purpose: Symmetric encryption using keypair
   * Use Case: Private data storage, encrypted messaging
   */
  const testEncryptDecrypt = async () => {
    try {
      if (!keyPair1) {
        logger.warn('Please generate a key pair first');
        return;
      }

      logger.info('🔒 Testing encrypt() - SEA encryption with key pair');
      logger.info('Method: encrypt(data, keys) → Result<encrypted, Error>');
      const encryptResult = await encrypt(inputText, keyPair1);

      if (!encryptResult.ok || !encryptResult.value) {
        logger.error('encrypt() failed', encryptResult.error);
        return;
      }

      const encrypted = encryptResult.value;
      logger.success('Data encrypted successfully', {
        encrypted: encrypted.substring(0, 50) + '...',
        isEncrypted: isEncrypted(encrypted),
      });

      logger.info('🔓 Testing decrypt() - SEA decryption');
      logger.info('Method: decrypt(encrypted, keys) → Result<data, Error>');
      const decryptResult = await decrypt(encrypted, keyPair1);

      if (decryptResult.ok && decryptResult.value) {
        logger.success('Data decrypted successfully', {
          decrypted: decryptResult.value,
        });

        if (decryptResult.value === inputText) {
          logger.success('✅ Decrypted data matches original!');
        } else {
          logger.error('❌ Decrypted data does not match', {
            original: inputText,
            decrypted: decryptResult.value,
          });
        }
      } else {
        logger.error('decrypt() failed', decryptResult.error);
      }
    } catch (error: any) {
      logger.error('Encrypt/Decrypt error', error.message);
    }
  };

  /**
   * TEST: secret()
   * Method: @ariob/core/crypto - secret(theirPublicKey, myKeypair)
   * Purpose: ECDH shared secret generation for encrypted channels
   * Returns: Result<sharedSecret, Error>
   * Use Case: Encrypted peer-to-peer communication
   * Note: Both parties derive same secret using each other's public key
   */
  const testSecret = async () => {
    try {
      if (!keyPair1 || !keyPair2) {
        logger.warn('Please generate TWO key pairs first (click Generate Key Pair twice)');
        return;
      }

      logger.info('🤝 Testing secret() - ECDH shared secret generation');
      logger.info('Method: secret(theirEpub, myKeypair) → Result<sharedSecret, Error>');
      logger.info('Generating shared secret between two key pairs...');

      const secret1Result = await secret(keyPair2.epub!, keyPair1);
      if (!secret1Result.ok || !secret1Result.value) {
        logger.error('secret() from perspective 1 failed', secret1Result.error);
        return;
      }

      const secret2Result = await secret(keyPair1.epub!, keyPair2);
      if (!secret2Result.ok || !secret2Result.value) {
        logger.error('secret() from perspective 2 failed', secret2Result.error);
        return;
      }

      logger.success('Shared secrets generated', {
        secret1: secret1Result.value.substring(0, 30) + '...',
        secret2: secret2Result.value.substring(0, 30) + '...',
      });

      if (secret1Result.value === secret2Result.value) {
        logger.success('✅ Both parties derived the same shared secret! ECDH working correctly.');
      } else {
        logger.error('❌ Shared secrets do not match!');
      }
    } catch (error: any) {
      logger.error('secret() error', error.message);
    }
  };

  const testEncryptDataDecryptData = async () => {
    try {
      logger.info('🔐 Testing data encryption with key pair');

      if (!keyPair1) {
        logger.warn('Please generate a key pair first');
        return;
      }

      // Test keypair-based encryption (not password-based)
      logger.info('Step 1: Encrypting data with key pair...');
      const encryptResult = await encrypt(inputText, keyPair1);
      if (!encryptResult.ok || !encryptResult.value) {
        logger.error('encrypt() failed', encryptResult.error);
        return;
      }

      const encrypted = encryptResult.value;
      logger.success('Data encrypted with key pair', {
        encrypted: typeof encrypted === 'string' ? encrypted.substring(0, 50) + '...' : encrypted,
        isEncrypted: isEncrypted(encrypted),
      });

      // Step 2: Decrypt with same key pair
      logger.info('Step 2: Decrypting data with key pair...');
      const decryptResult = await decrypt(encrypted, keyPair1);

      if (decryptResult.ok && decryptResult.value) {
        logger.success('Data decrypted successfully', {
          decrypted: decryptResult.value,
        });

        if (decryptResult.value === inputText) {
          logger.success('✅ Decrypted data matches original!');
        } else {
          logger.error('❌ Decrypted data does not match', {
            original: inputText,
            decrypted: decryptResult.value,
          });
        }
      } else {
        logger.error('decrypt() failed', decryptResult.error);
      }
    } catch (error: any) {
      logger.error('Keypair encryption error', error.message);
    }
  };

  /**
   * TEST: certify()
   * Method: @ariob/core/crypto - certify(certificants, policy, authority, expiration?)
   * Purpose: Create authorization certificates for delegation
   * Returns: Result<certificate, Error>
   * Use Case: Grant write access to specific paths, role-based permissions
   */
  const testCertify = async () => {
    try {
      if (!keyPair1 || !keyPair2) {
        logger.warn('Please generate TWO key pairs first');
        return;
      }

      logger.info('📜 Testing certify() - Create certificate for delegation');
      logger.info('Method: certify(certificants, policy, authority, expiration?) → Result<cert, Error>');

      const certResult = await certify(
        [keyPair2.pub!], // Allow keyPair2 to access
        [{ '*': 'profile' }], // Access to profile path
        keyPair1, // Signed by keyPair1
        undefined, // No expiration
        { '*': 'profile' } // Policy
      );

      if (certResult.ok && certResult.value) {
        logger.success('Certificate created successfully', {
          cert: JSON.stringify(certResult.value).substring(0, 100) + '...',
        });
      } else {
        logger.error('certify() failed', certResult.error);
      }
    } catch (error: any) {
      logger.error('certify() error', error.message);
    }
  };

  const runAllTests = async () => {
    if (isLoading) return;
    setIsLoading(true);
    logger.info('🧪 Running complete crypto test suite...');

    try {
      await testPair();
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate second key pair for secret test
      logger.info('Generating second key pair for ECDH test...');
      const pair2Result = await pair();
      if (pair2Result.ok && pair2Result.value) {
        setKeyPair2(pair2Result.value);
        logger.success('Second key pair generated');
      }
      await new Promise(resolve => setTimeout(resolve, 300));

      await testWork();
      await new Promise(resolve => setTimeout(resolve, 300));

      await testSignVerify();
      await new Promise(resolve => setTimeout(resolve, 300));

      await testEncryptDecrypt();
      await new Promise(resolve => setTimeout(resolve, 300));

      if (pair2Result.ok && pair2Result.value) {
        await testSecret();
        await new Promise(resolve => setTimeout(resolve, 300));

        await testCertify();
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      await testEncryptDataDecryptData();

      logger.success('🎉 All crypto tests completed!');
    } catch (error: any) {
      logger.error('Test suite error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Crypto API Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test all SEA crypto functions: pair, sign, verify, encrypt, decrypt, work, secret, certify
        </ThemedText>
      </ThemedView>

      {/* Input Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Test Data</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Message to encrypt/sign"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </ThemedView>

      {/* Key Pair Status */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Key Pairs</ThemedText>
        <ThemedView style={styles.statusCard}>
          <ThemedText style={styles.statusLabel}>Key Pair 1:</ThemedText>
          <ThemedText style={keyPair1 ? styles.statusYes : styles.statusNo}>
            {keyPair1 ? '✓ Generated' : '✗ Not generated'}
          </ThemedText>
          <ThemedText style={styles.statusLabel}>Key Pair 2:</ThemedText>
          <ThemedText style={keyPair2 ? styles.statusYes : styles.statusNo}>
            {keyPair2 ? '✓ Generated' : '✗ Not generated'}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Individual Tests</ThemedText>

        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={testPair}>
          <ThemedText style={styles.buttonText}>Generate Key Pair</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testWork}>
          <ThemedText style={styles.buttonText}>Test PBKDF2 (work)</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testSignVerify}>
          <ThemedText style={styles.buttonText}>Test Sign & Verify</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonInfo]} onPress={testEncryptDecrypt}>
          <ThemedText style={styles.buttonText}>Test Encrypt & Decrypt</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testSecret}>
          <ThemedText style={styles.buttonText}>Test ECDH Secret</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonWarning]} onPress={testCertify}>
          <ThemedText style={styles.buttonText}>Test Certify</ThemedText>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={testEncryptDataDecryptData}>
          <ThemedText style={styles.buttonText}>Test Data Encryption (KeyPair)</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonSuccess, isLoading && styles.buttonDisabled]}
          onPress={runAllTests}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Running...' : 'Run All Tests'}
          </ThemedText>
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
  buttonDisabled: {
    opacity: 0.5,
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
