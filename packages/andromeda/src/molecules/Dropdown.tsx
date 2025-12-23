/**
 * Dropdown - Selection menu molecule
 *
 * A pressable trigger that opens a dropdown menu from the top.
 * Combines Text, Icon, and Press atoms with modal overlay.
 *
 * @example
 * ```tsx
 * const options = [
 *   { id: 'a', label: 'Option A' },
 *   { id: 'b', label: 'Option B' },
 * ];
 *
 * <Dropdown
 *   options={options}
 *   value="a"
 *   onChange={(id) => setValue(id)}
 *   placeholder="Select..."
 * />
 * ```
 */

import { useState, useCallback } from 'react';
import { View, Modal, Pressable, type ViewStyle } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Press } from '../atoms/Press';
import { space, radii } from '../tokens';

export interface DropdownOption {
  /** Unique identifier */
  id: string | number;
  /** Display label */
  label: string;
}

export interface DropdownProps {
  /** Available options */
  options: DropdownOption[];
  /** Currently selected value (id) */
  value: string | number;
  /** Called when selection changes */
  onChange: (id: string | number) => void;
  /** Placeholder when no value */
  placeholder?: string;
  /** Top offset for dropdown position */
  topOffset?: number;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  topOffset = 100,
}: DropdownProps) {
  const { theme } = useUnistyles();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.id === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  const handleSelect = useCallback((id: string | number) => {
    onChange(id);
    setIsOpen(false);
  }, [onChange]);

  return (
    <View>
      {/* Trigger */}
      <Press onPress={() => setIsOpen(!isOpen)}>
        <View style={styles.trigger}>
          <Text size="body" color="text" style={{ fontWeight: '600' }}>
            {displayLabel}
          </Text>
          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size="sm"
            color="dim"
          />
        </View>
      </Press>

      {/* Dropdown Menu */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.menu,
              {
                marginTop: topOffset,
                backgroundColor: theme.colors.surface,
                ...theme.shadow.md,
              },
            ]}
          >
            {options.map((option) => {
              const isSelected = option.id === value;
              return (
                <Press
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                >
                  <View
                    style={[
                      styles.option,
                      isSelected && { backgroundColor: theme.colors.muted },
                    ]}
                  >
                    <Text
                      size="body"
                      color="text"
                      style={isSelected ? { fontWeight: '600' } : undefined}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Icon name="checkmark" size="sm" color="text" />
                    )}
                  </View>
                </Press>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = {
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  } as ViewStyle,
  backdrop: {
    flex: 1,
  } as ViewStyle,
  menu: {
    alignSelf: 'center',
    borderRadius: radii.md,
    paddingVertical: space.xs,
    minWidth: 140,
  } as ViewStyle,
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginHorizontal: space.xs,
    borderRadius: radii.sm,
  } as ViewStyle,
};
