import {
  digest,
  generateKey,
  importKey,
  exportKey,
  encrypt,
  decrypt,
  sign,
  verify,
  deriveBits,
  getRandomValues,
} from 'expo-webcrypto';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TestResult = {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  details: string[];
  duration?: number;
};

export default function App() {
  const [results, setResults] = useState<TestResult[]>([
    { name: '1. SHA-256 Hash', status: 'pending', details: [] },
    { name: '2. SHA-384 Hash', status: 'pending', details: [] },
    { name: '3. SHA-512 Hash', status: 'pending', details: [] },
    { name: '4. AES-GCM 128-bit', status: 'pending', details: [] },
    { name: '5. AES-GCM 256-bit', status: 'pending', details: [] },
    { name: '6. ECDSA Sign/Verify', status: 'pending', details: [] },
    { name: '7. ECDH Key Agreement', status: 'pending', details: [] },
    { name: '8. PBKDF2 Derivation', status: 'pending', details: [] },
    { name: '9. Random Generation', status: 'pending', details: [] },
    { name: '10. JWK Export/Import (AES)', status: 'pending', details: [] },
    { name: '11. JWK Export/Import (ECDSA)', status: 'pending', details: [] },
    { name: '12. Raw Key Import', status: 'pending', details: [] },
  ]);

  const updateResult = (
    index: number,
    status: TestResult['status'],
    details: string[] = [],
    duration?: number
  ) => {
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, status, details, duration } : r))
    );
  };

  const runTests = async () => {
    // Test 1: SHA-256 Hash
    updateResult(0, 'running', ['Computing SHA-256 hash...']);
    try {
      const start = Date.now();
      const input = 'Hello, Crypto World!';
      const data = btoa(input);
      const hash = digest({ name: 'SHA-256' }, data);

      if (hash && !hash.includes('Error')) {
        const duration = Date.now() - start;
        updateResult(
          0,
          'success',
          [
            `✓ Input: "${input}"`,
            `✓ Hash (first 32 chars): ${hash.substring(0, 32)}...`,
            `✓ Hash length: ${hash.length} chars`,
          ],
          duration
        );
      } else {
        updateResult(0, 'error', [`✗ Error: ${hash}`]);
      }
    } catch (error) {
      updateResult(0, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 2: SHA-384 Hash
    updateResult(1, 'running', ['Computing SHA-384 hash...']);
    try {
      const start = Date.now();
      const input = 'Hello, Crypto World!';
      const data = btoa(input);
      const hash = digest({ name: 'SHA-384' }, data);

      if (hash && !hash.includes('Error')) {
        const duration = Date.now() - start;
        updateResult(
          1,
          'success',
          [
            `✓ Input: "${input}"`,
            `✓ Hash (first 32 chars): ${hash.substring(0, 32)}...`,
            `✓ Hash length: ${hash.length} chars`,
          ],
          duration
        );
      } else {
        updateResult(1, 'error', [`✗ Error: ${hash}`]);
      }
    } catch (error) {
      updateResult(1, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 3: SHA-512 Hash
    updateResult(2, 'running', ['Computing SHA-512 hash...']);
    try {
      const start = Date.now();
      const input = 'Hello, Crypto World!';
      const data = btoa(input);
      const hash = digest({ name: 'SHA-512' }, data);
      console.log(hash)
      if (hash && !hash.includes('Error')) {
        const duration = Date.now() - start;
        updateResult(
          2,
          'success',
          [
            `✓ Input: "${input}"`,
            `✓ Hash (first 32 chars): ${hash.substring(0, 32)}...`,
            `✓ Hash length: ${hash.length} chars`,
          ],
          duration
        );
      } else {
        updateResult(2, 'error', [`✗ Error: ${hash}`]);
      }
    } catch (error) {
      updateResult(2, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 4: AES-GCM 128-bit
    updateResult(3, 'running', ['Testing AES-GCM with 128-bit key...']);
    try {
      const start = Date.now();
      const keyResult = generateKey({ name: 'AES-GCM', length: 128 }, true, [
        'encrypt',
        'decrypt',
      ]) as any;

      if (keyResult.error) {
        updateResult(3, 'error', [`✗ Key generation failed: ${keyResult.error}`]);
      } else {
        const keyHandle = keyResult.secretKeyHandle;
        const iv = getRandomValues(12);
        const plaintext = btoa('Secret message 128!');

        const ciphertext = encrypt({ name: 'AES-GCM', iv }, keyHandle, plaintext);

        if (ciphertext.includes('Error')) {
          updateResult(3, 'error', [`✗ Encryption failed: ${ciphertext}`]);
        } else {
          const decrypted = decrypt({ name: 'AES-GCM', iv }, keyHandle, ciphertext);

          if (decrypted === plaintext) {
            const duration = Date.now() - start;
            updateResult(
              3,
              'success',
              [
                `✓ Key generated: 128-bit`,
                `✓ IV length: ${iv.length} chars`,
                `✓ Plaintext: "${atob(plaintext)}"`,
                `✓ Encrypted successfully`,
                `✓ Decrypted successfully`,
                `✓ Round-trip verified`,
              ],
              duration
            );
          } else {
            updateResult(3, 'error', [`✗ Decryption mismatch`]);
          }
        }
      }
    } catch (error) {
      updateResult(3, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 5: AES-GCM 256-bit
    updateResult(4, 'running', ['Testing AES-GCM with 256-bit key...']);
    try {
      const start = Date.now();
      const keyResult = generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
      ]) as any;

      if (keyResult.error) {
        updateResult(4, 'error', [`✗ Key generation failed: ${keyResult.error}`]);
      } else {
        const keyHandle = keyResult.secretKeyHandle;
        const iv = getRandomValues(12);
        const plaintext = btoa('Secret message 256!');
        console.log("Plaintext: ", plaintext)
        const ciphertext = encrypt({ name: 'AES-GCM', iv }, keyHandle, plaintext);
        console.log("Ciphertext: ", ciphertext)
        if (!ciphertext.includes('Error')) {
          const decrypted = decrypt({ name: 'AES-GCM', iv }, keyHandle, ciphertext);
          console.log("Decrypted: ", decrypted)
          if (decrypted === plaintext) {
            const duration = Date.now() - start;
            updateResult(
              4,
              'success',
              [
                `✓ Key generated: 256-bit`,
                `✓ IV length: ${iv.length} chars`,
                `✓ Ciphertext length: ${ciphertext.length} chars`,
                `✓ Encrypted successfully`,
                `✓ Decrypted successfully`,
                `✓ Round-trip verified`,
              ],
              duration
            );
          } else {
            updateResult(4, 'error', [`✗ Decryption mismatch`]);
          }
        } else {
          updateResult(4, 'error', [`✗ Encryption failed: ${ciphertext}`]);
        }
      }
    } catch (error) {
      updateResult(4, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 6: ECDSA Sign/Verify
    updateResult(5, 'running', ['Testing ECDSA P-256 signatures...']);
    try {
      const start = Date.now();
      const keyPair = generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
        'sign',
        'verify',
      ]) as any;

      if (keyPair.error) {
        updateResult(5, 'error', [`✗ Key generation failed: ${keyPair.error}`]);
      } else {
        const message = btoa('Sign this important message');
        console.log("Message: ", message)
        const signature = sign(
          { name: 'ECDSA', hash: { name: 'SHA-256' } },
          keyPair.privateKey,
          message
        );
        console.log("Signature: ", signature)
        if (!signature.includes('Error')) {
          const isValid = verify(
            { name: 'ECDSA', hash: { name: 'SHA-256' } },
            keyPair.publicKey,
            signature,
            message
          );
          // Test with wrong message
          const wrongMessage = btoa('Different message');
          const isInvalid = verify(
            { name: 'ECDSA', hash: { name: 'SHA-256' } },
            keyPair.publicKey,
            signature,
            wrongMessage
          );

          const duration = Date.now() - start;
          if (isValid === 1 && isInvalid === 0) {
            updateResult(
              5,
              'success',
              [
                `✓ Key pair generated (P-256)`,
                `✓ Message: "${atob(message)}"`,
                `✓ Signature length: ${signature.length} chars`,
                `✓ Signature verified: valid`,
                `✓ Wrong message rejected: invalid`,
                `✓ Signature validation working correctly`,
              ],
              duration
            );
          } else {
            updateResult(5, 'error', [
              `✗ Verification failed`,
              `  Valid: ${isValid} (expected 1)`,
              `  Invalid: ${isInvalid} (expected 0)`,
            ]);
          }
        } else {
          updateResult(5, 'error', [`✗ Signing failed: ${signature}`]);
        }
      }
    } catch (error) {
      updateResult(5, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 7: ECDH Key Agreement
    updateResult(6, 'running', ['Testing ECDH key agreement...']);
    try {
      const start = Date.now();
      const aliceKeys = generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
        'deriveBits',
      ]) as any;
      const bobKeys = generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
        'deriveBits',
      ]) as any;

      if (aliceKeys.error || bobKeys.error) {
        updateResult(6, 'error', [
          `✗ Key generation failed: ${aliceKeys.error || bobKeys.error}`,
        ]);
      } else {
        const aliceSecret = deriveBits(
          { name: 'ECDH', public: bobKeys.publicKey },
          aliceKeys.privateKey,
          32
        );
        const bobSecret = deriveBits(
          { name: 'ECDH', public: aliceKeys.publicKey },
          bobKeys.privateKey,
          32
        );

        if (aliceSecret === bobSecret && !aliceSecret.includes('Error')) {
          const duration = Date.now() - start;
          updateResult(
            6,
            'success',
            [
              `✓ Alice's key pair generated`,
              `✓ Bob's key pair generated`,
              `✓ Alice derived shared secret`,
              `✓ Bob derived shared secret`,
              `✓ Shared secrets match!`,
              `✓ Secret length: ${aliceSecret.length} chars`,
            ],
            duration
          );
        } else {
          updateResult(6, 'error', [
            `✗ Shared secrets don't match`,
            `  Alice: ${aliceSecret.substring(0, 20)}...`,
            `  Bob: ${bobSecret.substring(0, 20)}...`,
          ]);
        }
      }
    } catch (error) {
      updateResult(6, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 8: PBKDF2 Derivation
    updateResult(7, 'running', ['Testing PBKDF2 key derivation...']);
    try {
      const start = Date.now();
      const password = btoa('my-secure-password-123');
      const passwordHandle = importKey('raw', { raw: password }, { name: 'PBKDF2' }, false, [
        'deriveBits',
      ]);

      if (passwordHandle.includes('Error')) {
        updateResult(7, 'error', [`✗ Password import failed: ${passwordHandle}`]);
      } else {
        const salt = getRandomValues(16);
        const iterations = 100000;
        const derivedKey = deriveBits(
          {
            name: 'PBKDF2',
            salt,
            iterations,
            hash: { name: 'SHA-256' },
          },
          passwordHandle,
          32
        );

        if (derivedKey && !derivedKey.includes('Error')) {
          // Derive again with same params to verify determinism
          const derivedKey2 = deriveBits(
            {
              name: 'PBKDF2',
              salt,
              iterations,
              hash: { name: 'SHA-256' },
            },
            passwordHandle,
            32
          );

          const duration = Date.now() - start;
          if (derivedKey === derivedKey2) {
            updateResult(
              7,
              'success',
              [
                `✓ Password imported successfully`,
                `✓ Salt length: 16 bytes`,
                `✓ Iterations: ${iterations.toLocaleString()}`,
                `✓ Hash: SHA-256`,
                `✓ Derived key length: ${derivedKey.length} chars`,
                `✓ Deterministic: two derivations match`,
              ],
              duration
            );
          } else {
            updateResult(7, 'error', [`✗ Non-deterministic derivation`]);
          }
        } else {
          updateResult(7, 'error', [`✗ Derivation failed: ${derivedKey}`]);
        }
      }
    } catch (error) {
      updateResult(7, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 9: Random Generation
    updateResult(8, 'running', ['Testing random value generation...']);
    try {
      const start = Date.now();
      const random1 = getRandomValues(32);
      const random2 = getRandomValues(32);
      const random3 = getRandomValues(32);

      if (
        random1 &&
        random2 &&
        random3 &&
        !random1.includes('Error') &&
        !random2.includes('Error') &&
        !random3.includes('Error')
      ) {
        if (random1 !== random2 && random2 !== random3 && random1 !== random3) {
          const duration = Date.now() - start;
          updateResult(
            8,
            'success',
            [
              `✓ Generated 3 random values (32 bytes each)`,
              `✓ Random 1 (first 20): ${random1.substring(0, 20)}...`,
              `✓ Random 2 (first 20): ${random2.substring(0, 20)}...`,
              `✓ Random 3 (first 20): ${random3.substring(0, 20)}...`,
              `✓ All values are unique`,
              `✓ Randomness verified`,
            ],
            duration
          );
        } else {
          updateResult(8, 'error', [`✗ Generated duplicate random values!`]);
        }
      } else {
        updateResult(8, 'error', [`✗ Random generation failed`]);
      }
    } catch (error) {
      updateResult(8, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 10: JWK Export/Import (AES)
    updateResult(9, 'running', ['Testing JWK export/import for AES...']);
    try {
      const start = Date.now();
      const keyResult = generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
      ]) as any;

      if (keyResult.error) {
        updateResult(9, 'error', [`✗ Key generation failed: ${keyResult.error}`]);
      } else {
        const jwk = exportKey('jwk', keyResult.secretKeyHandle) as any;

        if (jwk.error) {
          updateResult(9, 'error', [`✗ Export failed: ${jwk.error}`]);
        } else if (jwk.kty === 'oct') {
          const reimportedHandle = importKey('jwk', jwk, { name: 'AES-GCM' }, true, [
            'encrypt',
            'decrypt',
          ]);

          if (!reimportedHandle.includes('Error')) {
            // Test that reimported key works
            const iv = getRandomValues(12);
            const plaintext = btoa('Test JWK import');
            const ciphertext = encrypt({ name: 'AES-GCM', iv }, reimportedHandle, plaintext);
            const decrypted = decrypt({ name: 'AES-GCM', iv }, reimportedHandle, ciphertext);

            const duration = Date.now() - start;
            if (decrypted === plaintext) {
              updateResult(
                9,
                'success',
                [
                  `✓ AES-256 key generated`,
                  `✓ Exported to JWK format`,
                  `✓ JWK type: ${jwk.kty}`,
                  `✓ JWK algorithm: ${jwk.alg}`,
                  `✓ Reimported from JWK`,
                  `✓ Reimported key works correctly`,
                ],
                duration
              );
            } else {
              updateResult(9, 'error', [`✗ Reimported key doesn't work`]);
            }
          } else {
            updateResult(9, 'error', [`✗ Reimport failed: ${reimportedHandle}`]);
          }
        } else {
          updateResult(9, 'error', [`✗ Invalid JWK structure`]);
        }
      }
    } catch (error) {
      updateResult(9, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 11: JWK Export/Import (ECDSA)
    updateResult(10, 'running', ['Testing JWK export/import for ECDSA...']);
    try {
      const start = Date.now();
      const keyPair = generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
        'sign',
        'verify',
      ]) as any;

      if (keyPair.error) {
        updateResult(10, 'error', [`✗ Key generation failed: ${keyPair.error}`]);
      } else {
        const publicJwk = exportKey('jwk', keyPair.publicKey) as any;
        const privateJwk = exportKey('jwk', keyPair.privateKey) as any;

        if (publicJwk.error || privateJwk.error) {
          updateResult(10, 'error', [
            `✗ Export failed: ${publicJwk.error || privateJwk.error}`,
          ]);
        } else if (publicJwk.kty === 'EC' && privateJwk.kty === 'EC') {
          const reimportedPub = importKey(
            'jwk',
            publicJwk,
            { name: 'ECDSA', namedCurve: 'P-256' },
            true,
            ['verify']
          );
          const reimportedPriv = importKey(
            'jwk',
            privateJwk,
            { name: 'ECDSA', namedCurve: 'P-256' },
            true,
            ['sign']
          );

          if (!reimportedPub.includes('Error') && !reimportedPriv.includes('Error')) {
            // Test that reimported keys work
            const message = btoa('Test JWK ECDSA');
            const signature = sign(
              { name: 'ECDSA', hash: { name: 'SHA-256' } },
              reimportedPriv,
              message
            );
            const isValid = verify(
              { name: 'ECDSA', hash: { name: 'SHA-256' } },
              reimportedPub,
              signature,
              message
            );

            const duration = Date.now() - start;
            if (isValid === 1) {
              updateResult(
                10,
                'success',
                [
                  `✓ ECDSA P-256 key pair generated`,
                  `✓ Public key exported to JWK`,
                  `✓ Private key exported to JWK`,
                  `✓ JWK curve: ${publicJwk.crv}`,
                  `✓ Both keys reimported successfully`,
                  `✓ Reimported keys work correctly`,
                ],
                duration
              );
            } else {
              updateResult(10, 'error', [`✗ Reimported keys don't work`]);
            }
          } else {
            updateResult(10, 'error', [`✗ Reimport failed`]);
          }
        } else {
          updateResult(10, 'error', [`✗ Invalid JWK structure`]);
        }
      }
    } catch (error) {
      updateResult(10, 'error', [`✗ Exception: ${String(error)}`]);
    }

    // Test 12: Raw Key Import
    updateResult(11, 'running', ['Testing raw key import...']);
    try {
      const start = Date.now();
      // Generate a key and export it
      const keyResult = generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
      ]) as any;

      if (keyResult.error) {
        updateResult(11, 'error', [`✗ Key generation failed: ${keyResult.error}`]);
      } else {
        const rawExport = exportKey('raw', keyResult.secretKeyHandle) as any;

        if (rawExport.error) {
          updateResult(11, 'error', [`✗ Export failed: ${rawExport.error}`]);
        } else {
          const reimportedHandle = importKey(
            'raw',
            { raw: rawExport.raw },
            { name: 'AES-GCM' },
            true,
            ['encrypt', 'decrypt']
          );

          if (!reimportedHandle.includes('Error')) {
            // Verify the reimported key works
            const iv = getRandomValues(12);
            const plaintext = btoa('Test raw import');
            const ciphertext = encrypt({ name: 'AES-GCM', iv }, reimportedHandle, plaintext);
            const decrypted = decrypt({ name: 'AES-GCM', iv }, reimportedHandle, ciphertext);

            const duration = Date.now() - start;
            if (decrypted === plaintext) {
              updateResult(
                11,
                'success',
                [
                  `✓ AES-256 key generated`,
                  `✓ Exported as raw bytes`,
                  `✓ Raw key length: ${rawExport.raw.length} chars`,
                  `✓ Reimported from raw format`,
                  `✓ Reimported key works correctly`,
                  `✓ Raw import/export verified`,
                ],
                duration
              );
            } else {
              updateResult(11, 'error', [`✗ Reimported key doesn't work`]);
            }
          } else {
            updateResult(11, 'error', [`✗ Reimport failed: ${reimportedHandle}`]);
          }
        }
      }
    } catch (error) {
      updateResult(11, 'error', [`✗ Exception: ${String(error)}`]);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '#999';
      case 'running':
        return '#FF9800';
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '○';
      case 'running':
        return '⟳';
      case 'success':
        return '✓';
      case 'error':
        return '✗';
    }
  };

  const totalTests = results.length;
  const completedTests = results.filter((r) => r.status === 'success' || r.status === 'error')
    .length;
  const successTests = results.filter((r) => r.status === 'success').length;
  const errorTests = results.filter((r) => r.status === 'error').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expo WebCrypto Test Suite</Text>
        <Text style={styles.subtitle}>Comprehensive Cryptography Tests</Text>
        {completedTests > 0 && (
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {successTests}/{totalTests} passed • {errorTests} failed
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={[styles.statusIcon, { color: getStatusColor(result.status) }]}>
                {getStatusIcon(result.status)}
              </Text>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{result.name}</Text>
                {result.duration !== undefined && (
                  <Text style={styles.duration}>{result.duration}ms</Text>
                )}
              </View>
            </View>
            {result.details.length > 0 && (
              <View style={styles.details}>
                {result.details.map((detail, i) => (
                  <Text key={i} style={styles.detailText}>
                    {detail}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={runTests}>
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  stats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  statsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  results: {
    flex: 1,
    padding: 16,
  },
  testItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
    fontWeight: 'bold',
    minWidth: 24,
  },
  testInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  duration: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  details: {
    marginTop: 12,
    marginLeft: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
