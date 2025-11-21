/**
 * PollCard - Interactive poll with fluid vote animations
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { Poll } from '../schemas';
import { ContentCard } from './ContentCard';
import { theme } from '../../../../apps/ripple/theme';

interface PollCardProps {
  poll: Poll;
  onPress?: () => void;
  onVote?: (optionId: string) => void;
}

export function PollCard({ poll, onPress, onVote }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleVote = (optionId: string) => {
    setSelectedOption(optionId);
    onVote?.(optionId);
  };

  return (
    <ContentCard onPress={onPress}>
      <View style={styles.container}>
        {/* Question */}
        <Text style={styles.question}>{poll.question}</Text>

        {/* Options with animated fill */}
        <View style={styles.options}>
          {poll.options.map((option) => {
            const percentage =
              poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
            const isSelected = selectedOption === option.id;

            return (
              <PollOption
                key={option.id}
                option={option}
                percentage={percentage}
                isSelected={isSelected}
                onPress={() => handleVote(option.id)}
              />
            );
          })}
        </View>

        {/* Poll metadata */}
        <Text style={styles.metadata}>
          {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
          {poll.expiresAt && ` · Ends in ${getTimeRemaining(poll.expiresAt)}`}
        </Text>
      </View>
    </ContentCard>
  );
}

function PollOption({
  option,
  percentage,
  isSelected,
  onPress,
}: {
  option: any;
  percentage: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const fillWidth = useSharedValue(0);

  React.useEffect(() => {
    fillWidth.value = withTiming(percentage, { duration: 800 });
  }, [percentage]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value}%`,
  }));

  return (
    <Pressable onPress={onPress} style={styles.option}>
      {/* Animated fill */}
      <Animated.View
        style={[
          styles.optionFill,
          fillStyle,
          isSelected && styles.optionFillSelected,
        ]}
      />

      {/* Content */}
      <View style={styles.optionContent}>
        <Text style={styles.optionText}>{option.text}</Text>
        <Text style={styles.optionPercentage}>{Math.round(percentage)}%</Text>
      </View>
    </Pressable>
  );
}

function getTimeRemaining(expiresAt: number): string {
  const now = Date.now();
  const diff = expiresAt - now;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return '< 1h';
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    lineHeight: 26,
  },
  options: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  option: {
    position: 'relative',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: `${theme.colors.border}60`,
    overflow: 'hidden',
    minHeight: 48,
    justifyContent: 'center',
  },
  optionFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: `${theme.colors.text}12`,
  },
  optionFillSelected: {
    backgroundColor: `${theme.colors.text}20`,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    zIndex: 1,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  optionPercentage: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginLeft: theme.spacing.md,
  },
  metadata: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
