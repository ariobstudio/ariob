/**
 * Tests for the make helper factory
 */

import { make, type Def } from '../menu/make';
import type { Act } from '../menu/types';

describe('make', () => {
  it('creates a simple action from name and definition', () => {
    const action = make('post', { icon: 'add', label: 'Post' });

    expect(action).toEqual({
      name: 'post',
      icon: 'add',
      label: 'Post',
    });
  });

  it('creates an action with submenu', () => {
    const subActions: Act[] = [
      { name: 'profile', icon: 'person', label: 'Profile' },
      { name: 'theme', icon: 'color-palette', label: 'Theme' },
    ];

    const action = make('config', {
      icon: 'settings',
      label: 'Settings',
      sub: subActions,
    });

    expect(action).toEqual({
      name: 'config',
      icon: 'settings',
      label: 'Settings',
      sub: subActions,
    });
  });

  it('preserves the name from the first argument', () => {
    const action = make('custom-action', { icon: 'star', label: 'Star' });

    expect(action.name).toBe('custom-action');
  });

  it('returns an object with all properties from definition', () => {
    const def: Def = {
      icon: 'heart',
      label: 'Like',
    };

    const action = make('like', def);

    expect(action.icon).toBe(def.icon);
    expect(action.label).toBe(def.label);
  });

  it('handles nested submenus', () => {
    const action = make('menu', {
      icon: 'menu',
      label: 'Menu',
      sub: [
        {
          name: 'submenu',
          icon: 'folder',
          label: 'Submenu',
          sub: [
            { name: 'item1', icon: 'document', label: 'Item 1' },
            { name: 'item2', icon: 'document', label: 'Item 2' },
          ],
        },
      ],
    });

    expect(action.sub).toHaveLength(1);
    expect(action.sub?.[0].sub).toHaveLength(2);
  });

  it('creates multiple actions for a complete action record', () => {
    const actions = {
      post: make('post', { icon: 'add', label: 'Post' }),
      reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
      save: make('save', { icon: 'bookmark-outline', label: 'Save' }),
      share: make('share', { icon: 'share-social', label: 'Share' }),
    };

    expect(Object.keys(actions)).toHaveLength(4);
    expect(actions.post.name).toBe('post');
    expect(actions.reply.name).toBe('reply');
    expect(actions.save.name).toBe('save');
    expect(actions.share.name).toBe('share');
  });

  it('action type satisfies Act interface', () => {
    const action = make('test', { icon: 'test', label: 'Test' });

    // Type check - this would fail at compile time if types are wrong
    const act: Act = action;
    expect(act.name).toBe('test');
    expect(act.icon).toBe('test');
    expect(act.label).toBe('Test');
  });
});
