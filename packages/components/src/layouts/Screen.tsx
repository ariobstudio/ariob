/**
 * Screen - Base layout container for all screens
 */

import React from 'react';
import { View, ViewProps, SafeAreaView, StatusBar } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface ScreenProps extends ViewProps {
  safe?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const stylesheet = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  padding_none: { padding: 0 },
  padding_small: { padding: theme.spacing.sm },
  padding_medium: { padding: theme.spacing.md },
  padding_large: { padding: theme.spacing.lg },
}));

export const Screen: React.FC<ScreenProps> = ({
  safe = true,
  padding = 'medium',
  style,
  children,
  ...props
}) => {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const Container = safe ? SafeAreaView : View;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <Container
        style={[
          styles.container,
          styles[`padding_${padding}`],
          style,
        ]}
        {...props}
      >
        {children}
      </Container>
    </>
  );
};
