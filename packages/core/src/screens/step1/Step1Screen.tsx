import { useCallback, useState } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import SEA from '@/gun/sea/sea.js';
import { Layout } from '../../components/Layout';
import { useSeaStore } from '../../store/seaStore';

export function Step1Screen() {
  const navigate = useNavigate();
  const { state, updatePair } = useSeaStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateKeypair = useCallback(async () => {
    setIsGenerating(true);
    try {
      const pair = await SEA.pair();
      console.log("Generated keypair:", pair);
      updatePair(pair);
    } catch (error) {
      console.error("Error generating keypair:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [updatePair]);

  // Format a key for display (show first and last few characters)
  const formatKey = (key: string) => {
    if (!key || key.length <= 20) return key;
    return `${key.substring(0, 10)}...${key.substring(key.length - 10)}`;
  };

  return (
    <Layout title="Step 1: Generate a keypair">
      <view className="Card">
        <text className="CardTitle">What is a Keypair?</text>
        <text className="CardText">
          A keypair consists of public and private keys that can be used for encryption, 
          decryption, and digital signatures. The private key should be kept secret while 
          the public key can be freely shared.
        </text>
      </view>
      
      <view className="Button" bindtap={generateKeypair}>
        <text className="ButtonText">{isGenerating ? "Generating..." : "Generate Keypair"}</text>
      </view>
      
      {state.pair && (
        <view className="Result">
          <text className="ResultTitle">Generated Keypair</text>
          
          <view className="KeyItemContainer">
            <text className="SubHeading">Public Key (pub):</text>
            <text className="CodeBlock">
              {formatKey(state.pair.pub)}
            </text>
          </view>
          
          <view className="KeyItemContainer">
            <text className="SubHeading">Private Key (priv):</text>
            <text className="CodeBlock">
              {formatKey(state.pair.priv)}
            </text>
          </view>
          
          <view className="KeyItemContainer">
            <text className="SubHeading">Elliptic Curve Public Key (epub):</text>
            <text className="CodeBlock">
              {formatKey(state.pair.epub)}
            </text>
          </view>
          
          <view className="KeyItemContainer">
            <text className="SubHeading">Elliptic Curve Private Key (epriv):</text>
            <text className="CodeBlock">
              {formatKey(state.pair.epriv)}
            </text>
          </view>
          
          <view className="InfoCard">
            <text className="InfoTitle">Key Details:</text>
            <text className="List">
              • pub: Your public key (can be shared)
            </text>
            <text className="List">
              • priv: Your private key (keep secret!)
            </text>
            <text className="List">
              • epub: Elliptic curve public key for shared encryption
            </text>
            <text className="List">
              • epriv: Elliptic curve private key for shared encryption
            </text>
          </view>
        </view>
      )}
      
      <view className="Navigation">
        <text className="NavButton" bindtap={() => navigate('/')}>
          Back to Intro
        </text>
        {state.pair && (
          <text className="NavButton" bindtap={() => navigate('/step2')}>
            Next: Encrypt & Sign →
          </text>
        )}
      </view>
    </Layout>
  );
} 