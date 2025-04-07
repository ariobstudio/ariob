import { useCallback, useState } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import SEA from '@/gun/sea/sea.js';
import { Layout } from '../../components/Layout';
import { useSeaStore } from '../../store/seaStore';

export function Step2Screen() {
  const navigate = useNavigate();
  const { state, updateEncryption, updateSigned, updateProofCheck } = useSeaStore();
  const [message, setMessage] = useState('hello world');
  const [isProcessing, setIsProcessing] = useState(false);

  const encryptAndSign = useCallback(async () => {
    if (!state.pair) {
      navigate('/step1');
      return;
    }

    setIsProcessing(true);
    try {
      // Encrypt the message
      const enc = await SEA.encrypt(message, state.pair);
      console.log("Encrypted:", enc);
      
      // Sign the encrypted message
      const signed = await SEA.sign(enc, state.pair);
      console.log("Signed:", signed);
      
      // Verify the signature
      const verified = await SEA.verify(signed, state.pair.pub);
      console.log("Verified:", verified);
      
      // Decrypt the message
      const dec = await SEA.decrypt(verified, state.pair);
      console.log("Decrypted:", dec);
      
      // Generate proof
      const proof = await SEA.work(dec, state.pair);
      const check = await SEA.work(message, state.pair);
      console.log("Proof matches check:", proof === check);
      
      // Update the store
      updateEncryption(enc, dec);
      updateSigned(signed);
      updateProofCheck(proof, check);
    } catch (error) {
      console.error("Error processing:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [message, state.pair, navigate, updateEncryption, updateSigned, updateProofCheck]);

  // Format a string for display (show first and last few characters)
  const formatForDisplay = (text: string) => {
    if (!text || text.length <= 40) return text;
    return `${text.substring(0, 18)}...${text.substring(text.length - 18)}`;
  };

  return (
    <Layout title="Step 2: Encrypt, Sign and Verify">
      <view className="Card">
        <text className="CardTitle">Encryption and Signatures</text>
        <text className="CardText">
          Encryption converts data into a secure format that can only be read by authorized parties.
          Digital signatures verify the authenticity and integrity of messages, ensuring they were
          created by the claimed sender and haven't been altered.
        </text>
      </view>
      
      <view className="InputGroup">
        <text className="InputLabel">Message to encrypt:</text>
        <text className="Hint">
          {message}
        </text> 
      </view>
      
      <view className="Button" bindtap={encryptAndSign}>
        <text className="ButtonText">{isProcessing ? "Processing..." : "Encrypt & Sign"}</text>
      </view>
      
      {state.enc && (
        <view className="Result">
          <text className="ResultTitle">Encryption and Signature Results</text>
          
          <view className="ProcessSteps">
            <view className="KeyItemContainer">
              <text className="SubHeading">Encrypted:</text>
              <text className="CodeBlock">
                {formatForDisplay(state.enc)}
              </text>
            </view>
            
            <view className="KeyItemContainer">
              <text className="SubHeading">Signed:</text>
              <text className="CodeBlock">
                {formatForDisplay(state.signed)}
              </text>
            </view>
            
            <view className="KeyItemContainer">
              <text className="SubHeading">Decrypted:</text>
              <text className="CodeBlock">
                {state.dec}
              </text>
            </view>
          </view>
          
          <view className="VerificationCard">
            <text className="ProcessStepTitle">Verification:</text>
            <view className={`VerificationBadge ${state.proof === state.check ? "Success" : "Failure"}`}>
              <text className="VerificationText">
                {state.proof === state.check ? "✓ Proof matches check" : "✗ Proof does not match check"}
              </text>
            </view>
          </view>
          
          <view className="InfoCard">
            <text className="InfoTitle">Process Explanation:</text>
            <text className="List">
              • First, your message is encrypted using your keypair
            </text>
            <text className="List">
              • Then, the encrypted data is digitally signed
            </text>
            <text className="List">
              • The signature is verified using your public key
            </text>
            <text className="List">
              • Finally, the data is decrypted back to its original form
            </text>
            <text className="List">
              • A proof-of-work validates the message integrity
            </text>
          </view>
        </view>
      )}
      
      <view className="Navigation">
        <text className="NavButton" bindtap={() => navigate('/step1')}>
          ← Back to Step 1
        </text>
        {state.enc && (
          <text className="NavButton" bindtap={() => navigate('/step3')}>
            Next: Shared Secret →
          </text>
        )}
      </view>
    </Layout>
  );
} 