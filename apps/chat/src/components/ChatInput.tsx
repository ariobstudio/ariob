import { useRef, useEffect } from '@lynx-js/react';
import { Button, Input } from '@ariob/ui';
import { Alert, AlertDescription } from '@ariob/ui';

interface ChatInputProps {
  onSend: () => void;
  onInput: (event: any) => void;
  onKeydown?: (event: any) => void;
  disabled?: boolean;
  placeholder?: string;
  errorMessage?: string | null;
  canSend?: boolean;
  isGenerating?: boolean;
  onDismissError?: () => void;
  value?: string;
}

export function ChatInput({
  onSend,
  onInput,
  onKeydown,
  disabled = false,
  placeholder = 'Type a message...',
  errorMessage,
  canSend = false,
  isGenerating = false,
  onDismissError,
  value = '',
}: ChatInputProps) {
  const inputRef = useRef<any>(null);

  // Clear input when value prop becomes empty
  useEffect(() => {
    if (value === '' && inputRef.current) {
      // @ts-ignore lynx is provided by runtime
      lynx
        .createSelectorQuery()
        .select('#chat-input')
        .invoke({
          method: 'setValue',
          params: { value: '' },
        })
        .exec();
    }
  }, [value]);

  return (
    <view
      id="composer-panel"
      className="flex-shrink-0 px-4 pt-2 pb-8 bg-card backdrop-blur-xl"
    >
      {errorMessage ? (
        <Alert
          variant="destructive"
          className="mb-2.5 border-destructive bg-destructive"
          onDismiss={onDismissError}
        >
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <view className="flex w-full max-w-2xl items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
        <view className="flex-1">
          <Input
            id="chat-input"
            ref={inputRef}
            className="w-full border-none bg-transparent px-0 text-sm text-foreground"
            type="text"
            placeholder={placeholder}
            value={value}
            show-soft-input-on-focus
            bindinput={onInput}
            bindconfirm={onSend}
            bindkeydown={onKeydown}
            disabled={disabled}
          />
        </view>
        <Button
          variant={canSend ? 'default' : 'ghost'}
          size="icon"
          icon={isGenerating ? 'loader-circle' : 'send'}
          disabled={!canSend}
          className={`flex-shrink-0 h-8 w-8 ${isGenerating ? 'animate-spin' : ''} ${!canSend ? 'opacity-40' : ''}`}
          bindtap={onSend}
        />
      </view>
    </view>
  );
}
