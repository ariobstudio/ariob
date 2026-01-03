/**
 * App Components
 *
 * Modular, reusable components for the ariob app.
 * Screens use useBar() hook from @ariob/ripple to configure bar actions.
 */

export { DegreeSelector, type DegreeSelectorProps, type DegreeConfig } from './DegreeSelector';
export * from './sheets';
export * from './feed';

// Re-export from features for backwards compatibility
export { ProfileCard, type ProfileCardProps } from '../features/profile';
export { AICard, type AICardProps } from '../features/ai';
