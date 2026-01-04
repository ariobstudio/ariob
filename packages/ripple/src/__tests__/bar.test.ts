/**
 * Tests for Bar Stack Operations
 *
 * The Bar uses a stack-based navigation model inspired by block editors.
 * Each frame in the stack can have its own mode (action/input/sheet) and controls.
 *
 * Stack operations:
 * - push: Add a new frame
 * - pop: Remove current frame, go back
 * - replace: Replace current frame
 * - reset: Clear to base frame only
 */

import {
  getCurrentFrame,
  canGoBack,
  createBaseFrame,
  type BarFrame,
  type ActionSlot,
} from '../protocols/bar';

describe('Bar Protocol Helpers', () => {
  describe('createBaseFrame', () => {
    it('creates a frame with id "base"', () => {
      const frame = createBaseFrame();
      expect(frame.id).toBe('base');
    });

    it('creates a frame in action mode', () => {
      const frame = createBaseFrame();
      expect(frame.mode).toBe('action');
    });

    it('creates a frame that cannot be dismissed', () => {
      const frame = createBaseFrame();
      expect(frame.canDismiss).toBe(false);
    });

    it('accepts optional actions', () => {
      const actions: BarFrame['actions'] = {
        primary: { icon: 'add', onPress: () => {} },
      };
      const frame = createBaseFrame(actions);
      expect(frame.actions).toBe(actions);
    });
  });

  describe('getCurrentFrame', () => {
    it('returns null for empty stack', () => {
      const frame = getCurrentFrame([]);
      expect(frame).toBeNull();
    });

    it('returns the last frame in stack', () => {
      const frames: BarFrame[] = [
        { id: 'base', mode: 'action' },
        { id: 'sheet-1', mode: 'sheet' },
        { id: 'sheet-2', mode: 'sheet' },
      ];
      const current = getCurrentFrame(frames);
      expect(current?.id).toBe('sheet-2');
    });

    it('returns the only frame in single-frame stack', () => {
      const frames: BarFrame[] = [{ id: 'base', mode: 'action' }];
      const current = getCurrentFrame(frames);
      expect(current?.id).toBe('base');
    });
  });

  describe('canGoBack', () => {
    it('returns false for empty stack', () => {
      expect(canGoBack([])).toBe(false);
    });

    it('returns false for single-frame stack', () => {
      const frames: BarFrame[] = [{ id: 'base', mode: 'action' }];
      expect(canGoBack(frames)).toBe(false);
    });

    it('returns true for multi-frame stack', () => {
      const frames: BarFrame[] = [
        { id: 'base', mode: 'action' },
        { id: 'sheet-1', mode: 'sheet' },
      ];
      expect(canGoBack(frames)).toBe(true);
    });

    it('returns true for deeply nested stack', () => {
      const frames: BarFrame[] = [
        { id: 'base', mode: 'action' },
        { id: 'sheet-1', mode: 'sheet' },
        { id: 'sheet-2', mode: 'sheet' },
        { id: 'input-1', mode: 'input' },
      ];
      expect(canGoBack(frames)).toBe(true);
    });
  });
});

describe('BarFrame Structure', () => {
  describe('Action Mode Frame', () => {
    it('supports leading, primary, and trailing actions', () => {
      const frame: BarFrame = {
        id: 'test',
        mode: 'action',
        actions: {
          leading: [{ icon: 'arrow-back', onPress: () => {} }],
          primary: { icon: 'add', onPress: () => {} },
          trailing: [{ icon: 'settings', onPress: () => {} }],
        },
      };

      expect(frame.actions?.leading).toHaveLength(1);
      expect(frame.actions?.primary?.icon).toBe('add');
      expect(frame.actions?.trailing).toHaveLength(1);
    });

    it('allows multiple leading and trailing actions', () => {
      const frame: BarFrame = {
        id: 'test',
        mode: 'action',
        actions: {
          leading: [
            { icon: 'arrow-back', onPress: () => {} },
            { icon: 'close', onPress: () => {} },
          ],
          trailing: [
            { icon: 'settings', onPress: () => {} },
            { icon: 'share', onPress: () => {} },
          ],
        },
      };

      expect(frame.actions?.leading).toHaveLength(2);
      expect(frame.actions?.trailing).toHaveLength(2);
    });

    it('allows disabled actions', () => {
      const slot: ActionSlot = {
        icon: 'send',
        onPress: () => {},
        disabled: true,
      };

      expect(slot.disabled).toBe(true);
    });

    it('allows labeled actions', () => {
      const slot: ActionSlot = {
        icon: 'send',
        label: 'Send Message',
        onPress: () => {},
      };

      expect(slot.label).toBe('Send Message');
    });
  });

  describe('Input Mode Frame', () => {
    it('supports input configuration', () => {
      const frame: BarFrame = {
        id: 'search',
        mode: 'input',
        input: {
          placeholder: 'Search...',
          autoFocus: true,
          showSendButton: false,
        },
      };

      expect(frame.input?.placeholder).toBe('Search...');
      expect(frame.input?.autoFocus).toBe(true);
      expect(frame.input?.showSendButton).toBe(false);
    });

    it('supports submit and cancel callbacks', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      const frame: BarFrame = {
        id: 'compose',
        mode: 'input',
        input: {
          onSubmit,
          onCancel,
        },
      };

      frame.input?.onSubmit?.('test');
      frame.input?.onCancel?.();

      expect(onSubmit).toHaveBeenCalledWith('test');
      expect(onCancel).toHaveBeenCalled();
    });

    it('supports left and right action buttons', () => {
      const frame: BarFrame = {
        id: 'compose',
        mode: 'input',
        input: {
          leftAction: { icon: 'camera', onPress: () => {} },
          rightAction: { icon: 'mic', onPress: () => {} },
        },
      };

      expect(frame.input?.leftAction?.icon).toBe('camera');
      expect(frame.input?.rightAction?.icon).toBe('mic');
    });
  });

  describe('Sheet Mode Frame', () => {
    it('supports content', () => {
      const content = 'Sheet Content';
      const frame: BarFrame = {
        id: 'sheet',
        mode: 'sheet',
        sheet: {
          content,
        },
      };

      expect(frame.sheet?.content).toBe(content);
    });

    it('supports fixed height', () => {
      const frame: BarFrame = {
        id: 'sheet',
        mode: 'sheet',
        sheet: {
          content: null,
          height: 300,
        },
      };

      expect(frame.sheet?.height).toBe(300);
    });

    it('supports auto height', () => {
      const frame: BarFrame = {
        id: 'sheet',
        mode: 'sheet',
        sheet: {
          content: null,
          height: 'auto',
        },
      };

      expect(frame.sheet?.height).toBe('auto');
    });
  });

  describe('Navigation Behavior', () => {
    it('supports custom back handler', () => {
      const onBack = vi.fn();
      const frame: BarFrame = {
        id: 'custom',
        mode: 'sheet',
        onBack,
      };

      frame.onBack?.();
      expect(onBack).toHaveBeenCalled();
    });

    it('supports dismissable sheets', () => {
      const frame: BarFrame = {
        id: 'dismissable',
        mode: 'sheet',
        canDismiss: true,
      };

      expect(frame.canDismiss).toBe(true);
    });

    it('supports non-dismissable sheets', () => {
      const frame: BarFrame = {
        id: 'modal',
        mode: 'sheet',
        canDismiss: false,
      };

      expect(frame.canDismiss).toBe(false);
    });
  });
});

describe('Stack Scenarios', () => {
  it('simulates compose flow: action → sheet → input → back', () => {
    const stack: BarFrame[] = [createBaseFrame({ primary: { icon: 'add', onPress: () => {} } })];

    // Open compose sheet
    stack.push({
      id: 'compose',
      mode: 'sheet',
      sheet: { content: 'ComposeSheet' },
    });
    expect(getCurrentFrame(stack)?.id).toBe('compose');
    expect(canGoBack(stack)).toBe(true);

    // Open text input
    stack.push({
      id: 'text-input',
      mode: 'input',
      input: { placeholder: 'What\'s on your mind?' },
    });
    expect(getCurrentFrame(stack)?.mode).toBe('input');
    expect(stack.length).toBe(3);

    // Go back to compose
    stack.pop();
    expect(getCurrentFrame(stack)?.id).toBe('compose');
    expect(stack.length).toBe(2);

    // Go back to base
    stack.pop();
    expect(getCurrentFrame(stack)?.id).toBe('base');
    expect(canGoBack(stack)).toBe(false);
  });

  it('simulates nested sheets: profile → settings → edit → save', () => {
    const stack: BarFrame[] = [createBaseFrame()];

    // Open profile sheet
    stack.push({
      id: 'profile',
      mode: 'sheet',
      sheet: { content: 'ProfileSheet' },
    });

    // Open settings from profile
    stack.push({
      id: 'settings',
      mode: 'sheet',
      sheet: { content: 'SettingsSheet' },
    });

    // Open edit form
    stack.push({
      id: 'edit-profile',
      mode: 'input',
      input: { placeholder: 'Enter name' },
    });

    expect(stack.length).toBe(4);
    expect(getCurrentFrame(stack)?.id).toBe('edit-profile');

    // Save and reset to base
    stack.length = 1; // reset
    expect(stack.length).toBe(1);
    expect(getCurrentFrame(stack)?.id).toBe('base');
  });

  it('simulates replace operation for mode switching', () => {
    const stack: BarFrame[] = [createBaseFrame()];

    // Open search sheet
    stack.push({
      id: 'search-sheet',
      mode: 'sheet',
      sheet: { content: 'SearchFilters' },
    });

    // Replace with input mode (same frame, different mode)
    stack[stack.length - 1] = {
      id: 'search-input',
      mode: 'input',
      input: { placeholder: 'Search users...' },
    };

    expect(stack.length).toBe(2);
    expect(getCurrentFrame(stack)?.mode).toBe('input');
  });
});
