/**
 * Create Account Screen
 *
 * Allows users to create a new account by:
 * 1. Entering an alias/username
 * 2. Generating a keypair
 * 3. Showing keys for backup
 * 4. Saving and continuing to chat
 */

import { useState } from 'react';
import { Column, Row, Text, Button, Input, Icon } from '@ariob/ui';
import { PageLayout } from '../components/Layout';
import type { IGunChainReference } from '@ariob/core';
import { useAuth, pair } from '@ariob/core';
import { saveProfile } from '../utils/profile';

interface CreateAccountProps {
  graph: IGunChainReference;
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateAccount({ graph, onBack, onSuccess }: CreateAccountProps) {
  const { create } = useAuth(graph);

  const [step, setStep] = useState<'alias' | 'keys'>('alias');
  const [alias, setAlias] = useState('');
  const [keys, setKeys] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedJSON, setCopiedJSON] = useState(false);

  const handleGenerateKeys = async () => {
    'background only';
    if (!alias.trim()) {
      setError('Please enter an alias');
      return;
    }

    console.log('>>>>> [CreateAccount] ========== KEY GENERATION ==========');
    console.log('>>>>> [CreateAccount] Alias:', alias);
    console.log('>>>>> [CreateAccount] Starting keypair generation...');

    setLoading(true);
    setError('');

    // Generate keypair
    const result = await pair();

    console.log('>>>>> [CreateAccount] Pair result:', result.ok ? 'SUCCESS ✅' : 'FAILED ❌');

    if (result.ok) {
      console.log('>>>>> [CreateAccount] 🔐 Keypair generated successfully');
      console.log('>>>>> [CreateAccount]   Public key:', result.value.pub.substring(0, 50) + '...');
      console.log('>>>>> [CreateAccount]   Private key length:', result.value.priv.length);
      console.log('>>>>> [CreateAccount]   Encryption pub length:', result.value.epub.length);
      console.log('>>>>> [CreateAccount]   Encryption priv length:', result.value.epriv.length);
      console.log('>>>>> [CreateAccount] =================================================');

      setKeys(result.value);
      setStep('keys');
    } else {
      console.log('>>>>> [CreateAccount] ❌ Key generation FAILED');
      console.log('>>>>> [CreateAccount] Error:', result.error.message);
      console.log('>>>>> [CreateAccount] =================================================');
      setError(result.error.message);
    }

    setLoading(false);
  };

  const handleCreateAccount = async () => {
    'background only';
    if (!keys) return;

    console.log('>>>>> [CreateAccount] ========== ACCOUNT CREATION ==========');
    console.log('>>>>> [CreateAccount] Alias:', alias);
    console.log('>>>>> [CreateAccount] Public key:', keys.pub.substring(0, 50) + '...');
    console.log('>>>>> [CreateAccount] Calling create()...');

    setLoading(true);
    setError('');

    // Create account with alias
    const result = await create(alias);

    console.log('>>>>> [CreateAccount] Create result:', result.ok ? 'SUCCESS ✅' : 'FAILED ❌');

    if (result.ok) {
      console.log('>>>>> [CreateAccount] ✅ Account created successfully');
      console.log('>>>>> [CreateAccount] User object:', JSON.stringify(result.value).substring(0, 150));
      console.log('>>>>> [CreateAccount] User pub:', result.value.pub ? result.value.pub.substring(0, 50) + '...' : 'N/A');

      // Save profile data to user graph
      const now = Date.now();
      console.log('>>>>> [CreateAccount] ---------- SAVING PROFILE ----------');
      console.log('>>>>> [CreateAccount] Profile data:', JSON.stringify({ alias, createdAt: now, updatedAt: now }));
      console.log('>>>>> [CreateAccount] Calling saveProfile()...');

      const profileResult = await saveProfile(graph, {
        alias: alias,
        createdAt: now,
        updatedAt: now,
      });

      console.log('>>>>> [CreateAccount] Profile save result:', profileResult.ok ? 'SUCCESS ✅' : 'FAILED ❌');

      if (!profileResult.ok) {
        console.log('>>>>> [CreateAccount] ⚠️ Failed to save profile:', profileResult.error.message);
        console.log('>>>>> [CreateAccount] Continuing anyway - profile can be updated later');
        // Continue anyway - profile can be updated later
      } else {
        console.log('>>>>> [CreateAccount] ✅ Profile saved successfully');
      }

      console.log('>>>>> [CreateAccount] Calling onSuccess()...');
      console.log('>>>>> [CreateAccount] =================================================');
      onSuccess();
    } else {
      console.log('>>>>> [CreateAccount] ❌ Account creation FAILED');
      console.log('>>>>> [CreateAccount] Error:', result.error.message);
      console.log('>>>>> [CreateAccount] Error stack:', result.error.stack ? result.error.stack.substring(0, 200) : 'N/A');
      console.log('>>>>> [CreateAccount] =================================================');
      setError(result.error.message);
    }

    setLoading(false);
  };

  if (step === 'alias') {
    return (
      <PageLayout>
        {/* Top Header with Back Button */}
        <view className="w-full px-4 py-3 flex flex-row items-start border-b border-border">
          <Button
            onTap={() => {
              'background only';
              onBack();
            }}
            variant="ghost"
          >
            <Icon name="chevron-left" size="lg" />
          </Button>
        </view>

        <Column className="flex-1 w-full items-center justify-center p-8" spacing="xl">
          {/* Header */}
          <Column spacing="md" className="items-center text-center">
            <Text size="3xl" weight="bold">
              Name or Alias
            </Text>
            <Text variant="muted">
              Choose your name
            </Text>
          </Column>

          {/* Alias input */}
          <Column spacing="md" className="w-full max-w-sm">
            <Input
              value={alias}
              onChange={(value) => {
                'background only';
                setAlias(value);
                setError('');
              }}
              placeholder="Enter your username"
              className="w-full"
            />

            {error && (
              <Text className="text-destructive" size="sm">
                {error}
              </Text>
            )}

            <Button
              onTap={handleGenerateKeys}
              size="lg"
              className="w-full"
              disabled={loading || !alias.trim()}
            >
              {loading ? 'Generating...' : 'Continue'}
            </Button>
          </Column>
        </Column>
      </PageLayout>
    );
  }

  // Step 2: Show generated keys
  const handleCopyJSON = () => {
    'background only';
    if (!keys) return;

    // TODO: Implement clipboard copy with native module
    // For now, just show feedback
    const keysJSON = JSON.stringify(keys, null, 2);
    console.log('Copy to clipboard:', keysJSON);

    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  return (
    <PageLayout>
      {/* Top Header with Back Button */}
      <view className="w-full px-4 py-3 flex flex-row items-start border-b border-border">
        <Button
          onTap={() => {
            'background only';
            setStep('alias');
            setKeys(null);
          }}
          variant="ghost"
        >
          <Icon name="chevron-left" size="lg" />
        </Button>
      </view>

      <Column className="flex-1 w-full items-center justify-center p-8" spacing="xl">
        {/* Header */}
        <Column spacing="md" className="items-center text-center">
          <Text size="3xl" weight="bold">
            Backup Your Keys
          </Text>
          <Text variant="muted" className="max-w-sm">
            Save these keys securely. You'll need them to access your account.
          </Text>
        </Column>

        {/* Keys display */}
        {keys && (
          <Column spacing="lg" className="w-full max-w-md">
            {/* Important Notice */}
            <view className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Row className="items-start gap-3">
                <Icon name="circle-alert" size="sm" className="text-primary mt-0.5" />
                <Column spacing="xs">
                  <Text size="sm" weight="semibold" className="text-primary">
                    Important: Save Your Keys
                  </Text>
                  <Text size="xs" variant="muted">
                    Copy your full keypair JSON. You'll need it to restore your account.
                  </Text>
                </Column>
              </Row>
            </view>

            {/* Copy JSON Button */}
            <Button
              onTap={handleCopyJSON}
              variant="default"
              size="lg"
            >
                <Icon name={copiedJSON ? 'check' : 'copy'}  /> {" "}
                {copiedJSON ? 'Copied to Clipboard!' : 'Copy'}
            </Button>

            {/* Collapsible Key Preview */}
            <view className="p-3 bg-muted/50 rounded-lg border border-border">
              <Column spacing="xs">
                <Text size="xs" weight="semibold" variant="muted" className="uppercase tracking-wide">
                  Key Preview
                </Text>
                <Text size="xs" className="font-mono text-muted-foreground">
                  pub: {keys.pub.substring(0, 24)}...
                </Text>
                <Text size="xs" className="font-mono text-muted-foreground">
                  priv: {keys.priv.substring(0, 24)}...
                </Text>
              </Column>
            </view>

            {error && (
              <Text className="text-destructive" size="sm">
                {error}
              </Text>
            )}

            {/* Continue Button */}
            <Button
              onTap={handleCreateAccount}
              size="lg"
            >
              {loading ? 'Creating Account...' : 'I Saved My Keys'}
            </Button>
          </Column>
        )}
      </Column>
    </PageLayout>
  );
}
