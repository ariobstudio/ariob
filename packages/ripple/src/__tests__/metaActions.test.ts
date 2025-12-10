import { resolve } from '../menu/pick';
import type { View } from '../menu/types';

const baseView: View = {
  degree: 0,
  profile: false,
  full: undefined,
  node: undefined,
};

describe('resolve', () => {
  it('returns create action when unauthenticated (profile: false)', () => {
    const acts = resolve(baseView);
    // When unauthenticated (profile: false), mainUnauthenticated is used
    expect(acts.main.name).toBe('create');
    expect(acts.right?.name).toBe('auth');
  });

  it('returns edit action in full view for self', () => {
    const acts = resolve({
      ...baseView,
      profile: true,
      full: { type: 'profile', author: 'You', isMe: true },
    });
    expect(acts.left?.name).toBe('back');
    expect(acts.main.name).toBe('edit');
  });

  it('shows close action when focused', () => {
    const acts = resolve({
      ...baseView,
      node: 'creation-node',
    });
    expect(acts.main.name).toBe('close');
    expect(acts.left).toBeNull();
    expect(acts.right).toBeNull();
  });

  it('returns filter and trend for discover degree', () => {
    const acts = resolve({ ...baseView, degree: 3 });
    expect(acts.left?.name).toBe('filter');
    expect(acts.main.name).toBe('post');
    expect(acts.right?.name).toBe('trend');
  });

  it('returns mute and report for noise degree', () => {
    const acts = resolve({ ...baseView, degree: 4 });
    expect(acts.left?.name).toBe('mute');
    expect(acts.main.name).toBe('post');
    expect(acts.right?.name).toBe('report');
  });
});
