import React, { useState } from 'react';
import { sea } from '@ariob/core';
import { Column, Row} from '@/components/primitives';

interface TestResult {
    step: string;
    success: boolean;
    data?: any;
    error?: string;
}

const TestPage: React.FC = () => {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentStep, setCurrentStep] = useState('');

    const addResult = (step: string, success: boolean, data?: any, error?: string) => {
        setTestResults(prev => [...prev, { step, success, data, error }]);
    };

    const runSEATests = async () => {
        setIsRunning(true);
        setTestResults([]);

        try {
            // Test 1: Generate key pair
            setCurrentStep('Generating key pair...');
            const pair = await new Promise<any>((resolve, reject) => {
                sea.pair((p: any) => p ? resolve(p) : reject(new Error('Failed to generate pair')));
            });
            addResult('Key Pair Generation', true, { 
                pub: pair.pub.substring(0, 50) + '...', 
                priv: '***hidden***' 
            });

            // Test 2: Encrypt data
            setCurrentStep('Encrypting data...');
            const encrypted = await new Promise<string>((resolve, reject) => {
                console.log('pair', pair);
                sea.encrypt('hello self', pair, (enc: string) => 
                    enc ? resolve(enc) : reject(new Error('Encryption failed'))
                );
            });
            addResult('Encryption', true, { encrypted: encrypted.substring(0, 80) + '...' });

            // Test 3: Sign encrypted data
            setCurrentStep('Signing data...');
            const signed = await new Promise<any>((resolve, reject) => {
                sea.sign(encrypted, pair, (data: any) => 
                    data ? resolve(data) : reject(new Error('Signing failed'))
                );
            });
            addResult('Signing', true, { signed: JSON.stringify(signed).substring(0, 100) + '...' });

            // Test 4: Verify signature
            setCurrentStep('Verifying signature...');
            const verified = await new Promise<string>((resolve, reject) => {
                sea.verify(signed, pair.pub, (msg: string) => 
                    msg !== undefined ? resolve(msg) : reject(new Error('Verification failed'))
                );
            });
            addResult('Verification', true, { verified: verified === encrypted });

            // Test 5: Decrypt data
            setCurrentStep('Decrypting data...');
            const decrypted = await new Promise<string>((resolve, reject) => {
                sea.decrypt(verified, pair, (dec: string) => 
                    dec ? resolve(dec) : reject(new Error('Decryption failed'))
                );
            });
            addResult('Decryption', true, { 
                decrypted, 
                matches: decrypted === 'hello self' 
            });

            // Test 6: Work proof
            setCurrentStep('Generating work proof...');
            const proof = await new Promise<string>((resolve, reject) => {
                sea.work(decrypted, pair, (p: string) => 
                    p ? resolve(p) : reject(new Error('Work proof failed'))
                );
            });
            const check = await new Promise<string>((resolve, reject) => {
                sea.work('hello self', pair, (c: string) => 
                    c ? resolve(c) : reject(new Error('Work check failed'))
                );
            });
            addResult('Work Proof', true, { 
                proofMatches: proof === check,
                proof: proof.substring(0, 50) + '...'
            });

            // Test 7: Shared encryption between Alice and Bob
            setCurrentStep('Testing shared encryption (Alice & Bob)...');
            
            // Generate Alice's key pair
            const alice = await new Promise<any>((resolve, reject) => {
                sea.pair((p: any) => p ? resolve(p) : reject(new Error('Failed to generate Alice pair')));
            });
            addResult('Alice Key Pair', true, { 
                pub: alice.pub.substring(0, 50) + '...',
                epub: alice.epub.substring(0, 50) + '...'
            });

            // Generate Bob's key pair
            const bob = await new Promise<any>((resolve, reject) => {
                sea.pair((p: any) => p ? resolve(p) : reject(new Error('Failed to generate Bob pair')));
            });
            addResult('Bob Key Pair', true, { 
                pub: bob.pub.substring(0, 50) + '...',
                epub: bob.epub.substring(0, 50) + '...'
            });

            // Alice creates shared secret with Bob's epub
            setCurrentStep('Alice creating shared secret...');
            const aliceSecret = await new Promise<any>((resolve, reject) => {
                sea.secret(bob.epub, alice, (aes: any) => 
                    aes ? resolve(aes) : reject(new Error('Alice secret generation failed'))
                );
            });
            addResult('Alice Shared Secret', true, { created: true });

            // Alice encrypts data with shared secret
            setCurrentStep('Alice encrypting shared data...');
            const sharedEncrypted = await new Promise<string>((resolve, reject) => {
                sea.encrypt('shared data', aliceSecret, (enc: string) => 
                    enc ? resolve(enc) : reject(new Error('Shared encryption failed'))
                );
            });
            addResult('Shared Data Encryption', true, { 
                encrypted: sharedEncrypted.substring(0, 80) + '...' 
            });

            // Bob creates shared secret with Alice's epub
            setCurrentStep('Bob creating shared secret...');
            const bobSecret = await new Promise<any>((resolve, reject) => {
                sea.secret(alice.epub, bob, (aes: any) => 
                    aes ? resolve(aes) : reject(new Error('Bob secret generation failed'))
                );
            });
            addResult('Bob Shared Secret', true, { created: true });

            // Bob decrypts data with shared secret
            setCurrentStep('Bob decrypting shared data...');
            const sharedDecrypted = await new Promise<string>((resolve, reject) => {
                sea.decrypt(sharedEncrypted, bobSecret, (dec: string) => 
                    dec ? resolve(dec) : reject(new Error('Shared decryption failed'))
                );
            });
            addResult('Shared Data Decryption', true, { 
                decrypted: sharedDecrypted,
                matches: sharedDecrypted === 'shared data'
            });

            setCurrentStep('All tests completed!');
        } catch (error) {
            addResult(currentStep, false, null, error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Column className="min-h-screen p-6 bg-gray-50" align="center" justify="start">
            <Column className="w-full max-w-4xl space-y-6">
                <Column className="text-center space-y-2">
                    <text className="text-3xl font-bold text-gray-800">SEA Cryptography Tests</text>
                    <text className="text-gray-600">Testing Security, Encryption, and Authentication features</text>
                </Column>

                <Row justify="center">
                    <view
                        bindtap={runSEATests}
                        className={`px-6 py-3 ${isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white font-semibold rounded-lg shadow-md transition-colors`}
                        tabIndex={0}
                        aria-label="Run SEA tests"
                    >
                        <text className="text-white">{isRunning ? 'Running Tests...' : 'Run SEA Tests'}</text>
                    </view>
                </Row>

                {isRunning && currentStep && (
                    <Column className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <Row align="center" spacing="sm">
                            <view className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></view>
                            <text className="text-blue-700 font-medium">{currentStep}</text>
                        </Row>
                    </Column>
                )}

                {testResults.length > 0 && (
                    <Column className="space-y-4">
                        <text className="text-xl font-semibold text-gray-800">Test Results</text>
                        <Column className="space-y-3">
                            {testResults.map((result, index) => (
                                <Column
                                    key={index}
                                    className={`border rounded-lg p-4 ${
                                        result.success 
                                            ? 'bg-green-50 border-green-200' 
                                            : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    <Row align="start" justify="between">
                                        <Column className="flex-1">
                                            <text className={`font-semibold ${
                                                result.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                                {result.step}
                                            </text>
                                            {result.success ? (
                                                <Column className="mt-2 space-y-1">
                                                    {result.data && Object.entries(result.data).map(([key, value]) => (
                                                        <Row key={key} align="baseline">
                                                            <text className="text-sm text-gray-700 font-medium">{key}: </text>
                                                            <text className="text-sm text-gray-700 font-mono text-xs ml-1">
                                                                {typeof value === 'boolean' 
                                                                    ? value ? '✓ Yes' : '✗ No'
                                                                    : String(value)
                                                                }
                                                            </text>
                                                        </Row>
                                                    ))}
                                                </Column>
                                            ) : (
                                                <text className="mt-1 text-sm text-red-600">{result.error}</text>
                                            )}
                                        </Column>
                                        <Column className="ml-4">
                                            <text className={`text-2xl ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                                {result.success ? '✓' : '✗'}
                                            </text>
                                        </Column>
                                    </Row>
                                </Column>
                            ))}
                        </Column>
                    </Column>
                )}

                <Column className="mt-8 bg-gray-100 rounded-lg p-6">
                    <text className="text-lg font-semibold text-gray-800 mb-3">Test Flow Overview</text>
                    <Column className="space-y-2">
                        <text className="text-sm text-gray-700">1. Generate a key pair for self-encryption</text>
                        <text className="text-sm text-gray-700">2. Encrypt a message with the key pair</text>
                        <text className="text-sm text-gray-700">3. Sign the encrypted message</text>
                        <text className="text-sm text-gray-700">4. Verify the signature</text>
                        <text className="text-sm text-gray-700">5. Decrypt the message</text>
                        <text className="text-sm text-gray-700">6. Generate and verify work proofs</text>
                        <text className="text-sm text-gray-700">7. Create shared encryption between Alice and Bob</text>
                        <text className="text-sm text-gray-700">8. Exchange encrypted data using shared secrets</text>
                    </Column>
                </Column>
            </Column>
        </Column>
    );
};

export default TestPage;