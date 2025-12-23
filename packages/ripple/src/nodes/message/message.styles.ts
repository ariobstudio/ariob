import { StyleSheet } from 'react-native-unistyles';

export const messageStyles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: 8,
  },
  messages: {
    width: '100%',
    gap: 2,
  },
  msgRow: {
    width: '100%',
    flexDirection: 'row',
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
  },
  replySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  replyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}));
