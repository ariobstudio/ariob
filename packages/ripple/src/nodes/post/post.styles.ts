import { StyleSheet } from 'react-native-unistyles';

export const postStyles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  content: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.body.fontWeight,
    letterSpacing: theme.typography.body.letterSpacing,
  },
  imageContainer: {
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
}));
