import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Line } from '../primitives/line';
import { Dot } from '../primitives/dot';
import { Shell } from '../primitives/shell';
import { Header } from './header';
import { Footer } from './footer';
import { Post, Message, Profile, Auth, Sync, Ghost, Suggestion, AIModel } from '../nodes';
import type { PostData, MessageData, ProfileData, AuthData, SyncData, GhostData, SuggestionData, AIModelData } from '../nodes';

export type NodeType = 'post' | 'message' | 'profile' | 'auth' | 'sync' | 'ghost' | 'suggestion' | 'ai-model';

export interface NodeData {
  id: string;
  type: NodeType;
  author: string;
  timestamp: string;
  degree: number;
  avatar?: string;
  handle?: string;
  post?: PostData;
  message?: MessageData;
  profile?: ProfileData;
  auth?: AuthData;
  sync?: SyncData;
  ghost?: GhostData;
  suggestion?: SuggestionData;
  aiModel?: AIModelData;
}

interface NodeProps {
  data: NodeData;
  isLast: boolean;
  onPress?: () => void;
  onAvatarPress?: () => void;
  onSync?: () => void;
  isThinking?: boolean;
  /** Called when user taps Reply on a message node */
  onReplyPress?: () => void;
  onAnchor?: (handle: string) => void;
  /** Called when user selects an AI model */
  onSelectModel?: (modelId: string) => void;
  /** Shared element transition tag for navigation */
  transitionTag?: string;
}

export const Node = ({ data, isLast, onPress, onAvatarPress, onSync, isThinking, onReplyPress, onAnchor, onSelectModel, transitionTag }: NodeProps) => {
  const getDotColor = () => {
    switch (data.type) {
      case 'profile': return '#00BA7C';
      case 'message': return data.author === 'Ripple' ? '#FFD700' : '#1D9BF0';
      case 'auth': return '#7856FF';
      case 'sync': return '#7856FF';
      case 'ai-model': return '#00E5FF'; // Bioluminescent cyan for AI
      default: return '#E7E9EA';
    }
  };
  
  const getAvatarVariant = () => {
    if (data.author === 'Ripple') return 'companion';
    if (data.type === 'auth') return 'auth';
    return 'default';
  };
  
  const getBadges = () => {
    const badges: Array<{ label: string; variant: 'dm' | 'ai' | 'new' }> = [];
    if (data.type === 'message' && data.author !== 'Ripple') badges.push({ label: 'DM', variant: 'dm' });
    if (data.author === 'Ripple') badges.push({ label: 'AI', variant: 'ai' });
    if (data.type === 'suggestion') badges.push({ label: 'NEW', variant: 'new' });
    return badges;
  };
  
  const renderBody = () => {
    switch (data.type) {
      case 'post':
        return data.post ? <Post data={data.post} /> : null;
      case 'message':
        return data.message ? <Message data={data.message} isThinking={isThinking} onReplyPress={onReplyPress} /> : null;
      case 'profile':
        return data.profile ? <Profile data={data.profile} onAnchor={onAnchor} /> : null;
      case 'auth':
        return data.auth ? <Auth data={data.auth} /> : null;
      case 'sync':
        return data.sync ? <Sync data={data.sync} /> : null;
      case 'ghost':
        return data.ghost ? <Ghost data={data.ghost} /> : null;
      case 'suggestion':
        return data.suggestion ? <Suggestion data={data.suggestion} /> : null;
      case 'ai-model':
        return data.aiModel ? <AIModel data={data.aiModel} onSelectModel={onSelectModel} /> : null;
      default:
        return null;
    }
  };
  
  const showFooter = data.type === 'post';
  
  const handlePress = () => {
    if (data.type === 'sync') {
      onSync?.();
    } else {
      onPress?.();
    }
  };
  
  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.duration(300)}
      layout={Layout.springify()}
      sharedTransitionTag={transitionTag}
    >
      {/* Left Column */}
      <View style={styles.leftColumn}>
        <Line visible={true} style={{ height: 25, flex: 0 }} />
        <Dot color={getDotColor()} />
        <Line visible={!isLast} style={{ flex: 1 }} />
      </View>
      
      {/* Right Column */}
      <View style={styles.rightColumn}>
        <Shell 
          onPress={handlePress}
          variant={data.type === 'ghost' ? 'ghost' : 'default'}
          style={styles.shellMargin}
        >
          <Header
            author={data.author}
            timestamp={data.timestamp}
            avatar={data.avatar}
            variant={getAvatarVariant()}
            badges={getBadges()}
            onAvatarPress={onAvatarPress}
          />
          {renderBody()}
          {showFooter && <Footer />}
        </Shell>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    width: '100%',
  },
  leftColumn: {
    width: 16,
    alignItems: 'center' as const,
    marginRight: 8,
  },
  rightColumn: {
    flex: 1,
  },
  shellMargin: {
    marginBottom: 24,
  }
});
