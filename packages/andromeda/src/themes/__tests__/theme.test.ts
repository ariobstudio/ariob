/**
 * Theme Tests
 *
 * Unit tests for the theme protocol implementation.
 */

import { theme } from '../impl';
import { dark } from '../dark';
import { light } from '../light';

describe('theme', () => {
  beforeEach(() => {
    // Reset to dark theme before each test
    theme.set('dark');
  });

  describe('get', () => {
    it('returns theme data object', () => {
      const data = theme.get();
      expect(data).toBeDefined();
      expect(data.colors).toBeDefined();
      expect(data.space).toBeDefined();
      expect(data.radii).toBeDefined();
      expect(data.font).toBeDefined();
      expect(data.spring).toBeDefined();
      expect(data.shadow).toBeDefined();
    });

    it('returns dark theme by default', () => {
      const data = theme.get();
      expect(data.colors.bg).toBe(dark.colors.bg);
      expect(data.colors.text).toBe(dark.colors.text);
    });
  });

  describe('set', () => {
    it('changes current theme to light', () => {
      theme.set('light');
      expect(theme.name()).toBe('light');
      expect(theme.get().colors.bg).toBe(light.colors.bg);
    });

    it('changes current theme to dark', () => {
      theme.set('light');
      theme.set('dark');
      expect(theme.name()).toBe('dark');
      expect(theme.get().colors.bg).toBe(dark.colors.bg);
    });

    it('ignores invalid theme name', () => {
      const before = theme.name();
      theme.set('invalid');
      expect(theme.name()).toBe(before);
    });

    it('ignores empty string', () => {
      const before = theme.name();
      theme.set('');
      expect(theme.name()).toBe(before);
    });
  });

  describe('list', () => {
    it('returns array of theme names', () => {
      const list = theme.list();
      expect(Array.isArray(list)).toBe(true);
      expect(list).toContain('dark');
      expect(list).toContain('light');
    });

    it('has exactly 2 themes', () => {
      expect(theme.list()).toHaveLength(2);
    });
  });

  describe('name', () => {
    it('returns current theme name', () => {
      expect(theme.name()).toBe('dark');
    });

    it('updates after set', () => {
      theme.set('light');
      expect(theme.name()).toBe('light');
    });
  });
});

describe('dark theme', () => {
  it('has valid color palette', () => {
    expect(dark.colors.bg).toBe('#000000');
    expect(dark.colors.text).toBe('#E7E9EA');
    expect(dark.colors.accent).toBe('#1D9BF0');
  });

  it('has all degree colors', () => {
    expect(dark.colors.degree[0]).toBeDefined();
    expect(dark.colors.degree[1]).toBeDefined();
    expect(dark.colors.degree[2]).toBeDefined();
    expect(dark.colors.degree[3]).toBeDefined();
    expect(dark.colors.degree[4]).toBeDefined();
  });

  it('has glow colors', () => {
    expect(dark.colors.glow.cyan).toBe('#00E5FF');
    expect(dark.colors.glow.teal).toBe('#1DE9B6');
    expect(dark.colors.glow.blue).toBe('#448AFF');
  });
});

describe('light theme', () => {
  it('has valid color palette', () => {
    expect(light.colors.bg).toBe('#FFFFFF');
    expect(light.colors.text).toBe('#0F1419');
    expect(light.colors.accent).toBe('#1D9BF0');
  });

  it('has inverted overlay colors', () => {
    expect(light.colors.glass).toContain('255,255,255');
    expect(dark.colors.glass).toContain('16,18,22');
  });

  it('shares same space values with dark', () => {
    expect(light.space).toEqual(dark.space);
  });

  it('shares same radii values with dark', () => {
    expect(light.radii).toEqual(dark.radii);
  });

  it('shares same spring values with dark', () => {
    expect(light.spring).toEqual(dark.spring);
  });
});
