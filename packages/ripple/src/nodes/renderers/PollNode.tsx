/**
 * Poll Node Renderer
 *
 * Renders interactive polls
 * - preview: Compact poll preview with question
 * - full: Interactive poll with voting
 * - immersive: Not supported (uses full)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Poll } from '../../schemas';
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
 * Preview: Compact poll in feed
 */
function PreviewView({ data, nodeId, onPress }: NodeRenderProps<Poll>) {
  const totalVotes = data.totalVotes || 0;
  const topOptions = data.options.slice(0, 2);

  return (
    <Pressable onPress={onPress} style={styles.previewContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.authorName}>{data.authorAlias || data.author}</Text>
          <Text style={styles.timestamp}>{formatTime(data.created)}</Text>
        </View>
        <View style={styles.pollBadge}>
          <Ionicons name="bar-chart" size={12} color="#FFFFFF" />
          <Text style={styles.pollBadgeText}>Poll</Text>
        </View>
      </View>

      {/* Question */}
      <Text style={styles.previewQuestion} numberOfLines={2}>
        {data.question}
      </Text>

      {/* Top Options */}
      <View style={styles.previewOptions}>
        {topOptions.map((option, idx) => (
          <View key={option.id} style={styles.previewOption}>
            <Text style={styles.previewOptionText} numberOfLines={1}>
              {option.text}
            </Text>
            <Text style={styles.previewOptionVotes}>{option.votes} votes</Text>
          </View>
        ))}
        {data.options.length > 2 && (
          <Text style={styles.moreOptions}>+{data.options.length - 2} more options</Text>
        )}
      </View>

      {/* Stats */}
      <Text style={styles.previewStats}>
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        {data.expiresAt && ` • Ends ${formatTime(data.expiresAt)}`}
      </Text>
    </Pressable>
  );
}

/**
 * Full: Interactive poll with voting
 */
function FullView({ data, nodeId, navigation }: NodeRenderProps<Poll>) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [hasVoted, setHasVoted] = useState(false);
  const totalVotes = data.totalVotes || 0;

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    const newSelection = new Set(selectedOptions);
    if (data.multipleChoice) {
      if (newSelection.has(optionId)) {
        newSelection.delete(optionId);
      } else {
        newSelection.add(optionId);
      }
    } else {
      newSelection.clear();
      newSelection.add(optionId);
    }
    setSelectedOptions(newSelection);
  };

  const submitVote = () => {
    if (selectedOptions.size > 0) {
      setHasVoted(true);
      // TODO: Submit vote to Gun.js
    }
  };

  return (
    <View style={styles.fullContainer}>
      {/* Header */}
      <View style={styles.fullHeader}>
        <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {(data.authorAlias || data.author || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.fullHeaderText}>
          <Text style={styles.fullAuthorName}>{data.authorAlias || data.author}</Text>
          <Text style={styles.fullTimestamp}>{formatTime(data.created)}</Text>
        </View>
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Question */}
      <View style={styles.questionSection}>
        <Text style={styles.fullQuestion}>{data.question}</Text>
        {data.multipleChoice && (
          <Text style={styles.multipleChoiceHint}>Select multiple options</Text>
        )}
      </View>

      {/* Options */}
      <View style={styles.optionsSection}>
        {data.options.map((option) => {
          const isSelected = selectedOptions.has(option.id);
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

          return (
            <Pressable
              key={option.id}
              onPress={() => handleVote(option.id)}
              disabled={hasVoted}
              style={[styles.option, isSelected && styles.optionSelected, hasVoted && styles.optionDisabled]}
            >
              {hasVoted && (
                <View style={[styles.optionProgress, { width: `${percentage}%` }]} />
              )}
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>{option.text}</Text>
                {hasVoted && (
                  <Text style={styles.optionPercentage}>{percentage.toFixed(1)}%</Text>
                )}
              </View>
              {!hasVoted && (
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Vote Button */}
      {!hasVoted && (
        <View style={styles.voteButtonContainer}>
          <Pressable
            onPress={submitVote}
            disabled={selectedOptions.size === 0}
            style={[
              styles.voteButton,
              selectedOptions.size === 0 && styles.voteButtonDisabled,
            ]}
          >
            <Text style={styles.voteButtonText}>Vote</Text>
          </Pressable>
        </View>
      )}

      {/* Stats */}
      <View style={styles.pollStats}>
        <Text style={styles.pollStatsText}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
        {data.expiresAt && (
          <Text style={styles.pollStatsText}>
            Ends {formatTime(data.expiresAt)}
          </Text>
        )}
      </View>

      {/* Comments */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <Text style={styles.commentsEmpty}>No comments yet</Text>
      </View>
    </View>
  );
}

export const PollNodeRenderer: NodeRenderer<Poll> = {
  preview: PreviewView,
  full: FullView,
};

const styles = StyleSheet.create({
  // Preview
  previewContainer: {
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  meta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  pollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pollBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewQuestion: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  previewOptions: {
    gap: 8,
    marginBottom: 8,
  },
  previewOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  previewOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  previewOptionVotes: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
  moreOptions: {
    fontSize: 13,
    color: '#0A84FF',
    textAlign: 'center',
    paddingVertical: 4,
  },
  previewStats: {
    fontSize: 13,
    color: '#8E8E93',
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
  fullHeaderText: {
    flex: 1,
  },
  fullAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullTimestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  moreButton: {
    padding: 8,
  },
  questionSection: {
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  fullQuestion: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  multipleChoiceHint: {
    fontSize: 13,
    color: '#8E8E93',
  },
  optionsSection: {
    padding: 16,
    gap: 12,
  },
  option: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2C2C2E',
    overflow: 'hidden',
  },
  optionSelected: {
    borderColor: '#0A84FF',
  },
  optionDisabled: {
    opacity: 1,
  },
  optionProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0A84FF20',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 12,
  },
  optionPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  voteButtonContainer: {
    padding: 16,
  },
  voteButton: {
    paddingVertical: 16,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pollStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#38383A',
  },
  pollStatsText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  commentsEmpty: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 32,
  },
});
