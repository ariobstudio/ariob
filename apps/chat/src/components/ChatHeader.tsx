import { Button, Icon, Alert, AlertDescription } from '@ariob/ui';
import { lucideGlyphs } from '@ariob/ui';
import { StatusBadge } from './StatusBadge';
import { ModelSelector } from './ModelSelector';

type LucideName = keyof typeof lucideGlyphs;

interface ChatHeaderProps {
  // Status
  statusLabel: string;
  statusIcon: LucideName;
  statusVariant: 'default' | 'loading' | 'success' | 'warning' | 'error';
  statusAnimated: boolean;

  // Theme
  currentTheme: 'Light' | 'Dark' | 'Auto';
  onToggleTheme: () => void;

  // Conversation
  onResetConversation: () => void;

  // Model Selection
  selectedModel: string | null;
  showModelSelector: boolean;
  onToggleModelSelector: () => void;
  onModelSelect: (modelName: string) => void;

  // Error
  listError?: string | null;
}

export function ChatHeader({
  statusLabel,
  statusIcon,
  statusVariant,
  statusAnimated,
  currentTheme,
  onToggleTheme,
  onResetConversation,
  selectedModel,
  showModelSelector,
  onToggleModelSelector,
  onModelSelect,
  listError,
}: ChatHeaderProps) {
  const themeIcon: LucideName =
    currentTheme === 'Light' ? 'sun' : currentTheme === 'Dark' ? 'moon' : 'monitor';

  return (
    <view className="flex-shrink-0 px-5 py-4 bg-card border-b border-border ">
      <view className="flex flex-col gap-3">
        {/* Top Row - Title, Status and Actions */}
        <view className="flex items-center justify-between">
          <view className="flex items-center gap-2.5">
            <text className="text-lg font-semibold text-foreground">Chat</text>
            <StatusBadge
              label={statusLabel}
              icon={statusIcon}
              variant={statusVariant}
              animated={statusAnimated}
            />
          </view>
          <view className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="default"
              icon={themeIcon}
              aria-label="Toggle theme"
              className="text-muted-foreground hover:text-foreground"
              bindtap={onToggleTheme}
            />
            <Button
              variant="ghost"
              size="default"
              icon="trash-2"
              aria-label="Clear conversation"
              className="text-muted-foreground hover:text-destructive"
              bindtap={onResetConversation}
            />
          </view>
        </view>

        {/* Model Selection - Clean and Minimal */}
        <view className="space-y-2">
          <view className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card transition-colors">
            <view className="flex items-center gap-2.5 flex-1 min-w-0">
              <Icon
                name="cpu"
                className="text-base flex-shrink-0 text-muted-foreground"
              />
              <view className="flex-1 min-w-0">
                <text className="text-xs font-medium text-muted-foreground block">
                  Model
                </text>
                <text className="text-sm font-semibold text-foreground block truncate">
                  {selectedModel || 'Select a model'}
                </text>
              </view>
            </view>
            <Button
              variant="ghost"
              size="default"
              icon="chevron-down"
              aria-label="Select model"
              className={`text-muted-foreground flex-shrink-0 ${showModelSelector ? 'rotate-180' : ''} transition-transform`}
              bindtap={onToggleModelSelector}
            />
          </view>

          {/* Model Selection Dropdown */}
          {showModelSelector && (
            <view className="relative">
              <ModelSelector onModelSelect={onModelSelect} />
            </view>
          )}
        </view>

        {/* Error Display */}
        {listError && !showModelSelector && (
          <Alert variant="destructive" className="border-destructive bg-destructive">
            <AlertDescription>{listError}</AlertDescription>
          </Alert>
        )}
      </view>
    </view>
  );
}
