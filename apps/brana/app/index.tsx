import { useState, useCallback, useEffect, useRef } from 'react';
import { View, useWindowDimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from '../utils/storage';
import type { PaperItem } from '../types/paper';

export default function MainScreen() {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({});
  const [pendingCommands, setPendingCommands] = useState<Record<string, PendingCommand | null>>({});
  const paperContentsRef = useRef<Record<string, string>>({});
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const paperContainerHeight = windowHeight - insets.top - (isWeb ? 0 : 60);

  const activeEditorState = activePaperId
    ? editorStates[activePaperId] || initialEditorState
    : initialEditorState;

  // Swipe gesture state
  const translateX = useSharedValue(0);
  const swipeDirection = useSharedValue<'none' | 'undo' | 'redo'>('none');
  const hapticFired = useSharedValue(false);
  const [iconDirection, setIconDirection] = useState<'undo' | 'redo'>('undo');

  useEffect(() => {
    const init = async () => {
      const loadedPapers = await loadPapers();
      const savedId = await loadCurrentPaperId();

      if (loadedPapers.length > 0) {
        setPapers(loadedPapers);
        loadedPapers.forEach((p) => {
          paperContentsRef.current[p.id] = p.data.content;
        });
        const activeId = savedId && loadedPapers.find((p) => p.id === savedId)
          ? savedId
          : loadedPapers[0].id;
        setActivePaperId(activeId);
      } else {
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
        setPapers([newPaper]);
        setActivePaperId(newId);
        paperContentsRef.current[newId] = '';
        await savePapers([newPaper]);
        await saveCurrentPaperId(newId);
      }
    };
    init();
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

    setTimeout(() => {
      const scrollPosition = papers.length * paperContainerHeight;
      scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true });
    }, 100);

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

  const updateActivePaper = useCallback((scrollPosition: number) => {
    const paperIndex = Math.round(scrollPosition / paperContainerHeight);
    if (papers[paperIndex] && papers[paperIndex].id !== activePaperId) {
      setActivePaperId(papers[paperIndex].id);
    }
  }, [papers, activePaperId, paperContainerHeight]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      runOnJS(updateActivePaper)(event.contentOffset.y);
    },
  });

  const panGesture = Gesture.Pan()
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

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <Animated.ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        scrollEventThrottle={16}
        bounces={true}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        decelerationRate="fast"
        snapToInterval={paperContainerHeight}
        snapToAlignment="start"
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View className="flex-1">
            {papers.map((paper) => (
              <View key={paper.id} className="flex-1" style={{ height: paperContainerHeight }}>
                <Editor
                  onStateChange={handleStateChange(paper.id)}
                  onCommandExecuted={handleCommandExecuted(paper.id)}
                  pendingCommand={pendingCommands[paper.id] || null}
                  initialContent={paper.data.content}
                  onContentChange={handleContentChange(paper.id)}
                  dom={{ hideKeyboardAccessoryView: true }}
                />
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </Animated.ScrollView>

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

      {!isWeb && <EditorToolbar editorState={activeEditorState} onAction={handleToolbarAction} />}
    </View>
  );
}
