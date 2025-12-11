/**
 * Tab Bar Component
 *
 * Custom tab bar UI for tab navigation
 */

import { useCallback } from '@lynx-js/react';
import { Row } from '../components/primitives';
import { Icon } from '../components/ui/icon';
import { cn } from '../lib/utils';

export interface TabBarProps {
  state: any;
  navigation: any;
  tintColor?: string;
  backgroundColor?: string;
}

export function TabBar({ state, navigation, tintColor = '#3b82f6', backgroundColor }: TabBarProps) {
  const handleTabPress = useCallback((index: number, routeName: string) => {
    'background only';

    if (state.index !== index) {
      navigation.jumpTo(routeName);
    }
  }, [state.index, navigation]);

  return (
    <view
      className={cn(
        "border-t border-border",
        backgroundColor ? "" : "bg-card"
      )}
      style={{
        height: '80px',
        paddingBottom: '20px',
        backgroundColor: backgroundColor
      }}
    >
      <Row justify="around" align="center" className="flex-1 px-2">
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const options = state.routeOptions?.[route.name] || {};
          const icon = options.tabBarIcon || 'circle';
          const label = options.title || route.name;

          return (
            <view
              key={route.key}
              bindtap={() => handleTabPress(index, route.name)}
              className="flex-1 items-center justify-center py-2"
              style={{ minWidth: '60px', maxWidth: '100px' }}
            >
              <Icon
                name={icon}
                className={cn(
                  "mb-1",
                  isFocused ? "opacity-100" : "opacity-50"
                )}
                style={{
                  color: isFocused ? tintColor : '#8b8b8b',
                  fontSize: '24px'
                }}
              />
              <text
                className={cn(
                  "text-xs text-center",
                  isFocused ? "opacity-100 font-medium" : "opacity-70"
                )}
                style={{
                  color: isFocused ? tintColor : '#8b8b8b',
                  fontSize: '11px'
                }}
              >
                {label}
              </text>
            </view>
          );
        })}
      </Row>
    </view>
  );
}
