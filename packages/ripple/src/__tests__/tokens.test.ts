/**
 * Tests for Ripple theme tokens
 *
 * Updated to reflect Apple iOS design system colors.
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

    it('has all required background colors (iOS System Colors)', () => {
      expect(dark.background).toBe('#000000');
      expect(dark.surface).toBe('#1C1C1E');  // iOS System Gray 6 Dark
      expect(dark.surfaceElevated).toBe('#2C2C2E');  // iOS System Gray 5 Dark
      expect(dark.surfaceMuted).toBe('#151517');
      expect(dark.overlay).toBe('rgba(0,0,0,0.7)');
    });

    it('has all required border colors', () => {
      expect(dark.borderSubtle).toBe('rgba(255,255,255,0.08)');
      expect(dark.border).toBe('rgba(255,255,255,0.12)');
      expect(dark.borderStrong).toBe('rgba(255,255,255,0.2)');
    });

    it('has all required text colors', () => {
      expect(dark.textPrimary).toBe('#F5F5F7');
      expect(dark.textSecondary).toBe('#98989D');
      expect(dark.textMuted).toBe('#636366');
      expect(dark.text).toBe('#F5F5F7'); // alias
      expect(dark.textTertiary).toBe('#636366'); // alias
    });

    it('has all semantic colors (iOS style)', () => {
      expect(dark.accent).toBe('#0A84FF');  // iOS Blue
      expect(dark.accentSoft).toBe('rgba(10,132,255,0.15)');
      expect(dark.accentGlow).toBe('rgba(10,132,255,0.3)');
      expect(dark.success).toBe('#30D158');  // iOS Green
      expect(dark.warning).toBe('#FFD60A');  // iOS Yellow
      expect(dark.danger).toBe('#FF453A');   // iOS Red
      expect(dark.info).toBe('#5E5CE6');     // iOS Indigo
      expect(dark.glass).toBe('rgba(30,30,30,0.8)');
    });

    it('has all five degree colors (iOS inspired)', () => {
      expect(dark.degree[0]).toBe('#FF375F'); // Me (Pink)
      expect(dark.degree[1]).toBe('#64D2FF'); // Friends (Cyan)
      expect(dark.degree[2]).toBe('#BF5AF2'); // World (Purple)
      expect(dark.degree[3]).toBe('#FFD60A'); // Discover (Yellow)
      expect(dark.degree[4]).toBe('#8E8E93'); // Noise (Gray)
    });

    it('has all indicator colors', () => {
      expect(dark.indicator.profile).toBe('#30D158');
      expect(dark.indicator.message).toBe('#0A84FF');
      expect(dark.indicator.auth).toBe('#5E5CE6');
      expect(dark.indicator.ai).toBe('#FF9F0A');
      expect(dark.indicator.post).toBe('#F5F5F7');
    });

    it('has glow colors for effects', () => {
      expect(dark.glow.cyan).toBe('#64D2FF');
      expect(dark.glow.teal).toBe('#6AC4DC');
      expect(dark.glow.blue).toBe('#409CFF');
    });
  });

  describe('light palette', () => {
    const light = ripplePalettes.light;

    it('has different background colors than dark', () => {
      expect(light.background).toBe('#F5F5F7');  // iOS System Gray 6
      expect(light.surface).toBe('#FFFFFF');
      expect(light.surfaceElevated).toBe('#FFFFFF');
      expect(light.surfaceMuted).toBe('#F2F2F7');
    });

    it('has appropriate light mode text colors', () => {
      expect(light.textPrimary).toBe('#1D1D1F');
      expect(light.textSecondary).toBe('#86868B');
      expect(light.textMuted).toBe('#AEAEB2');
    });

    it('has adjusted degree colors for light mode', () => {
      expect(light.degree[0]).toBe('#FF2D55'); // Darker pink
      expect(light.degree[1]).toBe('#5AC8FA'); // iOS Cyan
      expect(light.degree[2]).toBe('#AF52DE'); // iOS Purple
      expect(light.degree[3]).toBe('#FFCC00'); // iOS Yellow
      expect(light.degree[4]).toBe('#8E8E93'); // iOS Gray
    });

    it('has light mode accent colors', () => {
      expect(light.accent).toBe('#0071E3');  // Apple vibrant blue
      expect(light.success).toBe('#34C759'); // iOS Green Light
      expect(light.danger).toBe('#FF3B30');  // iOS Red Light
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
    expect(rippleRadii.sm).toBe(8);
    expect(rippleRadii.md).toBe(16);
    expect(rippleRadii.lg).toBe(24);
    expect(rippleRadii.xl).toBe(32);
    expect(rippleRadii.pill).toBe(999);
  });

  it('has increasing values (except pill)', () => {
    expect(rippleRadii.md).toBeGreaterThan(rippleRadii.sm);
    expect(rippleRadii.lg).toBeGreaterThan(rippleRadii.md);
    expect(rippleRadii.xl).toBeGreaterThan(rippleRadii.lg);
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
    expect(rippleTypography.title.fontSize).toBe(28);
    expect(rippleTypography.title.fontWeight).toBe('700');
    expect(rippleTypography.title.letterSpacing).toBe(-0.5);
  });

  it('heading has correct properties', () => {
    expect(rippleTypography.heading.fontSize).toBe(20);
    expect(rippleTypography.heading.fontWeight).toBe('600');
  });

  it('body has correct properties including lineHeight', () => {
    expect(rippleTypography.body.fontSize).toBe(16);
    expect(rippleTypography.body.fontWeight).toBe('400');
    expect(rippleTypography.body.lineHeight).toBe(24);
  });

  it('caption has correct properties', () => {
    expect(rippleTypography.caption.fontSize).toBe(13);
    expect(rippleTypography.caption.fontWeight).toBe('400');
  });

  it('mono has correct properties', () => {
    expect(rippleTypography.mono.fontSize).toBe(12);
    expect(rippleTypography.mono.fontWeight).toBe('500');
  });
});

describe('rippleEffects', () => {
  it('exports divider effects', () => {
    expect(rippleEffects.divider.subtle).toBe('rgba(0,0,0,0.05)');
    expect(rippleEffects.divider.strong).toBe('rgba(0,0,0,0.1)');
  });

  it('exports outline effects', () => {
    expect(rippleEffects.outline.focus).toBe('rgba(0,113,227,0.4)');
    expect(rippleEffects.outline.glow).toBe('rgba(90,200,250,0.3)');
  });

  it('exports glow effects', () => {
    expect(rippleEffects.glow.accent).toBe('rgba(0,113,227,0.2)');
    expect(rippleEffects.glow.cyan).toBe('rgba(90,200,250,0.25)');
    expect(rippleEffects.glow.success).toBe('rgba(52,199,89,0.2)');
    expect(rippleEffects.glow.danger).toBe('rgba(255,59,48,0.2)');
  });

  it('exports shadow presets with correct structure', () => {
    expect(rippleEffects.shadow.subtle).toMatchObject({
      shadowColor: '#000',
      shadowOpacity: expect.any(Number),
      shadowRadius: expect.any(Number),
      elevation: expect.any(Number),
    });

    expect(rippleEffects.shadow.medium).toHaveProperty('shadowColor');
    expect(rippleEffects.shadow.strong).toHaveProperty('elevation');
    expect(rippleEffects.shadow.glow.shadowColor).toBe('#007AFF');
  });

  it('shadow presets have increasing intensity', () => {
    expect(rippleEffects.shadow.medium.shadowOpacity).toBeGreaterThan(
      rippleEffects.shadow.subtle.shadowOpacity
    );
    expect(rippleEffects.shadow.strong.shadowOpacity).toBeGreaterThan(
      rippleEffects.shadow.medium.shadowOpacity
    );
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

  it('smooth has highest stiffness for Apple-style animations', () => {
    expect(rippleSprings.smooth.stiffness).toBeGreaterThan(
      rippleSprings.snappy.stiffness
    );
    expect(rippleSprings.smooth.stiffness).toBeGreaterThan(
      rippleSprings.bouncy.stiffness
    );
  });

  it('gentle has lowest stiffness for slow reveals', () => {
    expect(rippleSprings.gentle.stiffness).toBeLessThan(
      rippleSprings.snappy.stiffness
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

  it('has increasing values', () => {
    expect(rippleBreakpoints.sm).toBeGreaterThan(rippleBreakpoints.xs);
    expect(rippleBreakpoints.md).toBeGreaterThan(rippleBreakpoints.sm);
    expect(rippleBreakpoints.lg).toBeGreaterThan(rippleBreakpoints.md);
    expect(rippleBreakpoints.xl).toBeGreaterThan(rippleBreakpoints.lg);
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

  it('includes Andromeda compatibility aliases', () => {
    const theme = createRippleTheme('dark');

    expect(theme.space).toBe(rippleSpacing);
    expect(theme.shadow).toBe(rippleEffects.shadow);
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
