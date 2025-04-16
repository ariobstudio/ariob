import React from 'react';
import { PageContainer, Card } from '../../components';
import { useTheme } from '../../components/ThemeProvider';

export function AboutScreen() {
  const { withTheme } = useTheme();

  return (
    <PageContainer safeAreaTop={true}>
      <view className="mb-4">
        <text className={`text-2xl font-bold ${withTheme('text-gray-900', 'text-white')}`}>
          About Ariob
        </text>
      </view>

      <Card className="mb-4 p-4">
        <text className={`text-xl font-semibold mb-2 ${withTheme('text-gray-900', 'text-white')}`}>
          Our Mission
        </text>
        <text className={`mb-4 ${withTheme('text-gray-500', 'text-gray-400')}`}>
          Our mission is simple: Empower, Innovate, Inspire.
        </text>
        
        <view className={`p-3 mb-3 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`}>
          <text className={`font-medium mb-1 ${withTheme('text-gray-900', 'text-white')}`}>Empower</text>
          <text className={withTheme('text-gray-500', 'text-gray-400')}>
            We design solutions that unlock new possibilities for individuals and communities, ensuring that everyone has the tools they need to succeed.
          </text>
        </view>
        
        <view className={`p-3 mb-3 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`}>
          <text className={`font-medium mb-1 ${withTheme('text-gray-900', 'text-white')}`}>Innovate</text>
          <text className={withTheme('text-gray-500', 'text-gray-400')}>
            Innovation is at the heart of everything we do. From transformative technologies to user-centered designs, we constantly push the boundaries of what's possible.
          </text>
        </view>
        
        <view className={`p-3 mb-3 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`}>
          <text className={`font-medium mb-1 ${withTheme('text-gray-900', 'text-white')}`}>Inspire</text>
          <text className={withTheme('text-gray-500', 'text-gray-400')}>
            We aim to spark change, encourage creativity, and fuel a movement where bold ideas lead to meaningful impacts.
          </text>
        </view>
      </Card>

      <Card className="mb-4 p-4">
        <text className={`text-xl font-semibold mb-2 ${withTheme('text-gray-900', 'text-white')}`}>
          Who We Are
        </text>
        <text className={`mb-4 ${withTheme('text-gray-500', 'text-gray-400')}`}>
          Ariob was founded on the principles of creativity, integrity, and excellence. We are a diverse collective of forward-thinkers, innovators, and doers united by a common goal: to bring groundbreaking ideas into reality. By combining passion with cutting-edge technology, we strive to create solutions that are not only effective but also enrich the lives of those who use them.
        </text>
      </Card>

      <Card className="mb-4 p-4">
        <text className={`text-xl font-semibold mb-2 ${withTheme('text-gray-900', 'text-white')}`}>
          Our Core Values
        </text>
        
        <view className="flex flex-row flex-wrap">
          <view className={`p-3 m-1 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`} style={{ width: '48%' }}>
            <text className={`font-medium text-center ${withTheme('text-gray-900', 'text-white')}`}>Innovation</text>
          </view>
          
          <view className={`p-3 m-1 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`} style={{ width: '48%' }}>
            <text className={`font-medium text-center ${withTheme('text-gray-900', 'text-white')}`}>Integrity</text>
          </view>
          
          <view className={`p-3 m-1 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`} style={{ width: '48%' }}>
            <text className={`font-medium text-center ${withTheme('text-gray-900', 'text-white')}`}>Empowerment</text>
          </view>
          
          <view className={`p-3 m-1 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`} style={{ width: '48%' }}>
            <text className={`font-medium text-center ${withTheme('text-gray-900', 'text-white')}`}>Community</text>
          </view>
        </view>
      </Card>

      <Card className="mb-4 p-4">
        <text className={`text-center text-lg font-medium mb-2 ${withTheme('text-gray-900', 'text-white')}`}>
          Welcome to Ariob. Welcome to the future.
        </text>
      </Card>
    </PageContainer>
  );
} 