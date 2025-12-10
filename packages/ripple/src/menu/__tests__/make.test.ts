/**
 * Make Helper Tests
 *
 * Unit tests for the action factory helper.
 */

import { make } from '../make';

describe('make', () => {
  it('creates action with name and icon', () => {
    const action = make('post', { icon: 'add', label: 'Post' });

    expect(action).toEqual({
      name: 'post',
      icon: 'add',
      label: 'Post',
    });
  });

  it('preserves sub actions', () => {
    const action = make('config', {
      icon: 'settings',
      label: 'Settings',
      sub: [
        { name: 'theme', icon: 'color-palette', label: 'Theme' },
        { name: 'profile', icon: 'person', label: 'Profile' },
      ],
    });

    expect(action.sub).toHaveLength(2);
    expect(action.sub![0].name).toBe('theme');
    expect(action.sub![1].name).toBe('profile');
  });

  it('handles empty sub array', () => {
    const action = make('test', {
      icon: 'test',
      label: 'Test',
      sub: [],
    });

    expect(action.sub).toEqual([]);
  });

  it('handles missing sub property', () => {
    const action = make('simple', { icon: 'star', label: 'Simple' });

    expect(action.sub).toBeUndefined();
  });

  it('returns correct type structure', () => {
    const action = make('reply', { icon: 'arrow-undo', label: 'Reply' });

    expect(typeof action.name).toBe('string');
    expect(typeof action.icon).toBe('string');
    expect(typeof action.label).toBe('string');
  });
});

describe('make usage patterns', () => {
  it('can be used to build action records', () => {
    const actions = {
      post: make('post', { icon: 'add', label: 'Post' }),
      reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
      save: make('save', { icon: 'bookmark', label: 'Save' }),
    };

    expect(Object.keys(actions)).toEqual(['post', 'reply', 'save']);
    expect(actions.post.name).toBe('post');
    expect(actions.reply.icon).toBe('arrow-undo');
  });

  it('supports nested menu structure', () => {
    const config = make('config', {
      icon: 'settings',
      label: 'Settings',
      sub: [
        make('profile', { icon: 'person', label: 'Profile' }),
        make('theme', { icon: 'color-palette', label: 'Theme' }),
      ],
    });

    expect(config.sub).toHaveLength(2);
    expect(config.sub![0]).toEqual({
      name: 'profile',
      icon: 'person',
      label: 'Profile',
    });
  });
});
