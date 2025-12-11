import { Icon, lucideGlyphs } from '@ariob/ui';
import type { NativeAIRole } from '@ariob/ai';

type LucideName = keyof typeof lucideGlyphs;

export interface ChatMessageData {
  id: string;
  role: NativeAIRole;
  content: string;
  pending?: boolean;
  createdAt?: number;
}

interface RolePalette {
  bubble: string;
  text: string;
  label: string;
  avatar: string;
  icon: LucideName;
  title: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

const getRoleStyles = (role: NativeAIRole): RolePalette => {
  switch (role) {
    case 'user':
      return {
        bubble: 'bg-primary text-primary-foreground border border-primary shadow-[var(--shadow-lg)]',
        text: 'text-primary-foreground',
        label: 'text-primary-foreground',
        avatar: 'bg-primary-foreground text-primary shadow-[var(--shadow-xs)]',
        icon: 'user',
        title: 'You',
      };
    case 'assistant':
      return {
        bubble: 'bg-secondary text-secondary-foreground border border-border shadow-[var(--shadow-md)]',
        label: 'text-secondary-foreground',
        text: 'text-secondary-foreground',
        avatar: 'bg-muted text-muted-foreground shadow-[var(--shadow-xs)]',
        icon: 'bot',
        title: 'Assistant',
      };
    default:
      return {
        bubble: 'bg-muted text-muted-foreground border border-border shadow-[var(--shadow-sm)]',
        text: 'text-muted-foreground',
        label: 'text-muted-foreground',
        avatar: 'bg-muted-foreground text-muted shadow-[var(--shadow-xs)]',
        icon: 'shield',
        title: 'System',
      };
  }
};

const ThinkingIndicator = ({ palette }: { palette: RolePalette }) => (
  <view className="flex items-center gap-2 py-2">
    <Icon
      name="loader-circle"
      className={`h-5 w-5 ${palette.text}`}
      style={{ animation: 'spin 1s linear infinite' }}
    />
    <text className={`text-sm ${palette.text} opacity-70`}>Thinking...</text>
  </view>
);

const MessageHeader = ({ palette, createdAt }: { palette: RolePalette; createdAt?: number }) => (
  <view className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.35em]">
    <view
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${palette.avatar}`}
      aria-hidden
    >
      <Icon name={palette.icon} className="text-base" />
    </view>
    <text className={`font-semibold ${palette.label}`}>{palette.title}</text>
    {createdAt ? (
      <text className={`text-[9px] ml-auto ${palette.label}`}>
        {new Date(createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </text>
    ) : null}
  </view>
);

export function ChatMessage({ message }: ChatMessageProps) {
  const palette = getRoleStyles(message.role);
  const isThinking = message.pending && !message.content;
  const content = message.content || '';
  const alignmentClass = message.role === 'user' ? 'self-end' : 'self-start';
  const bubbleStateClass = message.pending ? 'border-border' : '';

  return (
    <view
      id={message.id}
      className={`flex max-w-[80%] flex-col gap-3 rounded-[calc(var(--radius)*1.05)] border px-5 py-4 transition-all duration-300 ${palette.bubble} ${alignmentClass} ${bubbleStateClass} mb-4`}
      aria-label={`${palette.title} message`}
    >
      <MessageHeader palette={palette} createdAt={message.createdAt} />

      {isThinking ? (
        <ThinkingIndicator palette={palette} />
      ) : (
        <text
          className={`whitespace-pre-wrap text-sm leading-relaxed ${palette.text}`}
          aria-live={message.pending ? 'polite' : 'off'}
        >
          {content}
        </text>
      )}
    </view>
  );
}
