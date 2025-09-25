import { useState, useCallback, useEffect } from '@lynx-js/react'
import { useML } from '@ariob/ml'
import type { MLChatMessage, MLModelConfiguration, MLError } from '@ariob/ml'

// Chat message type for UI
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isLoading?: boolean
}

// Model configuration for Gemma3
const GEMMA3_MODEL_CONFIG: MLModelConfiguration = {
  modelId: 'gemma3-chat',
  huggingFaceId: 'mlx-community/gemma-2-2b-it-4bit',
  type: 'llm'
}

export function App(props: {
  onRender?: () => void
}) {
  // ML Hook
  const {
    isReady,
    error: mlError,
    loadModel,
    chat,
    isModelLoaded
  } = useML({ autoInit: true })

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState<string>('')
  const [isModelLoadingState, setIsModelLoadingState] = useState<boolean>(false)
  const [modelLoaded, setModelLoaded] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [appError, setAppError] = useState<string | null>(null)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState<boolean>(false)
  const isNativeAvailable = typeof (globalThis as any).NativeMLXModule !== 'undefined'

  useEffect(() => {
    console.info('Lynx Chat App with Gemma3 MLX')
    props.onRender?.()
  }, [])

  // Load model on app start
  useEffect(() => {
    if (isReady && !hasAttemptedLoad && !isModelLoadingState) {
      loadGemma3Model()
    }
  }, [isReady, hasAttemptedLoad, isModelLoadingState])

  const loadGemma3Model = useCallback(async () => {
    try {
      setIsModelLoadingState(true)
      setAppError(null)

      await loadModel(GEMMA3_MODEL_CONFIG)
      const loaded = await isModelLoaded(GEMMA3_MODEL_CONFIG.modelId)

      if (loaded) {
        setModelLoaded(true)
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: 'Hello! I\'m Gemma3, your AI assistant. How can I help you today?',
          timestamp: Date.now()
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Failed to load Gemma3 model:', error)
      setAppError(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsModelLoadingState(false)
      setHasAttemptedLoad(true)
    }
  }, [loadModel, isModelLoaded])

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !modelLoaded || isGenerating) return

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now()
    }

    const loadingMessage: ChatMessage = {
      id: 'assistant-' + Date.now(),
      role: 'assistant',
      content: 'Thinking...',
      timestamp: Date.now(),
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setInputText('')
    setIsGenerating(true)

    try {
      // Convert chat messages to ML format and include the new user message
      const chatHistory: MLChatMessage[] = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      chatHistory.push({ role: 'user', content: userMessage.content })

      // Use the ML chat interface to generate a response
      const responseText = await chat(
        GEMMA3_MODEL_CONFIG.modelId,
        chatHistory,
        {
          maxTokens: 256,
          temperature: 0.7,
          topP: 0.9
        }
      )

      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: responseText || 'I apologize, but I couldn\'t generate a response.',
        timestamp: Date.now()
      }

      setMessages(prev => {
        // Replace loading message with actual response
        const filtered = prev.filter(msg => !msg.isLoading)
        return [...filtered, assistantMessage]
      })
    } catch (error) {
      console.error('Failed to generate response:', error)
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading)
        const errorMessage: ChatMessage = {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        }
        return [...filtered, errorMessage]
      })
    } finally {
      setIsGenerating(false)
    }
  }, [inputText, modelLoaded, isGenerating, messages, chat])

  const handleInputChange = useCallback((e: any) => {
    setInputText(e.detail.value || '')
  }, [])

  const handleSendPress = useCallback(() => {
    sendMessage()
  }, [sendMessage])

  // Render loading state
  if (!isReady || isModelLoadingState) {
    return (
      <view style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20
      }}>
        <text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: 20
        }}>
          🤖 Lynx Chat
        </text>

        <view style={{
          backgroundColor: '#e2e8f0',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          minWidth: 200,
          alignItems: 'center'
        }}>
          <text style={{
            fontSize: 16,
            color: '#64748b',
            textAlign: 'center',
            marginBottom: 10
          }}>
            {isModelLoadingState ? 'Loading Gemma3 Model...' : 'Initializing ML...'}
          </text>

          <view style={{
            backgroundColor: '#3b82f6',
            height: 4,
            width: 120,
            borderRadius: 2,
            opacity: 0.7
          }} />
        </view>

        {!isNativeAvailable && (
          <view style={{
            backgroundColor: '#fffbea',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#fef08a',
            marginTop: 12
          }}>
            <text style={{ color: '#92400e', fontSize: 14 }}>
              Native ML module not detected. Run inside Lynx runtime to use ML features.
            </text>
          </view>
        )}

        {appError && (
          <view style={{
            backgroundColor: '#fee2e2',
            padding: 15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#fecaca'
          }}>
            <text style={{ color: '#dc2626', fontSize: 14 }}>
              {appError}
            </text>
            <view style={{ marginTop: 12, alignItems: 'center' }}>
              <view
                style={{
                  backgroundColor: '#3b82f6',
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 8
                }}
                bindtap={loadGemma3Model}
              >
                <text style={{ color: '#ffffff', fontSize: 14 }}>Retry Loading Model</text>
              </view>
            </view>
          </view>
        )}
      </view>
    )
  }

  // Render error state
  if (mlError || appError || !isNativeAvailable) {
    return (
      <view style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20
      }}>
        <text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: 20
        }}>
          ⚠️ {isNativeAvailable ? 'Error' : 'Native Module Missing'}
        </text>

        <view style={{
          backgroundColor: isNativeAvailable ? '#fee2e2' : '#fffbea',
          padding: 20,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isNativeAvailable ? '#fecaca' : '#fef08a'
        }}>
          <text style={{
            fontSize: 16,
            color: isNativeAvailable ? '#dc2626' : '#92400e',
            textAlign: 'center'
          }}>
            {isNativeAvailable ? (mlError?.message || appError || 'Unknown error occurred') : 'Native ML module not detected. Please run this app in a Lynx runtime build.'}
          </text>
          {isNativeAvailable && (
            <view style={{ marginTop: 12, alignItems: 'center' }}>
              <view
                style={{
                  backgroundColor: '#3b82f6',
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 8
                }}
                bindtap={loadGemma3Model}
              >
                <text style={{ color: '#ffffff', fontSize: 14 }}>Retry Loading Model</text>
              </view>
            </view>
          )}
        </view>
      </view>
    )
  }

  // Main chat interface
  return (
    <view style={{
      flex: 1,
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <view style={{
        backgroundColor: '#1e293b',
        paddingTop: 60,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
        // shadow styles are not standard web CSS; omit for compatibility
      }}>
        <view style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#ffffff',
            marginRight: 8
          }}>
            🤖
          </text>
          <text style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            Gemma3 Chat
          </text>
        </view>

        <text style={{
          fontSize: 14,
          color: '#94a3b8',
          textAlign: 'center',
          marginTop: 4
        }}>
          Powered by MLX
        </text>
      </view>

      {/* Messages */}
      <scroll-view style={{
        flex: 1,
        padding: 16,
        backgroundColor: '#f8fafc'
      }}>
        {messages.map((message, index) => (
          <view key={message.id} style={{
            marginBottom: 16,
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <view style={{
              backgroundColor: message.role === 'user' ? '#3b82f6' : '#ffffff',
              padding: 16,
              borderRadius: 18,
              maxWidth: '80%',
              minWidth: 60,
              // shadow styles are not standard web CSS; omit for compatibility
              borderWidth: message.role === 'assistant' ? 1 : 0,
              borderColor: '#e2e8f0'
            }}>
              <text style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: message.role === 'user' ? '#ffffff' : '#1e293b'
              }}>
                {message.content}
              </text>

              {message.isLoading && (
                <view style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}>
                  <view style={{
                    backgroundColor: '#e2e8f0',
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    marginRight: 4
                  }} />
                  <view style={{
                    backgroundColor: '#e2e8f0',
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    marginRight: 4
                  }} />
                  <view style={{
                    backgroundColor: '#e2e8f0',
                    width: 4,
                    height: 4,
                    borderRadius: 2
                  }} />
                </view>
              )}
            </view>
          </view>
        ))}
      </scroll-view>

      {/* Input Area */}
      <view style={{
        backgroundColor: '#ffffff',
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        // shadow styles are not standard web CSS; omit for compatibility
      }}>
        <view style={{
          flexDirection: 'row',
          alignItems: 'flex-end'
        }}>
          <view style={{ flex: 1, marginRight: 12 }}>
            <input
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: 24,
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 14,
                paddingBottom: 14,
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                minHeight: 48
              }}
              placeholder="Type your message..."
              bindinput={handleInputChange}
            />
          </view>

          <view
            style={{
              backgroundColor: inputText.trim() && !isGenerating ? '#3b82f6' : '#cbd5e1',
              borderRadius: 24,
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: inputText.trim() && !isGenerating && modelLoaded ? 1 : 0.6
            }}
            bindtap={modelLoaded && inputText.trim() && !isGenerating ? handleSendPress : undefined}
          >
            <text style={{
              fontSize: 18,
              color: '#ffffff'
            }}>
              {isGenerating ? '⏳' : '➤'}
            </text>
          </view>
        </view>
      </view>
    </view>
  )
}