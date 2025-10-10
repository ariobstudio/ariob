import { Column, Row, Button } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * BottomSheet - Sliding panel from bottom for footnotes, liturgy notes, etc.
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const { withTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <view
        className="fixed top-0 right-0 bottom-0 left-0 bg-black/50 z-40"
        bindtap={onClose}
      />

      {/* Sheet */}
      <view className="fixed bottom-0 left-0 right-0 z-50 animate-slideInUp">
        <Column
          className={withTheme(
            'bg-background border-t border-border rounded-t-3xl shadow-2xl',
            'dark bg-background border-t border-border rounded-t-3xl shadow-2xl'
          )}
        >
          {/* Header */}
          <view className="px-4 py-3 border-b border-border">
            <Row align="center" justify="between">
              <text className="text-lg font-bold text-foreground">{title}</text>
              <Button
                variant="ghost"
                size="icon"
                icon="x"
                onClick={onClose}
              />
            </Row>
          </view>

          {/* Content */}
          <scroll-view scroll-y className="max-h-96 px-4 py-4 pb-8">
            {children}
          </scroll-view>
        </Column>
      </view>
    </>
  );
}
