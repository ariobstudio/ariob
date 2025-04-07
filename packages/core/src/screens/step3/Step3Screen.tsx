import { useCallback, useState } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import SEA from '@/gun/sea/sea.js';
import { Layout } from '../../components/Layout';
import { useSeaStore } from '../../store/seaStore';

export function Step3Screen() {
  const navigate = useNavigate();
  const { state, updatePeers, updateSharedEncryption } = useSeaStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const message = 'shared secret data';

  const demonstrateSharedSecret = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Generate Alice and Bob's keypairs
      const alice = await SEA.pair();
      const bob = await SEA.pair();
      console.log("Alice's keypair:", alice);
      console.log("Bob's keypair:", bob);
      
      // Alice encrypts a message for Bob using Bob's public key and her private key
      const sharedSecret1 = await SEA.secret(bob.epub, alice);
      const enc = await SEA.encrypt(message, sharedSecret1);
      console.log("Encrypted with shared secret:", enc);
      
      // Bob decrypts the message using Alice's public key and his private key
      const sharedSecret2 = await SEA.secret(alice.epub, bob);
      const dec = await SEA.decrypt(enc, sharedSecret2);
      console.log("Decrypted with shared secret:", dec);
      
      // Update the store
      updatePeers(alice, bob);
      updateSharedEncryption(enc, dec);
    } catch (error) {
      console.error("Error demonstrating shared secret:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [updatePeers, updateSharedEncryption]);

  // Helper function to truncate long strings for display
  const formatForDisplay = (text: string) => {
    if (!text || text.length <= 40) return text;
    return `${text.substring(0, 18)}...${text.substring(text.length - 18)}`;
  };

  return (
    <Layout title="Step 3: Shared Secret Communication">
      <view className="Card">
        <text className="CardTitle">What is a Shared Secret?</text>
        <text className="CardText">
          A shared secret is a cryptographic key that can be computed by two parties independently,
          using their own private key and the other party's public key. This allows secure communication
          without ever having to transmit the actual secret key.
        </text>
      </view>
      
      <view className="Button" bindtap={demonstrateSharedSecret}>
        <text className="ButtonText">
          {isProcessing ? "Processing..." : "Demonstrate Shared Secret"}
        </text>
      </view>
      
      {state.alice && state.bob && (
        <view className="Result">
          <text className="ResultTitle">Shared Secret Encryption Demo</text>
          
          <view className="UserSection">
            <view className="UserCard Alice">
              <text className="CodeBlock">
                {formatForDisplay(state.alice.pub)}
              </text>
            </view>
            
            <view className="UserCard Bob">
              <text className="CodeBlock">
                {formatForDisplay(state.bob.pub)}
              </text>
            </view>
          </view>
          
          <view className="MessageSection">
            <text className="MessageTitle">Communication:</text>
            <view className="MessageFlow">
              <view className="MessageItem">
                <text className="MessageLabel">Original Message:</text>
                <view className="MessageContent Original">
                  <text className="MessageText">"{message}"</text>
                </view>
              </view>
              
              <view className="MessageItem">
                <text className="MessageLabel">Encrypted Message (Sent):</text>
                <view className="MessageContent Encrypted">
                  <text className="MessageText">{formatForDisplay(state.sharedEnc)}</text>
                </view>
              </view>
              
              <view className="MessageItem">
                <text className="MessageLabel">Decrypted Message (Received):</text>
                <view className="MessageContent Decrypted">
                  <text className="MessageText">"{state.sharedDec}"</text>
                </view>
              </view>
            </view>
            
            <view className="VerificationCard">
              <text className="ProcessStepTitle">Verification Result:</text>
              <view className={`VerificationBadge ${state.sharedDec === message ? "Success" : "Failure"}`}>
                <text className="VerificationText">
                  {state.sharedDec === message ? "✓ Successful Transmission" : "✗ Failed Transmission"}
                </text>
              </view>
            </view>
          </view>
        </view>
      )}
      
      <view className="Navigation">
        <text className="NavButton" bindtap={() => navigate('/step2')}>
          ← Back to Step 2
        </text>
        <text className="NavButton" bindtap={() => navigate('/')}>
          Return to Intro
        </text>
      </view>
    </Layout>
  );
} 