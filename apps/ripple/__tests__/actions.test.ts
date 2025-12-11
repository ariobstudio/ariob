/**
 * Action Picker Tests
 *
 * Tests the `resolve` function from @ariob/ripple which determines
 * what actions to show in the floating action bar based on:
 * - Current degree (0-4)
 * - Authentication state (profile: boolean)
 * - View state (focused node, detail view, feed view)
 */

// Import directly from the menu module to avoid React Native component parsing issues
import { resolve } from '../../../packages/ripple/src/menu/pick';
import type { View } from '../../../packages/ripple/src/menu/types';

const baseView: View = {
  degree: 0,
  profile: false,
  full: undefined,
  node: undefined,
};

describe('Action Picker (resolve)', () => {
  describe('Focus Mode', () => {
    it('shows only close action when a node is focused', () => {
      const acts = resolve({
        ...baseView,
        node: 'creation-node',
      });
      expect(acts.main.name).toBe('close');
      expect(acts.left).toBeNull();
      expect(acts.right).toBeNull();
    });
  });

  describe('Detail View', () => {
    it('shows back + context action + options in detail view', () => {
      const acts = resolve({
        ...baseView,
        full: { type: 'post', author: 'Alice' },
      });
      expect(acts.left?.name).toBe('back');
      expect(acts.main).toBeDefined();
      expect(acts.right?.name).toBe('opts');
    });

    it('shows edit action for own profile', () => {
      const acts = resolve({
        ...baseView,
        profile: true,
        full: { type: 'profile', author: 'You', isMe: true },
      });
      expect(acts.left?.name).toBe('back');
      expect(acts.main.name).toBe('edit');
      expect(acts.right?.name).toBe('opts');
    });

    it('shows link action for other profiles', () => {
      const acts = resolve({
        ...baseView,
        profile: true,
        full: { type: 'profile', author: 'Alice', isMe: false },
      });
      expect(acts.left?.name).toBe('back');
      // For non-self profiles, uses the default profile detail action
      expect(acts.main.name).not.toBe('edit');
    });
  });

  describe('Degree 0 - Me', () => {
    it('shows create action when unauthenticated', () => {
      const acts = resolve({
        ...baseView,
        degree: 0,
        profile: false,
      });
      expect(acts.main.name).toBe('create');
      // No side actions when unauthenticated at degree 0
      expect(acts.left).toBeNull();
      expect(acts.right).toBeNull();
    });

    it('shows post + config + more when authenticated', () => {
      const acts = resolve({
        ...baseView,
        degree: 0,
        profile: true,
      });
      expect(acts.main.name).toBe('post');
      expect(acts.left?.name).toBe('config');
      expect(acts.right?.name).toBe('more');
    });
  });

  describe('Degree 1 - Friends', () => {
    it('shows post + find for friends feed', () => {
      const acts = resolve({
        ...baseView,
        degree: 1,
        profile: true,
      });
      expect(acts.main.name).toBe('post');
      expect(acts.left).toBeNull();
      expect(acts.right?.name).toBe('find');
    });
  });

  describe('Degree 2 - World', () => {
    it('shows post + trend + search for world feed', () => {
      const acts = resolve({
        ...baseView,
        degree: 2,
        profile: true,
      });
      expect(acts.main.name).toBe('post');
      expect(acts.left?.name).toBe('trend');
      expect(acts.right?.name).toBe('search');
    });
  });

  describe('Degree 3 - Discover', () => {
    it('shows post + filter + trend for discover feed', () => {
      const acts = resolve({
        ...baseView,
        degree: 3,
      });
      expect(acts.main.name).toBe('post');
      expect(acts.left?.name).toBe('filter');
      expect(acts.right?.name).toBe('trend');
    });
  });

  describe('Degree 4 - Noise', () => {
    it('shows post + mute + report for noise feed', () => {
      const acts = resolve({
        ...baseView,
        degree: 4,
      });
      expect(acts.main.name).toBe('post');
      expect(acts.left?.name).toBe('mute');
      expect(acts.right?.name).toBe('report');
    });
  });

  describe('Priority', () => {
    it('focus takes priority over detail view', () => {
      const acts = resolve({
        ...baseView,
        node: 'some-node',
        full: { type: 'post' },
      });
      expect(acts.main.name).toBe('close');
    });

    it('detail view takes priority over degree-based pickers', () => {
      const acts = resolve({
        ...baseView,
        degree: 4, // Would normally show mute/report
        full: { type: 'post' },
      });
      expect(acts.left?.name).toBe('back');
      expect(acts.right?.name).toBe('opts');
    });
  });
});
