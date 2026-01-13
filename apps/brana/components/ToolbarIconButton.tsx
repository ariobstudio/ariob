import { Pressable, Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

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
  const iconColor = active
    ? '#FFFFFF'
    : disabled
      ? '#636366'
      : '#8E8E93';

  return (
    <Pressable
      className={`px-3 py-2.5 rounded-lg mx-0.5 min-w-[44px] items-center justify-center ${
        active ? 'bg-blue-500' : ''
      }`}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        pressed && !disabled && { backgroundColor: 'rgba(142, 142, 147, 0.2)' }
      ]}
    >
      <View className="flex-row items-center gap-1">
        <FontAwesome6 name={icon} size={18} color={iconColor} />
        {label && (
          <Text
            className={`text-xs font-semibold ${
              active ? 'text-white' : disabled ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
