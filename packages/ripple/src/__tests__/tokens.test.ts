/**
 * Tests for Ripple theme tokens
 */

import {
  ripplePalettes,
  rippleSpacing,
  rippleRadii,
  rippleTypography,
  rippleEffects,
  rippleSprings,
  rippleBreakpoints,
  rippleThemes,
  createRippleTheme,
  type RippleTheme,
  type RippleThemeMode,
} from '../styles/tokens';

describe('ripplePalettes', () => {
  it('exports dark and light palettes', () => {
    expect(ripplePalettes).toHaveProperty('dark');
    expect(ripplePalettes).toHaveProperty('light');
  });

  describe('dark palette', () => {
    const dark = ripplePalettes.dark;

    it('has all required background colors', () => {
      expect(dark.background).toBe('#000000');
      expect(dark.surface).toBe('#0F1216');
      expect(dark.surfaceElevated).toBe('#16181C');
      expect(dark.surfaceMuted).toBe('#1F2226');
      expect(dark.overlay).toBe('rgba(0,0,0,0.85)');
    });

    it('has all required border colors', () => {
      expect(dark.borderSubtle).toBe('rgba(255,255,255,0.04)');
      expect(dark.border).toBe('rgba(255,255,255,0.08)');
      expect(dark.borderStrong).toBe('rgba(255,255,255,0.15)');
    });

    it('has all required text colors', () => {
      expect(dark.textPrimary).toBe('#E7E9EA');
      expect(dark.textSecondary).toBe('#A0A4AA');
      expect(dark.textMuted).toBe('#6B6F76');
      expect(dark.text).toBe('#E7E9EA'); // alias
      expect(dark.textTertiary).toBe('#6B6F76'); // alias
    });

    it('has all semantic colors', () => {
      expect(dark.accent).toBe('#1D9BF0');
      expect(dark.accentSoft).toBe('rgba(29,155,240,0.15)');
      expect(dark.accentGlow).toBe('#00E5FF');
      expect(dark.success).toBe('#00BA7C');
      expect(dark.warning).toBe('#F5A524');
      expect(dark.danger).toBe('#F91880');
      expect(dark.info).toBe('#7A7FFF');
      expect(dark.glass).toBe('rgba(16,18,22,0.9)');
    });

    it('has all five degree colors', () => {
      expect(dark.degree[0]).toBe('#FF6B9D'); // Me
      expect(dark.degree[1]).toBe('#00E5FF'); // Friends
      expect(dark.degree[2]).toBe('#7C4DFF'); // World
      expect(dark.degree[3]).toBe('#FFC107'); // Discover
      expect(dark.degree[4]).toBe('#78909C'); // Noise
    });

    it('has all indicator colors', () => {
      expect(dark.indicator.profile).toBe('#00BA7C');
      expect(dark.indicator.message).toBe('#1D9BF0');
      expect(dark.indicator.auth).toBe('#7856FF');
      expect(dark.indicator.ai).toBe('#FACC15');
      expect(dark.indicator.post).toBe('#E7E9EA');
    });
  });

  describe('light palette', () => {
    const light = ripplePalettes.light;

    it('has different background colors than dark', () => {
      expect(light.background).toBe('#F7F7FA');
      expect(light.surface).toBe('#FFFFFF');
      expect(light.surfaceElevated).toBe('#F2F3F7');
    });

    it('has appropriate light mode text colors', () => {
      expect(light.textPrimary).toBe('#1F2125');
      expect(light.textSecondary).toBe('#4A4D52');
      expect(light.textMuted).toBe('#6F737C');
    });

    it('has adjusted degree colors for light mode', () => {
      expect(light.degree[0]).toBe('#E91E63'); // Darker pink
      expect(light.degree[1]).toBe('#00B8D4'); // Darker cyan
      expect(light.degree[2]).toBe('#651FFF'); // Darker purple
      expect(light.degree[3]).toBe('#FF8F00'); // Darker amber
      expect(light.degree[4]).toBe('#546E7A'); // Darker gray
    });
  });
});

describe('rippleSpacing', () => {
  it('exports spacing scale with correct values', () => {
    expect(rippleSpacing.xxs).toBe(2);
    expect(rippleSpacing.xs).toBe(4);
    expect(rippleSpacing.sm).toBe(8);
    expect(rippleSpacing.md).toBe(12);
    expect(rippleSpacing.lg).toBe(16);
    expect(rippleSpacing.xl).toBe(20);
    expect(rippleSpacing.xxl).toBe(28);
    expect(rippleSpacing.xxxl).toBe(40);
  });

  it('has increasing values', () => {
    const values = [
      rippleSpacing.xxs,
      rippleSpacing.xs,
      rippleSpacing.sm,
      rippleSpacing.md,
      rippleSpacing.lg,
      rippleSpacing.xl,
      rippleSpacing.xxl,
      rippleSpacing.xxxl,
    ];

    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe('rippleRadii', () => {
  it('exports border radii with correct values', () => {
    expect(rippleRadii.sm).toBe(6);
    expect(rippleRadii.md).toBe(12);
    expect(rippleRadii.lg).toBe(18);
    expect(rippleRadii.xl).toBe(24);
    expect(rippleRadii.pill).toBe(999);
  });
});

describe('rippleTypography', () => {
  it('exports typography scale with all sizes', () => {
    expect(rippleTypography).toHaveProperty('title');
    expect(rippleTypography).toHaveProperty('heading');
    expect(rippleTypography).toHaveProperty('body');
    expect(rippleTypography).toHaveProperty('caption');
    expect(rippleTypography).toHaveProperty('mono');
  });

  it('title has correct properties', () => {
    expect(rippleTypography.title.fontSize).toBe(24);
    expect(rippleTypography.title.fontWeight).toBe('700');
    expect(rippleTypography.title.letterSpacing).toBe(-0.5);
  });

  it('body has correct properties including lineHeight', () => {
    expect(rippleTypography.body.fontSize).toBe(15);
    expect(rippleTypography.body.fontWeight).toBe('500');
    expect(rippleTypography.body.lineHeight).toBe(20);
  });
});

describe('rippleEffects', () => {
  it('exports divider effects', () => {
    expect(rippleEffects.divider.subtle).toBe('rgba(255,255,255,0.03)');
    expect(rippleEffects.divider.strong).toBe('rgba(255,255,255,0.08)');
  });

  it('exports outline effects', () => {
    expect(rippleEffects.outline.focus).toBe('rgba(29,155,240,0.45)');
    expect(rippleEffects.outline.glow).toBe('rgba(0,229,255,0.30)');
  });

  it('exports glow effects', () => {
    expect(rippleEffects.glow.accent).toBe('rgba(29,155,240,0.35)');
    expect(rippleEffects.glow.cyan).toBe('rgba(0,229,255,0.40)');
    expect(rippleEffects.glow.success).toBe('rgba(0,186,124,0.35)');
    expect(rippleEffects.glow.danger).toBe('rgba(249,24,128,0.35)');
  });

  it('exports shadow presets with correct structure', () => {
    expect(rippleEffects.shadow.subtle).toMatchObject({
      shadowColor: '#000',
      shadowOpacity: expect.any(Number),
      shadowRadius: expect.any(Number),
      elevation: expect.any(Number),
    });

    expect(rippleEffects.shadow.glow.shadowColor).toBe('#00E5FF');
  });
});

describe('rippleSprings', () => {
  it('exports spring animation presets', () => {
    expect(rippleSprings).toHaveProperty('snappy');
    expect(rippleSprings).toHaveProperty('smooth');
    expect(rippleSprings).toHaveProperty('bouncy');
    expect(rippleSprings).toHaveProperty('gentle');
  });

  it('each spring has damping, stiffness, and mass', () => {
    const springNames = ['snappy', 'smooth', 'bouncy', 'gentle'] as const;

    springNames.forEach((name) => {
      const spring = rippleSprings[name];
      expect(spring).toHaveProperty('damping');
      expect(spring).toHaveProperty('stiffness');
      expect(spring).toHaveProperty('mass');
      expect(typeof spring.damping).toBe('number');
      expect(typeof spring.stiffness).toBe('number');
      expect(typeof spring.mass).toBe('number');
    });
  });

  it('snappy has highest stiffness for quick interactions', () => {
    expect(rippleSprings.snappy.stiffness).toBeGreaterThan(
      rippleSprings.smooth.stiffness
    );
    expect(rippleSprings.snappy.stiffness).toBeGreaterThan(
      rippleSprings.bouncy.stiffness
    );
  });
});

describe('rippleBreakpoints', () => {
  it('exports responsive breakpoints', () => {
    expect(rippleBreakpoints.xs).toBe(0);
    expect(rippleBreakpoints.sm).toBe(360);
    expect(rippleBreakpoints.md).toBe(768);
    expect(rippleBreakpoints.lg).toBe(1024);
    expect(rippleBreakpoints.xl).toBe(1440);
  });
});

describe('createRippleTheme', () => {
  it('creates a dark theme with all properties', () => {
    const theme = createRippleTheme('dark');

    expect(theme.colors).toBe(ripplePalettes.dark);
    expect(theme.spacing).toBe(rippleSpacing);
    expect(theme.radii).toBe(rippleRadii);
    expect(theme.typography).toBe(rippleTypography);
    expect(theme.effects).toBe(rippleEffects);
    expect(theme.springs).toBe(rippleSprings);
  });

  it('creates a light theme with light palette', () => {
    const theme = createRippleTheme('light');

    expect(theme.colors).toBe(ripplePalettes.light);
  });
});

describe('rippleThemes', () => {
  it('exports pre-built dark and light themes', () => {
    expect(rippleThemes).toHaveProperty('dark');
    expect(rippleThemes).toHaveProperty('light');
  });

  it('dark theme has correct structure', () => {
    const dark = rippleThemes.dark;

    expect(dark).toHaveProperty('colors');
    expect(dark).toHaveProperty('spacing');
    expect(dark).toHaveProperty('radii');
    expect(dark).toHaveProperty('typography');
    expect(dark).toHaveProperty('effects');
    expect(dark).toHaveProperty('springs');
  });

  it('themes are equivalent to createRippleTheme output', () => {
    expect(rippleThemes.dark).toEqual(createRippleTheme('dark'));
    expect(rippleThemes.light).toEqual(createRippleTheme('light'));
  });
});
