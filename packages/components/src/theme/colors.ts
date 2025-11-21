/**
 * Liquid Monochrome - Grayscale Symphony Color Palette
 *
 * A refined grayscale system with depth through layering and transparency.
 * Named after water depths - from Surface to Abyss.
 */

export const colors = {
  // Base layers - Dark mode first
  abyss: '#0a0a0a',      // Deepest background
  depth: '#121212',      // Primary background
  surface: '#1a1a1a',    // Elevated surfaces
  ripple: '#242424',     // Interactive surfaces

  // Light layers (for highlights and borders)
  mist: '#2a2a2a',       // Subtle borders
  fog: '#3a3a3a',        // Hover states
  cloud: '#4a4a4a',      // Disabled states

  // Text layers - Creamy whites with transparency
  cream: '#F5F5F0',      // Primary text (creamy white)
  pearl: '#E5E5E0',      // Secondary text
  ash: '#B5B5B0',        // Tertiary text
  shadow: '#858580',     // Disabled text

  // Accent - Single accent for critical actions
  accent: '#FFFFFF',     // Pure white for emphasis

  // Semantic colors (subtle tints in grayscale)
  info: '#D0D0D0',
  success: '#C0C0C0',
  warning: '#B0B0B0',
  error: '#A0A0A0',

  // Transparency layers (for overlays)
  veil: 'rgba(18, 18, 18, 0.8)',
  whisper: 'rgba(245, 245, 240, 0.05)',
  breath: 'rgba(245, 245, 240, 0.1)',
  glow: 'rgba(255, 255, 255, 0.15)',
} as const;

export type ColorKey = keyof typeof colors;
