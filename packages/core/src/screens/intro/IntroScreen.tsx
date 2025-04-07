import { useNavigate } from 'react-router';
import { Layout } from '../../components/Layout';

export function IntroScreen() {
  const navigate = useNavigate();

  return (
    <Layout title="Security Encryption Authentication Demo">
      <text className="Description">
        Welcome to the SEA (Security Encryption Authentication) Demo
      </text>
      
      <view className="Card">
        <text className="CardTitle">What is SEA?</text>
        <text className="CardText">
          SEA is a cryptographic library for secure data exchange. It provides key pair generation, 
          encryption, decryption, signing, and verification capabilities.
        </text>
      </view>
      
      <text className="SectionTitle">Tutorial Steps</text>
      <text className="Description">
        This tutorial will walk you through several cryptographic operations:
      </text>
      
      <view className="StepList">
        <view className="StepCard" bindtap={() => navigate('/step1')}>
          <view className="StepContent">
            <text className="StepTitle">Generate a keypair</text>
            <text className="StepDescription">
              Learn how to create a cryptographic keypair for secure communication
            </text>
          </view>
        </view>
        
        <view className="StepCard" bindtap={() => navigate('/step2')}>
          <view className="StepContent">
            <text className="StepTitle">Encrypt, Sign and Verify</text>
            <text className="StepDescription">
              See how to encrypt messages, sign them, and verify their authenticity
            </text>
          </view>
        </view>
        
        <view className="StepCard" bindtap={() => navigate('/step3')}>
          <view className="StepContent">
            <text className="StepTitle">Shared Secret between Alice and Bob</text>
            <text className="StepDescription">
              Discover how two parties can share encrypted messages securely
            </text>
          </view>
        </view>
      </view>
      
      <view className="Button" bindtap={() => navigate('/step1')}>
        <text className="ButtonText">Start Tutorial</text>
      </view>
    </Layout>
  );
} 