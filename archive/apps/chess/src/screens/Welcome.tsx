/**
 * Welcome Screen
 *
 * First-launch carousel that introduces key Senterej concepts
 * and captures a display name before entering the lobby.
 */

import { useState } from '@lynx-js/react';
import {
  Column,
  Row,
  Button,
  Icon,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Carousel,
  Scrollable,
  useTheme,
  Theme,
  cn,
} from '@ariob/ui';
import { useUserProfile } from '@ariob/core';
import type { IGunChainReference } from '@ariob/core';
import type { NavigatorInstance } from '../components/Navigation';
import { useSettings } from '../store/settings';
import heroLightIcon from '../assets/pieces/king-white.png';
import heroDarkIcon from '../assets/pieces/king-black.png';
import logoLight from '../assets/lynx-logo.png';
import logoDark from '../assets/react-logo.png';

export interface WelcomeScreenProps {
  data?: any;
  navigator?: NavigatorInstance;
  graph: IGunChainReference;
}

import type { IconProps } from '@ariob/ui';

interface WelcomeSlide {
  icon: IconProps['name'];
  title: string;
  subtitle: string;
  description: string;
}

const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    icon: 'zap',
    title: 'Werera Phase',
    subtitle: 'አስፈላጊ የጀመርና ተወላጅ እንቅስቃሴ',
    description: 'Simultaneous opening unique to Senterej that keeps both players involved from move one.',
  },
  {
    icon: 'users',
    title: 'Real-time Multiplayer',
    subtitle: 'በመንገድ ላይ በሁሉም አለም ዙሪያ',
    description: 'Instantly match with opponents worldwide or invite friends to private tables.',
  },
  {
    icon: 'landmark',
    title: 'Historic Strategy',
    subtitle: 'የታሪካዊ ዘመናዊ ውጊያ',
    description: 'Ancient Ethiopian chess brought to modern play with thoughtful UX and Senterej lore.',
  },
];

/**
 * Welcome screen component
 */
export function WelcomeScreen({ navigator, graph }: WelcomeScreenProps) {
  const settings = useSettings();
  const { updateAlias, isLoggedIn } = useUserProfile(graph);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { currentTheme } = useTheme();

  const heroIcon = currentTheme === Theme.Dark ? heroDarkIcon : heroLightIcon;
  const logoIcon = currentTheme === Theme.Dark ? logoDark : logoLight;

  const handleContinue = () => {
    'background only';

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }

    settings.updateDisplayName(trimmedName);
    settings.updateSettings({ hasCompletedOnboarding: true });

    if (isLoggedIn) {
      updateAlias(trimmedName);
    }

    navigator?.navigate('lobby');
  };

  return (
    <Column height="screen" spacing="none" className="bg-background">
      <Scrollable className="flex-1 px-5 pb-safe-bottom">
        <Column spacing="xl">
          <Row align="center" justify="between">
            <view className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card">
              <image
                src={logoIcon}
                mode="aspectFit"
                style={{ width: '70%', height: '70%' }}
              />
            </view>
          </Row>

          <Column align="center" spacing="sm" className="text-center">
            <view className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm">
              <image
                src={heroIcon}
                mode="aspectFit"
                style={{ width: '72%', height: '72%' }}
              />
            </view>
            <Column spacing="xs">
              <text className="text-2xl font-semibold text-foreground">Senterej</text>
              <text className="text-xs text-muted-foreground">
                Ancient strategy, streamlined for today.
              </text>
            </Column>
          </Column>

          <view className="h-52 w-full overflow-hidden rounded-2xl border border-border/60 bg-card">
            <Carousel
              currentPage={currentSlide}
              onPageChange={setCurrentSlide}
              className="h-full w-full"
            >
              {WELCOME_SLIDES.map((slide) => (
                <view
                  key={slide.title}
                  className="flex h-full w-full flex-col justify-between px-6 py-6"
                >
                  <Row align="center" spacing="md">
                    <view className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-secondary">
                      <Icon name={slide.icon} size="sm" className="text-primary" />
                    </view>
                    <Column spacing="xs">
                      <text className="text-base font-semibold text-foreground">{slide.title}</text>
                      <text className="text-xs text-muted-foreground">{slide.subtitle}</text>
                    </Column>
                  </Row>
                  <text className="text-sm leading-relaxed text-muted-foreground">
                    {slide.description}
                  </text>
                </view>
              ))}
            </Carousel>
          </view>

          <Row spacing="sm" justify="center">
            {WELCOME_SLIDES.map((_, index) => (
              <view
                key={index}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  currentSlide === index ? 'w-6 bg-primary' : 'bg-muted-foreground/40'
                )}
              />
            ))}
          </Row>

          <Card radius="lg">
            <CardHeader>
              <CardTitle>Introduce yourself</CardTitle>
              <CardDescription>Choose the name other players will see.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Column spacing="xs">
                <text className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Display Name
                </text>
                <Input
                  value={name}
                  onChange={(value) => {
                    setName(value);
                    setError('');
                  }}
                  placeholder="Enter your name"
                  className="w-full"
                  maxlength={20}
                />
                {error && <text className="text-xs text-destructive">{error}</text>}
              </Column>

              <Button
                onTap={handleContinue}
                size="lg"
                className="w-full"
                prefix={<Icon name="arrow-right" />}
                disabled={!name.trim()}
              >
                Enter Lobby
              </Button>
            </CardContent>
          </Card>

          <text className="text-xs text-muted-foreground text-center">
            You can update this later from settings.
          </text>
        </Column>
      </Scrollable>
    </Column>
  );
}
