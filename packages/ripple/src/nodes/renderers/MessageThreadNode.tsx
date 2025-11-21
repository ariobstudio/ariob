/**
 * Message Thread Node Renderer
 *
 * Renders DM conversation threads
 * - preview: Row showing last message
 * - full: Full conversation history
 * - immersive: Full-screen chat interface
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThreadMetadata, Message } from '../../schemas';
import type { NodeRenderer, NodeRenderProps } from '../types';

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

/**
 * Preview: Thread row in feed/list
 */
function PreviewView({ data, nodeId, onPress }: NodeRenderProps<ThreadMetadata>) {
  // Get the other participant (not current user)
  const otherParticipant = data.participants[1] || data.participants[0];

  return (
    <Pressable onPress={onPress} style={styles.previewContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(otherParticipant || '?').charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.previewContent}>
        <View style={styles.previewHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {otherParticipant || 'Unknown'}
          </Text>
          {data.lastMessageAt && (
            <Text style={styles.timestamp}>{formatTime(data.lastMessageAt)}</Text>
          )}
        </View>

        <Text style={styles.lastMessage} numberOfLines={2}>
          {data.lastMessage || 'No messages yet'}
        </Text>
      </View>

      {data.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{data.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Full: Conversation history
 */
function FullView({ data, nodeId, navigation }: NodeRenderProps<ThreadMetadata>) {
  // Mock messages - will be replaced with Gun.js data
  const mockMessages: Message[] = [];
  const otherParticipant = data.participants[1] || data.participants[0];

  return (
    <View style={styles.fullContainer}>
      {/* Header */}
      <View style={styles.fullHeader}>
        <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.avatarMedium}>
          <Text style={styles.avatarTextMedium}>
            {(otherParticipant || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.fullParticipantName}>{otherParticipant}</Text>
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {mockMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={48} color="#8E8E93" />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>Start the conversation</Text>
          </View>
        ) : (
          <FlatList
            data={mockMessages}
            keyExtractor={(item) => item['#'] || Math.random().toString()}
            renderItem={({ item }) => <MessageBubble message={item} />}
            inverted
          />
        )}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Message..."
          placeholderTextColor="#8E8E93"
          style={styles.input}
        />
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#0A84FF" />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Immersive: Full-screen chat interface
 */
function ImmersiveView({ data, nodeId, navigation }: NodeRenderProps<ThreadMetadata>) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const otherParticipant = data.participants[1] || data.participants[0];

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Send message via Gun.js
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.immersiveContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.immersiveHeader}>
        <Pressable onPress={() => navigation?.goBack()} style={styles.immersiveBackButton}>
          <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
        </Pressable>

        <View style={styles.immersiveHeaderCenter}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {(otherParticipant || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.immersiveHeaderText}>
            <Text style={styles.immersiveParticipantName}>{otherParticipant}</Text>
            <Text style={styles.immersiveOnlineStatus}>Online</Text>
          </View>
        </View>

        <Pressable style={styles.immersiveInfoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item['#'] || Math.random().toString()}
        renderItem={({ item }) => <MessageBubble message={item} immersive />}
        inverted
        contentContainerStyle={styles.immersiveMessagesList}
        ListEmptyComponent={
          <View style={styles.immersiveEmptyState}>
            <View style={styles.immersiveEmptyIcon}>
              <Ionicons name="chatbubbles" size={64} color="#3A3A3C" />
            </View>
            <Text style={styles.immersiveEmptyTitle}>No messages yet</Text>
            <Text style={styles.immersiveEmptySubtitle}>
              Say hello to start the conversation
            </Text>
          </View>
        }
      />

      {/* Input Bar */}
      <View style={styles.immersiveInputContainer}>
        <Pressable style={styles.attachButton}>
          <Ionicons name="add-circle" size={28} color="#8E8E93" />
        </Pressable>

        <View style={styles.immersiveInputWrapper}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message..."
            placeholderTextColor="#8E8E93"
            style={styles.immersiveInput}
            multiline
            maxHeight={100}
          />
        </View>

        {message.trim() ? (
          <Pressable onPress={handleSend} style={styles.immersiveSendButton}>
            <Ionicons name="send" size={24} color="#0A84FF" />
          </Pressable>
        ) : (
          <Pressable style={styles.voiceButton}>
            <Ionicons name="mic" size={24} color="#8E8E93" />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * Message Bubble Component
 */
function MessageBubble({ message, immersive }: { message: Message; immersive?: boolean }) {
  const isMe = false; // TODO: Check against current user

  return (
    <View style={[styles.messageBubbleContainer, isMe && styles.messageBubbleMe]}>
      {!isMe && !immersive && (
        <View style={styles.messageBubbleAvatar}>
          <Text style={styles.messageBubbleAvatarText}>
            {(message.from || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={[styles.messageBubble, isMe && styles.messageBubbleIsMe]}>
        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
          {message.text}
        </Text>
        <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
          {formatTime(message.created)}
        </Text>
      </View>
    </View>
  );
}

export const MessageThreadNodeRenderer: NodeRenderer<ThreadMetadata> = {
  preview: PreviewView,
  full: FullView,
  immersive: ImmersiveView, // Full-screen chat
};

const styles = StyleSheet.create({
  // Preview
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewContent: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
    color: '#8E8E93',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Full View
  fullContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  avatarMedium: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextMedium: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullParticipantName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#38383A',
    backgroundColor: '#1C1C1E',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    fontSize: 15,
    color: '#FFFFFF',
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },

  // Immersive View
  immersiveContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  immersiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  immersiveBackButton: {
    marginRight: 16,
  },
  immersiveHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  immersiveHeaderText: {
    flex: 1,
  },
  immersiveParticipantName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  immersiveOnlineStatus: {
    fontSize: 13,
    color: '#34C759',
  },
  immersiveInfoButton: {
    padding: 8,
  },
  immersiveMessagesList: {
    flexGrow: 1,
    padding: 16,
  },
  immersiveEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  immersiveEmptyIcon: {
    marginBottom: 24,
  },
  immersiveEmptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  immersiveEmptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  immersiveInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: '#38383A',
    backgroundColor: '#1C1C1E',
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 4,
  },
  immersiveInputWrapper: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  immersiveInput: {
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  immersiveSendButton: {
    marginLeft: 8,
    marginBottom: 4,
  },
  voiceButton: {
    marginLeft: 8,
    marginBottom: 4,
  },

  // Message Bubbles
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  messageBubbleMe: {
    justifyContent: 'flex-end',
  },
  messageBubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubbleAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
  },
  messageBubbleIsMe: {
    backgroundColor: '#0A84FF',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  messageTimeMe: {
    color: '#FFFFFF99',
  },
});
