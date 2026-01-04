/**
 * DegreeSelector - Degree filter dropdown
 *
 * Uses andromeda Dropdown molecule for consistent design.
 */

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown, type DropdownOption } from '@ariob/andromeda';
import { type DegreeId } from '@ariob/ripple';

export interface DegreeConfig {
  id: DegreeId;
  name: string;
}

export interface DegreeSelectorProps {
  /** Available degrees */
  degrees: DegreeConfig[];
  /** Currently selected degree */
  activeDegree: number;
  /** Callback when degree changes */
  onDegreeChange: (degree: number) => void;
}

export function DegreeSelector({
  degrees,
  activeDegree,
  onDegreeChange,
}: DegreeSelectorProps) {
  const insets = useSafeAreaInsets();

  // Convert degrees to dropdown options
  const options: DropdownOption[] = degrees.map((d) => ({
    id: d.id,
    label: d.name,
  }));

  return (
    <Dropdown
      options={options}
      value={activeDegree}
      onChange={(id) => onDegreeChange(id as number)}
      topOffset={insets.top + 48}
    />
  );
}

export default DegreeSelector;
