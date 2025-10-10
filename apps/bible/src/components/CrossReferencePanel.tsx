import { Column, Row, Button, Card } from '@ariob/ui';
import { useTheme } from '@ariob/ui';
import type { CrossRefTarget } from '../types/bible';

interface CrossReferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  crossRefId: string | null;
  crossRefs: Record<string, CrossRefTarget>;
  onNavigate: (target: CrossRefTarget) => void;
}

/**
 * CrossReferencePanel - Side panel showing cross-reference destinations
 */
export function CrossReferencePanel({
  isOpen,
  onClose,
  crossRefId,
  crossRefs,
  onNavigate
}: CrossReferencePanelProps) {
  const { withTheme } = useTheme();

  if (!isOpen || !crossRefId) return null;

  const crossRef = crossRefs[crossRefId];
  if (!crossRef) return null;

  // Handle single reference or array of references
  const references = Array.isArray(crossRef) ? crossRef : [crossRef];

  return (
    <>
      {/* Backdrop */}
      <view
        className="fixed top-0 right-0 bottom-0 left-0 bg-black/50 z-40"
        bindtap={onClose}
      />

      {/* Panel */}
      <view className="fixed top-0 right-0 bottom-0 w-80 z-50 animate-slideInRight">
        <Column
          className={withTheme(
            'h-full bg-background border-l border-border shadow-2xl',
            'dark h-full bg-background border-l border-border shadow-2xl'
          )}
        >
          {/* Header */}
          <view className="px-4 py-3 border-b border-border">
            <Row align="center" justify="between">
              <text className="text-lg font-bold text-foreground">Cross References</text>
              <Button
                variant="ghost"
                size="icon"
                icon="x"
                onClick={onClose}
              />
            </Row>
          </view>

          {/* Reference List */}
          <scroll-view scroll-y className="flex-1 p-4">
            <Column spacing="sm">
              {references.map((ref, index) => {
                const displayText = ref.href ||
                  `${ref.book_abbrev || ref.book_file || ''} ${ref.chapter || ''}${ref.verse ? ':' + ref.verse : ''}${ref.verse_end ? '-' + ref.verse_end : ''}`;

                return (
                  <Card
                    key={index}
                    className="active:scale-95 transition-transform cursor-pointer"
                    bindtap={() => {
                      onNavigate(ref);
                      onClose();
                    }}
                  >
                    <view className="p-4">
                      <text className="text-base font-medium text-primary">
                        {displayText}
                      </text>
                    </view>
                  </Card>
                );
              })}
            </Column>
          </scroll-view>
        </Column>
      </view>
    </>
  );
}
