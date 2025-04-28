// Export basic UI components
export { Button } from './button/Button';
// Layout components
export { Container } from './Container';
export { Layout } from './Layout';
export { ScrollableContent } from './ScrollableContent';
export { PageHeader } from './PageHeader';
export { PageContainer } from './PageContainer';
export { AppNavigation } from './AppNavigation';
export { Header } from './Header';
export { Navigator } from './Navigator';

// Primitives
export { Box } from './primitives/Box';
export { Flex } from './primitives/Flex';
export { Spacer } from './primitives/Spacer';
export { Pressable } from './primitives/Pressable';
export { Text } from './primitives/Text';
export { Image } from './primitives/Image';
export { Page } from './primitives/Page';

// UI Components
export { Avatar } from './avatar/Avatar';
export { Badge } from './badge/Badge';
export { Card } from './card/Card';
export { Chip } from './chip/Chip';
export { Input } from './input/Input';
export { List } from './list/List';
export { ListItem } from './list/ListItem';
export { Modal } from './modal/Modal';
export { Progress } from './progress/Progress';
export { Spinner } from './spinner/Spinner';
export { StatusDot } from './status-dot/StatusDot';
export { Accordion } from './accordion/Accordion';
export { Tooltip } from './tooltip/Tooltip';

// Theme Provider (placeholder implementation)
export const ThemeProvider = ({ children }: { children: any }) => children;
export const useTheme = () => ({ isDark: false, colors: { primary: '#3b82f6' } });