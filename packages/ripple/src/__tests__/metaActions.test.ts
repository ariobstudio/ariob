import { resolveMetaActions } from '../pill/meta';
import type { PillState } from '../pill/meta';

const baseState: PillState = {
  viewDegree: 0,
  hasProfile: false,
  fullViewData: null,
  focusedNodeId: null,
};

describe('resolveMetaActions', () => {
  it('returns auth action when profile absent', () => {
    const actions = resolveMetaActions(baseState);
    expect(actions.center.action).toBe('create');
    expect(actions.right?.action).toBe('auth_options');
  });

  it('returns edit profile action in full view for self', () => {
    const actions = resolveMetaActions({
      ...baseState,
      hasProfile: true,
      fullViewData: { type: 'profile', author: 'You', isMe: true },
    });
    expect(actions.left?.action).toBe('back');
    expect(actions.center.action).toBe('edit_profile');
  });

  it('shows close action when focused', () => {
    const actions = resolveMetaActions({
      ...baseState,
      focusedNodeId: 'creation-node',
    });
    expect(actions.center.action).toBe('close');
    expect(actions.left).toBeNull();
    expect(actions.right).toBeNull();
  });
});

