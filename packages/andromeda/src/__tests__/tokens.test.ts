/**
 * Tests for Andromeda design tokens
 */

import {
  colors,
  space,
  radii,
  font,
  shadow,
  timing,
  spring,
  effects,
  theme,
  type Theme,
} from '../tokens';

describe('colors', () => {
  describe('background colors', () => {
    it('exports background colors', () => {
      expect(colors.bg).toBe('#000000');
      expect(colors.surface).toBe('#0F1216');
      expect(colors.elevated).toBe('#16181C');
      expect(colors.muted).toBe('#1F2226');
    });
  });

  describe('text colors', () => {
    it('exports text color scale', () => {
      expect(colors.text).toBe('#E7E9EA');
      expect(colors.dim).toBe('#A0A4AA');
      expect(colors.faint).toBe('#6B6F76');
    });
  });

  describe('semantic colors', () => {
    it('exports semantic colors', () => {
      expect(colors.accent).toBe('#1D9BF0');
      expect(colors.success).toBe('#00BA7C');
      expect(colors.warn).toBe('#F5A524');
      expect(colors.danger).toBe('#F91880');
      expect(colors.info).toBe('#7856FF');
    });
  });

  describe('glow colors', () => {
    it('exports Liquid Trust bioluminescent colors', () => {
      expect(colors.glow.cyan).toBe('#00E5FF');
      expect(colors.glow.teal).toBe('#1DE9B6');
      expect(colors.glow.blue).toBe('#448AFF');
    });
  });

  describe('degree colors', () => {
    it('exports all five degree colors', () => {
      expect(colors.degree[0]).toBe('#FF6B9D'); // Me
      expect(colors.degree[1]).toBe('#00E5FF'); // Friends
      expect(colors.degree[2]).toBe('#7C4DFF'); // World
      expect(colors.degree[3]).toBe('#FFC107'); // Discover
      expect(colors.degree[4]).toBe('#78909C'); // Noise
    });

    it('degree 0 is Me (warm pink)', () => {
      expect(colors.degree[0]).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('degree 1 is Friends (cyan) - matches glow.cyan', () => {
      expect(colors.degree[1]).toBe(colors.glow.cyan);
    });
  });

  describe('indicator colors', () => {
    it('exports content type indicators', () => {
      expect(colors.indicator.profile).toBe('#00BA7C');
      expect(colors.indicator.message).toBe('#1D9BF0');
      expect(colors.indicator.auth).toBe('#7856FF');
      expect(colors.indicator.ai).toBe('#FACC15');
      expect(colors.indicator.post).toBe('#E7E9EA');
    });

    it('profile indicator matches success color', () => {
      expect(colors.indicator.profile).toBe(colors.success);
    });

    it('message indicator matches accent color', () => {
      expect(colors.indicator.message).toBe(colors.accent);
    });
  });

  describe('border and overlay colors', () => {
    it('exports border colors with alpha', () => {
      expect(colors.border).toBe('rgba(255,255,255,0.08)');
      expect(colors.borderSubtle).toBe('rgba(255,255,255,0.04)');
      expect(colors.borderStrong).toBe('rgba(255,255,255,0.15)');
    });

    it('exports overlay colors', () => {
      expect(colors.glass).toBe('rgba(16,18,22,0.9)');
      expect(colors.overlay).toBe('rgba(0,0,0,0.85)');
    });
  });
});

describe('space', () => {
  it('exports spacing scale', () => {
    expect(space.xxs).toBe(2);
    expect(space.xs).toBe(4);
    expect(space.sm).toBe(8);
    expect(space.md).toBe(12);
    expect(space.lg).toBe(16);
    expect(space.xl).toBe(20);
    expect(space.xxl).toBe(28);
    expect(space.xxxl).toBe(40);
  });

  it('values increase monotonically', () => {
    const values = [
      space.xxs,
      space.xs,
      space.sm,
      space.md,
      space.lg,
      space.xl,
      space.xxl,
      space.xxxl,
    ];

    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it('all values are positive numbers', () => {
    Object.values(space).forEach((value) => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });
});

describe('radii', () => {
  it('exports border radius scale', () => {
    expect(radii.sm).toBe(6);
    expect(radii.md).toBe(12);
    expect(radii.lg).toBe(18);
    expect(radii.xl).toBe(24);
    expect(radii.pill).toBe(999);
    expect(radii.full).toBe(999);
  });

  it('pill and full are equivalent', () => {
    expect(radii.pill).toBe(radii.full);
  });

  it('standard sizes increase', () => {
    expect(radii.sm).toBeLessThan(radii.md);
    expect(radii.md).toBeLessThan(radii.lg);
    expect(radii.lg).toBeLessThan(radii.xl);
  });
});

describe('font', () => {
  it('exports typography scale', () => {
    expect(font).toHaveProperty('title');
    expect(font).toHaveProperty('heading');
    expect(font).toHaveProperty('body');
    expect(font).toHaveProperty('caption');
    expect(font).toHaveProperty('mono');
  });

  it('title is largest', () => {
    expect(font.title.size).toBe(24);
    expect(font.title.weight).toBe('700');
  });

  it('heading is second largest', () => {
    expect(font.heading.size).toBe(18);
    expect(font.heading.weight).toBe('600');
  });

  it('body is standard size', () => {
    expect(font.body.size).toBe(15);
    expect(font.body.weight).toBe('500');
  });

  it('caption is smaller', () => {
    expect(font.caption.size).toBe(12);
  });

  it('mono is smallest with increased weight', () => {
    expect(font.mono.size).toBe(11);
    expect(font.mono.weight).toBe('600');
  });

  it('sizes decrease from title to mono', () => {
    expect(font.title.size).toBeGreaterThan(font.heading.size);
    expect(font.heading.size).toBeGreaterThan(font.body.size);
    expect(font.body.size).toBeGreaterThan(font.caption.size);
    expect(font.caption.size).toBeGreaterThan(font.mono.size);
  });
});

describe('shadow', () => {
  it('exports shadow presets', () => {
    expect(shadow).toHaveProperty('sm');
    expect(shadow).toHaveProperty('md');
    expect(shadow).toHaveProperty('lg');
  });

  it('each shadow has required properties', () => {
    const shadowSizes = ['sm', 'md', 'lg'] as const;

    shadowSizes.forEach((size) => {
      const s = shadow[size];
      expect(s).toHaveProperty('shadowColor');
      expect(s).toHaveProperty('shadowOffset');
      expect(s).toHaveProperty('shadowOpacity');
      expect(s).toHaveProperty('shadowRadius');
      expect(s).toHaveProperty('elevation');
    });
  });

  it('shadow intensity increases with size', () => {
    expect(shadow.sm.shadowRadius).toBeLessThan(shadow.md.shadowRadius);
    expect(shadow.md.shadowRadius).toBeLessThan(shadow.lg.shadowRadius);
    expect(shadow.sm.elevation).toBeLessThan(shadow.md.elevation);
    expect(shadow.md.elevation).toBeLessThan(shadow.lg.elevation);
  });

  it('all shadows use black as base color', () => {
    expect(shadow.sm.shadowColor).toBe('#000');
    expect(shadow.md.shadowColor).toBe('#000');
    expect(shadow.lg.shadowColor).toBe('#000');
  });
});

describe('timing', () => {
  it('exports timing constants', () => {
    expect(timing.fast).toBe(150);
    expect(timing.normal).toBe(250);
    expect(timing.slow).toBe(400);
  });

  it('values are in expected range for animations', () => {
    expect(timing.fast).toBeGreaterThan(0);
    expect(timing.fast).toBeLessThan(timing.normal);
    expect(timing.normal).toBeLessThan(timing.slow);
    expect(timing.slow).toBeLessThan(1000); // Under 1 second
  });
});

describe('spring', () => {
  it('exports spring animation presets', () => {
    expect(spring).toHaveProperty('snappy');
    expect(spring).toHaveProperty('smooth');
    expect(spring).toHaveProperty('bouncy');
    expect(spring).toHaveProperty('gentle');
  });

  it('each spring has damping, stiffness, and mass', () => {
    const springNames = ['snappy', 'smooth', 'bouncy', 'gentle'] as const;

    springNames.forEach((name) => {
      const s = spring[name];
      expect(s).toHaveProperty('damping');
      expect(s).toHaveProperty('stiffness');
      expect(s).toHaveProperty('mass');
      expect(typeof s.damping).toBe('number');
      expect(typeof s.stiffness).toBe('number');
      expect(typeof s.mass).toBe('number');
    });
  });

  it('snappy has highest stiffness', () => {
    expect(spring.snappy.stiffness).toBeGreaterThan(spring.smooth.stiffness);
    expect(spring.snappy.stiffness).toBeGreaterThan(spring.bouncy.stiffness);
    expect(spring.snappy.stiffness).toBeGreaterThan(spring.gentle.stiffness);
  });

  it('bouncy has lowest damping for more oscillation', () => {
    expect(spring.bouncy.damping).toBeLessThan(spring.snappy.damping);
    expect(spring.bouncy.damping).toBeLessThan(spring.smooth.damping);
    expect(spring.bouncy.damping).toBeLessThan(spring.gentle.damping);
  });

  it('all springs have positive values', () => {
    const springNames = ['snappy', 'smooth', 'bouncy', 'gentle'] as const;

    springNames.forEach((name) => {
      const s = spring[name];
      expect(s.damping).toBeGreaterThan(0);
      expect(s.stiffness).toBeGreaterThan(0);
      expect(s.mass).toBeGreaterThan(0);
    });
  });
});

describe('effects', () => {
  describe('divider effects', () => {
    it('exports divider colors', () => {
      expect(effects.divider.subtle).toBe('rgba(255,255,255,0.03)');
      expect(effects.divider.strong).toBe('rgba(255,255,255,0.08)');
    });
  });

  describe('outline effects', () => {
    it('exports outline colors', () => {
      expect(effects.outline.focus).toBe('rgba(29,155,240,0.45)');
      expect(effects.outline.glow).toBe('rgba(0,229,255,0.30)');
    });
  });

  describe('glow effects', () => {
    it('exports glow colors', () => {
      expect(effects.glow.accent).toBe('rgba(29,155,240,0.35)');
      expect(effects.glow.cyan).toBe('rgba(0,229,255,0.40)');
      expect(effects.glow.success).toBe('rgba(0,186,124,0.35)');
    });
  });
});

describe('theme', () => {
  it('exports complete theme object', () => {
    expect(theme).toHaveProperty('colors');
    expect(theme).toHaveProperty('space');
    expect(theme).toHaveProperty('radii');
    expect(theme).toHaveProperty('font');
    expect(theme).toHaveProperty('shadow');
    expect(theme).toHaveProperty('timing');
    expect(theme).toHaveProperty('spring');
    expect(theme).toHaveProperty('effects');
  });

  it('theme.colors references the colors export', () => {
    expect(theme.colors).toBe(colors);
  });

  it('theme.space references the space export', () => {
    expect(theme.space).toBe(space);
  });

  it('theme.radii references the radii export', () => {
    expect(theme.radii).toBe(radii);
  });

  it('theme.font references the font export', () => {
    expect(theme.font).toBe(font);
  });

  it('theme.spring references the spring export', () => {
    expect(theme.spring).toBe(spring);
  });

  it('theme is typed correctly', () => {
    // Type check - this verifies the Theme type is correctly exported
    const t: Theme = theme;
    expect(t.colors.accent).toBeDefined();
    expect(t.space.md).toBeDefined();
    expect(t.radii.pill).toBeDefined();
  });
});
