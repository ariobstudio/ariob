import { Pressable, Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useThemeColor } from '@/constants/theme';

interface ToolbarIconButtonProps {
  icon: string;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function ToolbarIconButton({
  icon,
  label,
  active = false,
  disabled = false,
  onPress,
}: ToolbarIconButtonProps) {
  // Use theme colors via useCSSVariable hook
  const foregroundColor = useThemeColor('foreground');
  const mutedColor = useThemeColor('muted');
  const placeholderColor = useThemeColor('field-placeholder');

  const iconColor = active
    ? foregroundColor
    : disabled
      ? placeholderColor
      : mutedColor;

  return (
    <Pressable
      className={`px-3 py-2.5 rounded-lg mx-0.5 min-w-[44px] items-center justify-center ${
        active ? 'bg-accent' : ''
      }`}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        pressed && !disabled && {
          backgroundColor: typeof mutedColor === 'string' ? mutedColor + '33' : 'rgba(142, 142, 147, 0.2)'
        }
      ]}
    >
      <View className="flex-row items-center gap-1">
        <FontAwesome6 name={icon} size={18} color={iconColor as string} />
        {label && (
          <Text
            className={`text-xs font-semibold ${
              active ? 'text-accent-foreground' :
              disabled ? 'text-field-placeholder' :
              'text-muted'
            }`}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
