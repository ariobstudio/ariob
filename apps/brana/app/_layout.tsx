import '../global.css';
import { useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { HeroUINativeProvider, type HeroUINativeConfig } from 'heroui-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_400Regular_Italic,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';
import { useThemeColor } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const heroConfig: HeroUINativeConfig = {
  textProps: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexMono_400Regular,
    IBMPlexMono_400Regular_Italic,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_700Bold,
  });

  // Theme colors - memoized to prevent infinite re-renders
  const colorScheme = useColorScheme();
  // Use direct color values to ensure consistency across all screens
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#E4E4E4';
  const rootStyle = useMemo(() => ({ flex: 1, backgroundColor }), [backgroundColor]);
  const contentStyle = useMemo(() => ({ backgroundColor }), [backgroundColor]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={rootStyle} onLayout={onLayoutRootView}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardProvider>
        <HeroUINativeProvider config={heroConfig}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle,
              animation: 'default',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="archive" />
            <Stack.Screen name="settings" />
          </Stack>
        </HeroUINativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
