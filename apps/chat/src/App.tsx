
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useLynxGlobalEventListener,
  useMainThreadRef,
  runOnBackground,
} from '@lynx-js/react';

import './styles/globals.css';

import { Alert, AlertDescription, Button, Icon, Input, useTheme } from '@ariob/ui';

import {
  createMessageId,
  ensureModelLoaded,
  generateNativeChat,
  type NativeAIMessage,
  type NativeAIRole,
  type NativeAIStatistics,
  useNativeAIStream,
  useModels,
} from '@ariob/ai';
import { lucideGlyphs } from '@ariob/ui';
import { ModelSelector } from './components/ModelSelector';

type LucideName = keyof typeof lucideGlyphs;

interface ChatMessage {
  id: string;
  role: NativeAIRole;
  content: string;
  pending?: boolean;
  createdAt?: number;
}

const CUSTOM_SYSTEM_PROMPT = `You are a conversational AI focused on engaging in authentic dialogue. Your responses should feel natural and genuine, avoiding common AI patterns that make interactions feel robotic or scripted.`;
const createInitialMessages = (): ChatMessage[] => [
  { id: 'system-message', role: 'system', content: CUSTOM_SYSTEM_PROMPT },
];

export const App = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => createInitialMessages());
  const [prompt, setPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statistics, setStatistics] = useState<NativeAIStatistics | null>(null);
  const [liveStatistics, setLiveStatistics] = useState<NativeAIStatistics | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const {
    availableModels,
    loadedModelNames: loadedModels,
    selectedModel,
    isLoading: loadingModelName,
    error: listError,
    selectModel,
    loadModel,
  } = useModels({ autoLoadFirst: true });

  const pendingAssistantRef = useRef<{ messageId: string; model: string; streamId?: string } | null>(
    null,
  );
  const activeStreamRef = useRef<{ messageId: string; streamId: string } | null>(null);

  // UI State Updates - Background Thread (Default)
  // Per Lynx architecture: State updates happen on background thread
  // Background thread sends messages to main thread for actual UI rendering
  // setTimeout(0) defers updates to keep event handler responsive
  const scheduleMessagesUpdate = useCallback(
    (updater: (previous: ChatMessage[]) => ChatMessage[]) => {
      setTimeout(() => {
        setMessages((previous) => updater(previous));
      }, 0);
    },
    [],
  );

  const appendMessages = useCallback(
    (items: ChatMessage[]) => {
      setTimeout(() => {
        setMessages((previous) => [...previous, ...items]);
      }, 0);
    },
    [],
  );

  const updateMessageById = useCallback(
    (messageId: string, mapper: (message: ChatMessage) => ChatMessage) => {
      scheduleMessagesUpdate((previous) =>
        previous.map((message) => (message.id === messageId ? mapper(message) : message)),
      );
    },
    [scheduleMessagesUpdate],
  );

  const createAssistantPlaceholder = useCallback(
    (): ChatMessage => ({
      id: createMessageId(),
      role: 'assistant',
      content: '',
      pending: true,
      createdAt: Date.now(),
    }),
    [],
  );

  // AI Operations - Background Thread (Default)
  // All async operations run on background thread by default in Lynx
  // NO 'background only' directive exists - background is the default execution context
  const ensureModelReady = useCallback(async (modelName: string) => {
    return ensureModelLoaded(modelName);
  }, []);

  const runNativeChat = useCallback(
    async (modelName: string, conversation: NativeAIMessage[]) => {
      return generateNativeChat(modelName, conversation);
    },
    [],
  );

  const setNativeProps = (itemId: string, props: Record<string, unknown>) => {
    // @ts-ignore lynx is provided by runtime
    lynx
      .createSelectorQuery()
      .select(`#${itemId}`)
      .setNativeProps(props)
      .exec();
  };

  const keyboardChanged = (keyboardHeightInPx: number) => {
    const translate = keyboardHeightInPx === 0 ? 0 : -keyboardHeightInPx;
    setNativeProps('composer-panel', {
      transform: `translateY(${translate}px)`,
      transition: `transform ${keyboardHeightInPx === 0 ? '0.15s' : '0.3s'}`,
    });
  };

  const { currentTheme, setTheme, withTheme } = useTheme();

  // Theme toggle handler
  const handleToggleTheme = useCallback(() => {
    const nextTheme = currentTheme === 'Light' ? 'Dark' : currentTheme === 'Dark' ? 'Auto' : 'Light';
    setTheme(nextTheme);
  }, [currentTheme, setTheme]);

  // Simple toggle for model selector - runs on background thread (default, which is fine for state updates)
  const handleToggleModelSelector = useCallback(() => {
    console.log('[UI Event] Toggle model selector');
    setShowModelSelector((prev) => !prev);
  }, []);
  
  const inputRef = useRef<any>(null);

  const handleResetConversationMainThread = useCallback((event: any) => {
    'main thread';
    // Provide immediate visual feedback if needed
    // Then execute reset on background thread
    runOnBackground(() => {
      setMessages(createInitialMessages());
      setPrompt('');
      setErrorMessage(null);
      setStatistics(null);
      setLiveStatistics(null);
      setIsGenerating(false);
      pendingAssistantRef.current = null;
      activeStreamRef.current = null;
    })();
  }, []);

  const handleResetConversation = useCallback(() => {
    setMessages(createInitialMessages());
    setPrompt('');
    setErrorMessage(null);
    setStatistics(null);
    setLiveStatistics(null);
    setIsGenerating(false);
    pendingAssistantRef.current = null;
    activeStreamRef.current = null;
  }, []);

  const handleModelSelect = useCallback(
    async (modelName: string) => {
      console.log('[AI Event] Model selected:', modelName);
      try {
        await selectModel(modelName);
        console.log('[AI Event] Model selection successful');

        // Ensure model is loaded after selection
        if (!loadedModels.includes(modelName)) {
          console.log('[AI Event] Loading model:', modelName);
          await loadModel(modelName);
          console.log('[AI Event] Model loaded successfully');
        }

        setShowModelSelector(false);
      } catch (error) {
        console.error('[AI Event] Model selection failed:', error);
      }
    },
    [selectModel, loadedModels, loadModel],
  );

  // Input value binding - runs on BACKGROUND THREAD (default)
  // Per Lynx architecture: bindinput handlers run on background thread
  // State updates are automatically batched and sent to main thread for rendering
  const handlePromptInput = useCallback((event: any) => {
    const value = event?.detail?.value ?? '';
    setPrompt(value);
    // Clear error when user starts typing
    setErrorMessage(null);
  }, []);

  // Simplified send message handler with comprehensive logging
  const handleSendMessage = useCallback(async () => {
    console.log('[UI Event] Send message triggered');
    console.log('[UI Event] Prompt state:', prompt);
    console.log('[UI Event] Selected model:', selectedModel);
    console.log('[UI Event] Is generating:', isGenerating);
    
    const trimmed = prompt.trim();
    console.log('[UI Event] Trimmed prompt:', trimmed);

    if (!trimmed) {
      console.log('[UI Event] Empty prompt, aborting');
      return;
    }

    if (isGenerating) {
      console.log('[UI Event] Already generating, aborting');
      return;
    }

    if (!selectedModel) {
      console.log('[UI Event] No model selected');
      setErrorMessage('Please select a model before sending a prompt.');
      return;
    }

    setErrorMessage(null);

    console.log('[AI Event] Ensuring model is ready:', selectedModel);
    const ensured = await ensureModelReady(selectedModel);
    if (!ensured) {
      console.error('[AI Event] Model not ready:', selectedModel);
      setErrorMessage(`Model "${selectedModel}" is not ready yet.`);
      return;
    }
    console.log('[AI Event] Model ready');

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };

    const assistantMessage = createAssistantPlaceholder();

    const conversation: NativeAIMessage[] = [...messages, userMessage].map(({ role, content }) => ({
      role,
      content,
    }));

    console.log('[AI Event] Appending messages to UI');
    appendMessages([userMessage, assistantMessage]);
    pendingAssistantRef.current = { messageId: assistantMessage.id, model: selectedModel };

    setIsGenerating(true);
    setStatistics(null);
    setLiveStatistics(null);
    setPrompt('');
    
    // Clear the input field using Lynx API
    if (inputRef.current) {
      console.log('[UI Event] Clearing input field');
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

    console.log('[AI Event] Starting chat generation');
    try {
      const result = await runNativeChat(selectedModel, conversation);
      console.log('[AI Event] Chat generation result:', result);
      
      if (!result) {
        console.error('[AI Event] No result returned');
        return;
      }

      if (result.success === false) {
        const message = result.message ?? 'Generation failed.';
        console.error('[AI Event] Generation failed:', message);
        setIsGenerating(false);
        setStatistics(null);
        setLiveStatistics(null);
        setErrorMessage(message);
        activeStreamRef.current = null;
        pendingAssistantRef.current = null;
        updateMessageById(assistantMessage.id, (entry) => ({
          ...entry,
          content: `[Error] ${message}`,
          pending: false,
        }));
      }
    } catch (error) {
      console.error('[AI Event] Chat generation error:', error);
      setIsGenerating(false);
      setErrorMessage('An error occurred during generation');
    }
  }, [
    appendMessages,
    createAssistantPlaceholder,
    ensureModelReady,
    isGenerating,
    messages,
    prompt,
    runNativeChat,
    selectedModel,
    updateMessageById,
  ]);

  const handlePromptKeydown = useCallback(
    (raw: unknown) => {
      const event = raw as {
        key?: string;
        shiftKey?: boolean;
        preventDefault?: () => void;
        detail?: { keyCode?: number; shiftKey?: boolean };
      };
      const key = event?.key ?? (event?.detail?.keyCode === 13 ? 'Enter' : undefined);
      const shift = Boolean(event?.shiftKey ?? event?.detail?.shiftKey);
      if (key === 'Enter' && !shift) {
        event?.preventDefault?.();
        void handleSendMessage();
      }
    },
    [],
  );

  const composerBaseOffset = 32;
  const composerInset = composerBaseOffset;

  const headerSurfaceClass = 'bg-card border-b border-border backdrop-blur-md';
  const chatSurfaceClass = 'bg-background backdrop-blur-lg';

  const streamSnapshot = useNativeAIStream({
    onStarted: (event) => {
      if (pendingAssistantRef.current && !pendingAssistantRef.current.streamId) {
        pendingAssistantRef.current.streamId = event.streamId;
        activeStreamRef.current = {
          messageId: pendingAssistantRef.current.messageId,
          streamId: event.streamId,
        };
        pendingAssistantRef.current = null;
      }
      setStatistics(null);
      setLiveStatistics(null);
      setIsGenerating(true);
      setErrorMessage(null);
    },
    onChunk: (event) => {
      const targetId = activeStreamRef.current?.messageId;
      if (!targetId) {
        return;
      }
      updateMessageById(targetId, (message) => ({
                ...message,
                content: event.content,
                pending: true,
      }));
    },
    onInfo: (event) => {
      setLiveStatistics(event.statistics ?? null);
    },
    onComplete: (event) => {
      const targetId = activeStreamRef.current?.messageId;
      activeStreamRef.current = null;
      setIsGenerating(false);
      setStatistics(event.metadata?.statistics ?? null);
      setLiveStatistics(null);
      if (!targetId) {
        return;
      }
      const finalContent = event.content.trim() || '[No response received from model]';
      updateMessageById(targetId, (message) => ({
                ...message,
                content: finalContent,
                pending: false,
      }));
    },
    onError: (event) => {
      const targetId = activeStreamRef.current?.messageId ?? pendingAssistantRef.current?.messageId;
      activeStreamRef.current = null;
      pendingAssistantRef.current = null;
      setIsGenerating(false);
      setStatistics(null);
      setLiveStatistics(null);
      setErrorMessage(event.message);
      if (!targetId) {
        return;
      }
      updateMessageById(targetId, (message) => ({
                ...message,
                content: `[Error] ${event.message}`,
                pending: false,
      }));
    },
  });

  useLynxGlobalEventListener('keyboardstatuschanged', (status: unknown, height: unknown) => {
    const isOn = status === 'on';
    const kbHeight = isOn ? Number(height ?? 0) : 0;
    setKeyboardHeight(kbHeight);
    keyboardChanged(kbHeight);
  });


  const latestMessageId = messages[messages.length - 1]?.id ?? 'chat-top';
  const selectedModelLoaded = selectedModel ? loadedModels.includes(selectedModel) : false;

  // Model selector shows when toggled

  const isStreamingOrGenerating = isGenerating || streamSnapshot.pending;

  const statusLabel = useMemo(() => {
    if (isStreamingOrGenerating) {
      return 'Thinking';
    }
    if (loadingModelName) {
      return 'Loading Model';
    }
    if (listError) {
      return 'Error';
    }
    if (selectedModelLoaded) {
      return 'Ready';
    }
    if (selectedModel) {
      return 'Selected';
    }
    return 'Select Model';
  }, [isStreamingOrGenerating, loadingModelName, listError, selectedModelLoaded, selectedModel]);

  const canSend = useMemo(() => {
    if (!prompt.trim()) {
      return false;
    }
    if (!selectedModel) {
      return false;
    }
    if (isStreamingOrGenerating || Boolean(loadingModelName)) {
      return false;
    }
    return selectedModelLoaded;
  }, [
    prompt,
    selectedModel,
    isStreamingOrGenerating,
    loadingModelName,
    selectedModelLoaded,
  ]);

  type RolePalette = {
    bubble: string;
    text: string;
    label: string;
    avatar: string;
    icon: LucideName;
    title: string;
  };

  type MessageBubbleProps = {
    message: ChatMessage;
    palette: RolePalette;
  };

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

  const MessageBubble = ({ message, palette }: MessageBubbleProps) => {
    const content = message.pending && !message.content ? 'Thinking…' : message.content || '';
    const alignmentClass = message.role === 'user' ? 'self-end' : 'self-start';
    const bubbleStateClass = message.pending ? 'animate-pulse border-border' : '';

    return (
      <view
        id={message.id}
        className={`flex max-w-[80%] flex-col gap-3 rounded-[calc(var(--radius)*1.05)] border px-5 py-4 transition-all duration-300 ${palette.bubble} ${alignmentClass} ${bubbleStateClass} mb-4`}
        aria-label={`${palette.title} message`}
      >
        <view className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.35em]">
          <view
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${palette.avatar}`}
            aria-hidden
          >
            <Icon name={palette.icon} className="text-base" />
          </view>
          <text className={`font-semibold ${palette.label}`}>{palette.title}</text>
          {message.createdAt ? (
            <text className={`text-[9px] ml-auto ${palette.label}`}>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </text>
          ) : null}
        </view>
        <text
          className={`whitespace-pre-wrap text-sm leading-relaxed ${palette.text}`}
          aria-live={message.pending ? 'polite' : 'off'}
        >
          {content}
        </text>
      </view>
    );
  };

  let statusIcon: LucideName = 'circle';
  if (isStreamingOrGenerating) {
    statusIcon = 'loader-circle';
  } else if (loadingModelName) {
    statusIcon = 'loader-circle';
  } else if (listError) {
    statusIcon = 'triangle-alert';
  } else if (selectedModelLoaded) {
    statusIcon = 'check';
  } else if (selectedModel) {
    statusIcon = 'clock';
  } else {
    statusIcon = 'circle';
  }

  const statusBadgeBg = loadingModelName
    ? 'bg-accent border border-accent'
    : selectedModelLoaded
      ? 'bg-primary border border-primary'
      : selectedModel
        ? 'bg-secondary border border-secondary'
        : 'bg-muted border border-border';

  const statusTextColor = loadingModelName
    ? 'text-accent-foreground'
    : selectedModelLoaded
      ? 'text-primary-foreground'
      : selectedModel
        ? 'text-secondary-foreground'
        : 'text-muted-foreground';

  return (
    <page className={
      withTheme("bg-background", "dark bg-background")
    } style={{ height: '100%', width: '100%', paddingTop: 'env(safe-area-inset-top)' }}>
      <view className="flex h-full flex-col bg-background text-foreground">
        <view className={`flex-shrink-0 px-5 py-4 ${headerSurfaceClass}`}>
          <view className="flex flex-col gap-3">
            {/* Top Row - Title, Status and Actions */}
            <view className="flex items-center justify-between">
              <view className="flex items-center gap-2.5">
                <text className="text-lg font-semibold text-foreground">Chat</text>
                <view
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${statusBadgeBg}`}
                >
                  <Icon
                    name={statusIcon}
                    className={`text-xs ${statusTextColor} ${isStreamingOrGenerating || loadingModelName ? 'animate-spin' : ''}`}
                  />
                  <text className={`text-xs font-medium ${statusTextColor}`}>{statusLabel}</text>
                </view>
              </view>
              <view className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="default"
                  icon={currentTheme === 'Light' ? 'sun' : currentTheme === 'Dark' ? 'moon' : 'monitor'}
                  aria-label="Toggle theme"
                  className="text-muted-foreground hover:text-foreground"
                  bindtap={handleToggleTheme}
                />
                <view main-thread:bindtap={handleResetConversationMainThread}>
                  <Button
                    variant="ghost"
                    size="default"
                    icon="trash-2"
                    aria-label="Clear conversation"
                    className="text-muted-foreground hover:text-destructive"
                  />
                </view>
              </view>
            </view>

            {/* Model Selection - Clean and Minimal */}
            <view className="space-y-2">
              <view className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-colors ${
                loadingModelName
                  ? 'border border-accent bg-accent'
                  : 'border border-border bg-card'
              }`}>
                <view className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Icon
                    name={loadingModelName ? 'loader-circle' : 'cpu'}
                    className={`text-base flex-shrink-0 ${
                      loadingModelName
                        ? 'text-accent-foreground animate-spin'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <view className="flex-1 min-w-0">
                    <text className="text-xs font-medium text-muted-foreground block">
                      {loadingModelName ? 'Loading...' : 'Model'}
                    </text>
                    <text className="text-sm font-semibold text-foreground block truncate">
                      {loadingModelName || selectedModel || 'Select a model'}
                    </text>
                  </view>
                </view>
                <Button
                  variant="ghost"
                  size="default"
                  icon="chevron-down"
                  aria-label="Select model"
                  className={`text-muted-foreground flex-shrink-0 ${showModelSelector ? 'rotate-180' : ''} transition-transform`}
                  bindtap={handleToggleModelSelector}
                  disabled={Boolean(loadingModelName)}
                />
              </view>

              {/* Model Selection Dropdown */}
              {showModelSelector && (
                <view className="relative">
                  <ModelSelector onModelSelect={handleModelSelect} />
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

        <scroll-view
          className={`flex-1 ${chatSurfaceClass}`}
          scroll-y
          scroll-into-view={latestMessageId}
          style={{ paddingBottom: `${Math.max(120, composerInset + 80)}px` }}
        >
          <view className="flex flex-col px-4 py-6 sm:px-6 sm:py-8">
            <view id="chat-top" className="h-0 w-0" />
            {messages.map((message) => {
              if (message.role === 'system') {
                return null;
              }
              const palette = getRoleStyles(message.role);
              return <MessageBubble key={message.id} message={message} palette={palette} />;
            })}
          </view>
        </scroll-view>

        <view
          id="composer-panel"
          className="flex-shrink-0 border-t border-border bg-background px-4 py-3.5 pb-safe-bottom backdrop-blur-xl"
        >
          {errorMessage ? (
            <Alert variant="destructive" className="mb-2.5 border-destructive bg-destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <view className="flex w-full max-w-2xl items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 pt-2.5 pb-3">
            <view className="flex-1">
              <Input
                id="chat-input"
                ref={inputRef}
                className="w-full border-none bg-transparent px-0 text-sm text-foreground"
                type="text"
                placeholder={selectedModelLoaded
                  ? 'Type a message...'
                  : loadingModelName
                    ? 'Loading model...'
                    : 'Select a model first'}
                show-soft-input-on-focus
                bindinput={handlePromptInput}
                bindconfirm={handleSendMessage}
                bindkeydown={handlePromptKeydown}
                disabled={isStreamingOrGenerating}
              />
            </view>
            <Button
              variant={canSend ? 'default' : 'ghost'}
              size="icon"
              icon={isStreamingOrGenerating ? 'loader-circle' : 'send'}
              disabled={!canSend}
              className={`flex-shrink-0 h-8 w-8 ${isStreamingOrGenerating ? 'animate-spin' : ''} ${!canSend ? 'opacity-40' : ''}`}
              bindtap={handleSendMessage}
            />
          </view>
        </view>
      </view>
    </page>
  );
}
