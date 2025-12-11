/**
 * Variant Selector Screen
 *
 * Allows players to choose between Senterej (Ethiopian Chess) and Standard International Chess
 * before creating a new game session.
 */

import * as React from '@lynx-js/react';
import { Column, Button, Icon, Row, Scrollable, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Stack, cn } from '@ariob/ui';
import { useAuth, type IGunChainReference } from '@ariob/core';
import type { ChessVariant, Session } from '../types';
import type { NavigatorInstance } from '../components/Navigation';
import { useSettings } from '../store/settings';

interface VariantOption {
  id: ChessVariant;
  name: string;
  subtitle: string;
  description: string;
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popular?: boolean;
}

const variants: VariantOption[] = [
  {
    id: 'senterej',
    name: 'Senterej',
    subtitle: 'የሰንጠረዥ - Ethiopian Chess',
    description: 'Traditional Ethiopian chess with unique Werera phase where pawns that reach the end become super-charged.',
    features: [
      'Unique Werera phase',
      'Traditional piece names',
      'Rich cultural heritage',
      'Fast-paced endgame',
    ],
    difficulty: 'intermediate',
    popular: true,
  },
  {
    id: 'standard',
    name: 'Standard Chess',
    subtitle: 'International Rules',
    description: 'Classic international chess with standard FIDE rules. The most widely played chess variant worldwide.',
    features: [
      'FIDE standard rules',
      'Castling & En passant',
      'Pawn promotion',
      'Draw by repetition',
    ],
    difficulty: 'beginner',
  },
];

export interface VariantSelectorProps {
  data?: {
    defaultVariant?: ChessVariant;
  };
  navigator?: NavigatorInstance;
  graph: IGunChainReference;
}

export function VariantSelector({ data, navigator, graph }: VariantSelectorProps) {
  const defaultVariant = data?.defaultVariant || 'senterej';
  const [selectedVariant, setSelectedVariant] = React.useState<ChessVariant>(defaultVariant);
  const [isCreating, setIsCreating] = React.useState(false);

  const { user, isLoggedIn } = useAuth(graph);
  const displayName = useSettings((state) => state.displayName);

  const handleConfirm = () => {
    'background only';

    if (!user || !isLoggedIn) {
      console.log('[VariantSelector] Cannot create session: user not logged in');
      return;
    }

    setIsCreating(true);

    const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: Session = {
      id: sessionId,
      createdAt: Date.now(),
      variant: selectedVariant,
      phase: selectedVariant === 'senterej' ? 'werera' : 'normal',
      player1Pub: user.pub,
      player1Alias: displayName || 'Player',
      status: 'waiting',
    };

    console.log('[VariantSelector] Creating session:', sessionId, 'Variant:', selectedVariant);

    const sessionRef = graph.get('senterej').get('sessions').get(sessionId);
    sessionRef.put(session, (ack: any) => {
      'background only';

      if (ack.err) {
        console.error('[VariantSelector] Error creating session:', ack.err);
        setIsCreating(false);
        return;
      }

      console.log('[VariantSelector] ✓ Session created');

      // Navigate to game
      if (navigator) {
        navigator.navigate('game', { sessionId, isCreator: true });
      }

      setIsCreating(false);
    });
  };

  const handleBack = () => {
    'background only';
    if (navigator) {
      navigator.goBack();
    }
  };

  return (
    <Column height="screen" spacing="none" className="bg-background text-foreground pt-safe-top pb-safe-bottom">
      <view className="border-b border-border/60 px-5 pb-3">
        <Row className="items-center gap-3">
          <Button variant="ghost" size="icon" onTap={handleBack}>
            <Icon name="arrow-left" size="sm" />
          </Button>
          <Column spacing="xs">
            <text className="text-lg font-semibold">Choose Variant</text>
            <text className="text-xs text-muted-foreground">
              Pick how you want to play.
            </text>
          </Column>
        </Row>
      </view>

      <Scrollable direction="vertical" className="flex-1" padding="lg">
        <Stack spacing="md">
          {variants.map((variant) => {
            const isSelected = selectedVariant === variant.id;

            return (
              <Card
                key={variant.id}
                radius="lg"
                className={cn(
                  'border-border/60 bg-card transition-colors',
                  isSelected && 'border-primary/60'
                )}
                bindtap={() => {
                  'background only';
                  setSelectedVariant(variant.id);
                }}
              >
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <view className="flex flex-col gap-1">
                    <CardTitle>{variant.name}</CardTitle>
                    <CardDescription>{variant.subtitle}</CardDescription>
                  </view>
                  {isSelected && <Icon name="check" className="text-primary" size="sm" />}
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-6">
                  <text className="text-sm text-muted-foreground">
                    {variant.description}
                  </text>

                  <Stack spacing="sm">
                    {variant.features.slice(0, 3).map((feature, index) => (
                      <Row key={index} spacing="sm" align="center" className="text-xs text-muted-foreground">
                        <view className="h-1.5 w-1.5 rounded-full bg-primary" style={{ opacity: 0.7 }} />
                        <text>{feature}</text>
                      </Row>
                    ))}
                  </Stack>

                  <Row spacing="sm" align="center">
                    <Badge variant="secondary">{variant.difficulty}</Badge>
                    {variant.popular && (
                      <Badge variant="outline">
                        <Icon name="sparkles" size="sm" />
                        <text>Popular pick</text>
                      </Badge>
                    )}
                  </Row>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Scrollable>

      <view className="border-t border-border/60 px-5 pb-safe-bottom pt-4">
        <Button
          size="lg"
          onTap={handleConfirm}
          disabled={isCreating}
          loading={isCreating}
          prefix={<Icon name="arrow-right" />}
        >
          {isCreating ? 'Starting…' : 'Start Match'}
        </Button>
      </view>
    </Column>
  );
}
