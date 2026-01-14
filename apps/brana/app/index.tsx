import { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { View, useWindowDimensions, Platform, Keyboard, FlatList, ViewToken } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Editor from './editor';
import { EditorToolbar } from '../components';
import type { EditorState, PendingCommand, EditorCommand } from '../types/editor';
import { initialEditorState } from '../types/editor';
import {
  savePapers,
  loadPapers,
  saveCurrentPaperId,
  loadCurrentPaperId,
  generateTitle,
  generatePreview,
  generatePaperId,
  flushPapers,
} from '../utils/storage';
import { welcomeContent } from '../constants/welcomeContent';
import type { PaperItem } from '../types/paper';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<PaperItem>);

// Memoized Paper Editor wrapper to prevent unnecessary re-renders
interface PaperEditorProps {
  paper: PaperItem;
  height: number;
  onStateChange: (state: EditorState) => void;
  onCommandExecuted: () => void;
  pendingCommand: PendingCommand | null;
  onContentChange: (content: string) => void;
  onCreateNewPaper: () => void;
  onNavigate: (screen: 'archive' | 'settings') => void;
  onNavigatePaper: (direction: 'prev' | 'next') => void;
  isActive: boolean;
}

const PaperEditor = memo(function PaperEditor({
  paper,
  height,
  onStateChange,
  onCommandExecuted,
  pendingCommand,
  onContentChange,
  onCreateNewPaper,
  onNavigate,
  onNavigatePaper,
  isActive,
}: PaperEditorProps) {
  return (
    <View style={{ height }}>
      <Editor
        onStateChange={onStateChange}
        onCommandExecuted={onCommandExecuted}
        pendingCommand={pendingCommand}
        initialContent={paper.data.content}
        onContentChange={onContentChange}
        onCreateNewPaper={onCreateNewPaper}
        onNavigate={onNavigate}
        onNavigatePaper={onNavigatePaper}
        dom={{ hideKeyboardAccessoryView: true }}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.paper.id === nextProps.paper.id &&
    prevProps.height === nextProps.height &&
    prevProps.pendingCommand === nextProps.pendingCommand &&
    prevProps.isActive === nextProps.isActive
  );
});

export default function MainScreen() {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({});
  const [pendingCommands, setPendingCommands] = useState<Record<string, PendingCommand | null>>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const paperContentsRef = useRef<Record<string, string>>({});
  const flatListRef = useRef<FlatList<PaperItem>>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const paperContainerHeight = windowHeight - insets.top - (isWeb ? 0 : 60);

  // Viewability config for detecting active paper (more efficient than scroll events)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const activeEditorState = activePaperId
    ? editorStates[activePaperId] || initialEditorState
    : initialEditorState;

  // Swipe gesture state
  const translateX = useSharedValue(0);
  const swipeDirection = useSharedValue<'none' | 'undo' | 'redo'>('none');
  const hapticFired = useSharedValue(false);
  const [iconDirection, setIconDirection] = useState<'undo' | 'redo'>('undo');

  const loadAndScrollToPaper = useCallback(async (scrollToPaper = false) => {
    const loadedPapers = await loadPapers();
    const savedId = await loadCurrentPaperId();

    if (loadedPapers.length > 0) {
      setPapers(loadedPapers);
      // Cache content in memory
      loadedPapers.forEach((p) => {
        paperContentsRef.current[p.id] = p.data.content;
      });
      const activeId = savedId && loadedPapers.find((p) => p.id === savedId)
        ? savedId
        : loadedPapers[0].id;
      setActivePaperId(activeId);

      if (scrollToPaper && savedId) {
        const paperIndex = loadedPapers.findIndex((p) => p.id === savedId);
        if (paperIndex >= 0) {
          // Use requestAnimationFrame to ensure layout is ready
          requestAnimationFrame(() => {
            flatListRef.current?.scrollToIndex({
              index: paperIndex,
              animated: true,
              viewPosition: 0,
            });
          });
        }
      }
      setIsReady(true);
    } else {
      const newId = generatePaperId();
      const newPaper: PaperItem = {
        id: newId,
        data: {
          title: generateTitle(welcomeContent),
          content: welcomeContent,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          preview: generatePreview(welcomeContent),
        },
      };
      setPapers([newPaper]);
      setActivePaperId(newId);
      paperContentsRef.current[newId] = welcomeContent;
      await savePapers([newPaper]);
      await saveCurrentPaperId(newId);
      setIsReady(true);
    }
  }, [paperContainerHeight]);

  useEffect(() => {
    loadAndScrollToPaper(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAndScrollToPaper(true);
      // Flush any pending saves when navigating away
      return () => {
        flushPapers();
      };
    }, [loadAndScrollToPaper])
  );

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardVisible(false);
    });
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (activePaperId) {
      saveCurrentPaperId(activePaperId);
    }
  }, [activePaperId]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePaperContent = useCallback(async (paperId: string) => {
    const content = paperContentsRef.current[paperId] || '';
    const updatedPapers = papers.map((p) =>
      p.id === paperId
        ? {
            ...p,
            data: {
              ...p.data,
              content,
              title: generateTitle(content),
              preview: generatePreview(content),
              updatedAt: Date.now(),
            },
          }
        : p
    );
    setPapers(updatedPapers);
    await savePapers(updatedPapers);
  }, [papers]);

  const handleStateChange = useCallback((paperId: string) => (state: EditorState) => {
    setEditorStates((prev) => ({ ...prev, [paperId]: state }));
  }, []);

  const handleCommandExecuted = useCallback((paperId: string) => () => {
    setPendingCommands((prev) => ({ ...prev, [paperId]: null }));
  }, []);

  const createNewPaper = useCallback(async () => {
    if (activePaperId) {
      await savePaperContent(activePaperId);
    }

    const newId = generatePaperId();
    const newPaper: PaperItem = {
      id: newId,
      data: {
        title: 'Untitled',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        preview: '',
      },
    };

    const updatedPapers = [...papers, newPaper];
    setPapers(updatedPapers);
    setActivePaperId(newId);
    paperContentsRef.current[newId] = '';
    await savePapers(updatedPapers);

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({
        index: papers.length, // New paper will be at this index
        animated: true,
        viewPosition: 0,
      });
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [activePaperId, papers, savePaperContent, paperContainerHeight]);

  const handleToolbarAction = useCallback((command: EditorCommand) => {
    if (command.type === 'createNewPaper') {
      createNewPaper();
      return;
    }

    if (activePaperId) {
      setPendingCommands((prev) => ({
        ...prev,
        [activePaperId]: {
          id: Date.now().toString(),
          command,
        },
      }));
    }
  }, [activePaperId, createNewPaper]);

  const executeUndo = useCallback(() => {
    if (activeEditorState.canUndo) {
      handleToolbarAction({ type: 'undo' });
    }
  }, [activeEditorState.canUndo, handleToolbarAction]);

  const executeRedo = useCallback(() => {
    if (activeEditorState.canRedo) {
      handleToolbarAction({ type: 'redo' });
    }
  }, [activeEditorState.canRedo, handleToolbarAction]);

  const handleNavigate = useCallback((screen: 'archive' | 'settings') => {
    router.push(`/${screen}`);
  }, [router]);

  const navigatePaper = useCallback((direction: 'prev' | 'next') => {
    if (!activePaperId || papers.length <= 1) return;

    const currentIndex = papers.findIndex((p) => p.id === activePaperId);
    if (currentIndex === -1) return;

    let targetIndex: number;
    if (direction === 'prev') {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : papers.length - 1;
    } else {
      targetIndex = currentIndex < papers.length - 1 ? currentIndex + 1 : 0;
    }

    const targetPaper = papers[targetIndex];
    if (targetPaper) {
      setActivePaperId(targetPaper.id);
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0,
      });
    }
  }, [activePaperId, papers]);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleContentChange = useCallback((paperId: string) => (content: string) => {
    paperContentsRef.current[paperId] = content;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      savePaperContent(paperId);
    }, 2000);
  }, [savePaperContent]);

  // Use onViewableItemsChanged instead of scroll events for better performance
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].item) {
      const visiblePaper = viewableItems[0].item as PaperItem;
      if (visiblePaper.id !== activePaperId) {
        setActivePaperId(visiblePaper.id);
      }
    }
  }, [activePaperId]);

  // Stable reference for viewable items callback
  const viewableItemsChangedRef = useRef(onViewableItemsChanged);
  viewableItemsChangedRef.current = onViewableItemsChanged;

  const handleViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      viewableItemsChangedRef.current(info);
    },
    []
  );

  const panGesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      translateX.value = e.translationX;

      if (Math.abs(e.translationX) > 100 && !hapticFired.value) {
        hapticFired.value = true;
        runOnJS(triggerHaptic)();
      }

      if (Math.abs(e.translationX) < 50 && hapticFired.value) {
        hapticFired.value = false;
      }

      if (e.translationX > 50) {
        swipeDirection.value = 'undo';
        runOnJS(setIconDirection)('undo');
      } else if (e.translationX < -50) {
        swipeDirection.value = 'redo';
        runOnJS(setIconDirection)('redo');
      } else {
        swipeDirection.value = 'none';
      }
    })
    .onEnd((e) => {
      if (hapticFired.value && Math.abs(e.translationX) > 80) {
        if (e.translationX > 0) {
          runOnJS(executeUndo)();
        } else {
          runOnJS(executeRedo)();
        }
      }

      translateX.value = withSpring(0);
      swipeDirection.value = 'none';
      hapticFired.value = false;
    });

  const iconContainerStyle = useAnimatedStyle(() => {
    const showIcon = swipeDirection.value !== 'none';
    return {
      opacity: withTiming(showIcon ? 1 : 0, { duration: 150 }),
      transform: [{ scale: withTiming(showIcon ? 1 : 0.8, { duration: 150 }) }],
    };
  });

  // Memoized renderItem for FlatList
  const renderItem = useCallback(({ item: paper }: { item: PaperItem }) => (
    <PaperEditor
      paper={paper}
      height={paperContainerHeight}
      onStateChange={handleStateChange(paper.id)}
      onCommandExecuted={handleCommandExecuted(paper.id)}
      pendingCommand={pendingCommands[paper.id] || null}
      onContentChange={handleContentChange(paper.id)}
      onCreateNewPaper={createNewPaper}
      onNavigate={handleNavigate}
      onNavigatePaper={navigatePaper}
      isActive={paper.id === activePaperId}
    />
  ), [paperContainerHeight, pendingCommands, activePaperId, handleStateChange, handleCommandExecuted, handleContentChange, createNewPaper, handleNavigate, navigatePaper]);

  const keyExtractor = useCallback((item: PaperItem) => item.id, []);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: paperContainerHeight,
    offset: paperContainerHeight * index,
    index,
  }), [paperContainerHeight]);

  // Handle scroll to index failure (fallback for edge cases)
  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: false,
        });
      });
    },
    []
  );

  // Get initial scroll index from active paper
  const getInitialScrollIndex = useCallback(() => {
    if (!activePaperId || papers.length === 0) return 0;
    const index = papers.findIndex((p) => p.id === activePaperId);
    return index >= 0 ? index : 0;
  }, [activePaperId, papers]);

  // Get the active paper for web (single paper view)
  const activePaper = useMemo(() => {
    return papers.find((p) => p.id === activePaperId) || papers[0];
  }, [papers, activePaperId]);

  // Web: Single paper view (no scrolling between papers, content scrolls naturally via body)
  if (isWeb) {
    return (
      <>
        {activePaper && (
          <Editor
            key={activePaper.id}
            onStateChange={handleStateChange(activePaper.id)}
            onCommandExecuted={handleCommandExecuted(activePaper.id)}
            pendingCommand={pendingCommands[activePaper.id] || null}
            initialContent={activePaper.data.content}
            onContentChange={handleContentChange(activePaper.id)}
            onCreateNewPaper={createNewPaper}
            onNavigate={handleNavigate}
            onNavigatePaper={navigatePaper}
            dom={{ hideKeyboardAccessoryView: true }}
          />
        )}
      </>
    );
  }

  // Mobile: TikTok-style paper scrolling
  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <GestureDetector gesture={panGesture}>
        <AnimatedFlatList
          ref={flatListRef}
          data={papers}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          // TikTok-style snapping behavior
          pagingEnabled
          snapToInterval={paperContainerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={true}
          // Appearance
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isKeyboardVisible}
          // Active paper detection (efficient - only fires on visibility change)
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          // Virtualization - only render visible items for performance
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={true}
          // Scroll position recovery
          initialScrollIndex={isReady ? getInitialScrollIndex() : 0}
          onScrollToIndexFailed={onScrollToIndexFailed}
        />
      </GestureDetector>

      <Animated.View
        className="absolute self-center p-3 rounded-2xl bg-neutral-800/90 z-10"
        style={[{ top: insets.top + 16 }, iconContainerStyle]}
      >
        <FontAwesome6
          name={iconDirection === 'undo' ? 'rotate-left' : 'rotate-right'}
          size={24}
          color="#8E8E93"
        />
      </Animated.View>

      <EditorToolbar editorState={activeEditorState} onAction={handleToolbarAction} isKeyboardVisible={isKeyboardVisible} onNavigate={handleNavigate} />
    </View>
  );
}
