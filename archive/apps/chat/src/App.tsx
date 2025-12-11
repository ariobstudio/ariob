import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useLynxGlobalEventListener,
  runOnBackground,
} from '@lynx-js/react';

import './styles/globals.css';

import { useTheme } from '@ariob/ui';

import {
  createMessageId,
  type NativeAIMessage,
  useNativeAIStream,
} from '@ariob/ai';

// Import custom hooks
import { useChatMessages } from './hooks/useChatMessages';
import { useChatGeneration } from './hooks/useChatGeneration';
import { useStatusCalculator } from './hooks/useStatusCalculator';
import { useModelManagement } from './hooks/useModelStore';

// Import components
import { ChatMessage, type ChatMessageData } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatHeader } from './components/ChatHeader';

export const App = () => {
  const [prompt, setPrompt] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Custom hooks for state management
  const {
    messages,
    appendMessages,
    updateMessageById,
    createAssistantPlaceholder,
    resetMessages,
    pendingAssistantRef,
    activeStreamRef,
  } = useChatMessages();

  const {
    isGenerating,
    setIsGenerating,
    statistics,
    setStatistics,
    liveStatistics,
    setLiveStatistics,
    errorMessage,
    setErrorMessage,
    clearError,
    resetGeneration,
    ensureModelReady,
    runNativeChat,
  } = useChatGeneration();

  const {
    loadedModels,
    selectedModel,
    isLoading: loadingModelName,
    error: listError,
    selectModel,
    isModelLoaded,
  } = useModelManagement({ autoLoadFirst: true });


  const setNativeProps = (itemId: string, props: Record<string, unknown>) => {
    // @ts-ignore lynx is provided by runtime
    lynx
      .createSelectorQuery()
      .select(`#${itemId}`)
      .setNativeProps(props)
      .exec();
  };

  const keyboardChanged = (keyboardHeightInPx: number) => {
    console.log('[Keyboard] Height changed:', keyboardHeightInPx);
    const translate = keyboardHeightInPx === 0 ? 0 : -keyboardHeightInPx;

    // Smooth and fast animation
    const transition = keyboardHeightInPx === 0
      ? 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)' // Smooth ease out when keyboard dismisses
      : 'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)'; // Smooth ease out when keyboard appears

    console.log('[Keyboard] Moving input:', translate);
    // Only move the input, messages auto-scroll via scroll-into-view
    setNativeProps('composer-panel', {
      transform: `translateY(${translate}px)`,
      transition,
    });
  };

  const { currentTheme, setTheme, withTheme } = useTheme();

  // Theme toggle handler
  const handleToggleTheme = useCallback(() => {
    const nextTheme = currentTheme === 'Light' ? 'Dark' : currentTheme === 'Dark' ? 'Auto' : 'Light';
    setTheme(nextTheme);
  }, [currentTheme, setTheme]);

  // Simple toggle for model selector
  const handleToggleModelSelector = useCallback(() => {
    console.log('[UI Event] Toggle model selector');
    setShowModelSelector((prev) => !prev);
  }, []);

  const handleResetConversationMainThread = useCallback((event: any) => {
    'main thread';
    // Execute reset on background thread
    runOnBackground(() => {
      resetMessages();
      resetGeneration();
      setPrompt('');
    })();
  }, [resetMessages, resetGeneration]);

  const handleResetConversation = useCallback(() => {
    resetMessages();
    resetGeneration();
    setPrompt('');
  }, [resetMessages, resetGeneration]);

  const handleModelSelect = useCallback(
    (modelName: string) => {
      console.log('[AI Event] Model selected from selector:', modelName);
      // ModelSelector already handles selection and loading, just close the selector
      setShowModelSelector(false);
    },
    [],
  );

  // Input value binding
  const handlePromptInput = useCallback((event: any) => {
    const value = event?.detail?.value ?? '';
    setPrompt(value);
    clearError();
  }, [clearError]);

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

    const userMessage: ChatMessageData = {
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
    setPrompt(''); // This now clears the controlled input

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
    console.log('[Keyboard] Event fired - status:', status, 'height:', height);
    const isOn = status === 'on';
    const kbHeight = isOn ? Number(height ?? 0) : 0;
    console.log('[Keyboard] Calculated height:', kbHeight);
    setKeyboardHeight(kbHeight);
    keyboardChanged(kbHeight);
  });


  // Computed values
  const messageList = Array.isArray(messages) ? messages : [];
  const latestMessageId = messageList[messageList.length - 1]?.id ?? 'chat-top';
  const selectedModelLoaded = selectedModel ? isModelLoaded(selectedModel) : false;
  const isStreamingOrGenerating = isGenerating || streamSnapshot.pending;

  // Use status calculator hook
  const statusInfo = useStatusCalculator({
    isGenerating,
    pending: streamSnapshot.pending,
    loadingModelName,
    listError,
    selectedModel,
    selectedModelLoaded,
  });

  const canSend = useMemo(() => {
    if (!prompt.trim()) return false;
    if (!selectedModel) return false;
    if (isStreamingOrGenerating || Boolean(loadingModelName)) return false;
    return selectedModelLoaded;
  }, [prompt, selectedModel, isStreamingOrGenerating, loadingModelName, selectedModelLoaded]);

  const composerBaseOffset = 32;
  const composerInset = composerBaseOffset;
  const chatSurfaceClass = 'bg-background';

  const inputPlaceholder = selectedModelLoaded
    ? 'Type a message...'
    : loadingModelName
      ? 'Loading model...'
      : 'Select a model first';

  return (
    <page
      className={withTheme("bg-card pt-safe-top w-full h-full", "dark bg-card pt-safe-top w-full h-full")}
    >
      <view className="flex h-full flex-col text-foreground relative">
        {/* Header with model selector and controls - fixed at top with z-index */}
        <view className="relative z-10">
          <ChatHeader
            statusLabel={statusInfo.label}
            statusIcon={statusInfo.icon}
            statusVariant={statusInfo.variant}
            statusAnimated={statusInfo.animated}
            currentTheme={currentTheme}
            onToggleTheme={handleToggleTheme}
            onResetConversation={handleResetConversation}
            selectedModel={selectedModel}
            showModelSelector={showModelSelector}
            onToggleModelSelector={handleToggleModelSelector}
            onModelSelect={handleModelSelect}
            listError={listError}
          />
        </view>

        {/* Chat messages scrollable area - fills remaining space, stays fixed */}
        <scroll-view
          className={`flex-1 ${chatSurfaceClass}`}
          scroll-y
          scroll-into-view={latestMessageId}
          style={{ paddingBottom: `${Math.max(120, composerInset + 80)}px` }}
        >
          <view className="flex flex-col px-4 py-6 sm:px-6 sm:py-8">
            <view id="chat-top" className="h-0 w-0" />
            {messageList.map((message) => {
              if (message.role === 'system') return null;
              return <ChatMessage key={message.id} message={message} />;
            })}
          </view>
        </scroll-view>

        {/* Chat input composer - only this moves with keyboard */}
        <ChatInput
          onSend={handleSendMessage}
          onInput={handlePromptInput}
          onKeydown={handlePromptKeydown}
          disabled={isStreamingOrGenerating}
          placeholder={inputPlaceholder}
          errorMessage={errorMessage}
          canSend={canSend}
          isGenerating={isStreamingOrGenerating}
          onDismissError={clearError}
          value={prompt}
        />
      </view>
    </page>
  );
}
