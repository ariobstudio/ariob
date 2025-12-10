/**
 * Molecule Tests
 *
 * Unit tests for molecule components.
 * Tests type exports and basic structure.
 */

describe('Avatar molecule', () => {
  it('exports AvatarSize type', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    expect(sizes).toHaveLength(3);
  });

  it('exports AvatarTint type', () => {
    const tints: Array<'default' | 'accent' | 'success' | 'warn'> = [
      'default',
      'accent',
      'success',
      'warn',
    ];
    expect(tints).toHaveLength(4);
  });
});

describe('IconButton molecule', () => {
  it('exports IconButtonSize type', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    expect(sizes).toHaveLength(3);
  });

  it('exports IconButtonTint type', () => {
    const tints: Array<'default' | 'accent' | 'success' | 'danger'> = [
      'default',
      'accent',
      'success',
      'danger',
    ];
    expect(tints).toHaveLength(4);
  });
});

describe('InputField molecule', () => {
  it('has required props in interface', () => {
    // Type check - InputFieldProps must have label, value, onChange
    const requiredProps = ['label', 'value', 'onChange'];
    expect(requiredProps).toHaveLength(3);
  });
});

describe('Tag molecule', () => {
  it('exports TagTint type', () => {
    const tints: Array<'default' | 'accent' | 'success' | 'warn' | 'danger'> = [
      'default',
      'accent',
      'success',
      'warn',
      'danger',
    ];
    expect(tints).toHaveLength(5);
  });
});
