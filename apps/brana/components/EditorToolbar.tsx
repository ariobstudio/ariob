import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { KeyboardStickyView, KeyboardController } from 'react-native-keyboard-controller';
import { FontAwesome6 } from '@expo/vector-icons';
import { ToolbarIconButton } from './ToolbarIconButton';
import type { EditorState, EditorCommand } from '../types/editor';
import { getToolbarContext } from '../types/editor';

interface EditorToolbarProps {
  editorState: EditorState;
  onAction: (command: EditorCommand) => void;
  isKeyboardVisible?: boolean;
  onNavigate?: (screen: 'archive' | 'settings') => void;
}

export function EditorToolbar({ editorState, onAction, isKeyboardVisible = false, onNavigate }: EditorToolbarProps) {
  const [isLinkInputMode, setIsLinkInputMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const context = getToolbarContext(editorState, isLinkInputMode);

  const handleLinkPress = () => {
    if (editorState.isLink && editorState.linkUrl) {
      setLinkUrl(editorState.linkUrl);
    } else {
      setLinkUrl('');
    }
    setIsLinkInputMode(true);
  };

  const handleLinkConfirm = () => {
    if (linkUrl.trim()) {
      onAction({ type: 'setLink', url: linkUrl.trim() });
    } else {
      onAction({ type: 'unsetLink' });
    }
    setIsLinkInputMode(false);
    setLinkUrl('');
  };

  const handleLinkCancel = () => {
    setIsLinkInputMode(false);
    setLinkUrl('');
  };

  const renderContent = () => {
    // When keyboard is hidden, show navigation menu on mobile
    if (!isKeyboardVisible) {
      return (
        <NavigationToolbarContent onAction={onAction} onNavigate={onNavigate} />
      );
    }

    switch (context) {
      case 'link-input':
        return (
          <LinkInputContent
            linkUrl={linkUrl}
            onChangeUrl={setLinkUrl}
            onConfirm={handleLinkConfirm}
            onCancel={handleLinkCancel}
          />
        );
      case 'selection':
        return (
          <SelectionToolbarContent
            editorState={editorState}
            onAction={onAction}
            onLinkPress={handleLinkPress}
          />
        );
      case 'list':
        return (
          <ListToolbarContent editorState={editorState} onAction={onAction} isKeyboardVisible={isKeyboardVisible} />
        );
      default:
        return (
          <DefaultToolbarContent editorState={editorState} onAction={onAction} isKeyboardVisible={isKeyboardVisible} />
        );
    }
  };

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
      <View className="px-2 py-1.5 bg-black">{renderContent()}</View>
    </KeyboardStickyView>
  );
}

interface NavigationToolbarContentProps {
  onAction: (command: EditorCommand) => void;
  onNavigate?: (screen: 'archive' | 'settings') => void;
}

function NavigationToolbarContent({ onAction, onNavigate }: NavigationToolbarContentProps) {
  return (
    <View className="flex-row items-center justify-center gap-4">
      <ToolbarIconButton
        icon="file"
        onPress={() => onAction({ type: 'createNewPaper' })}
      />
      <ToolbarIconButton
        icon="box-archive"
        onPress={() => onNavigate?.('archive')}
      />
      <ToolbarIconButton
        icon="gear"
        onPress={() => onNavigate?.('settings')}
      />
    </View>
  );
}

function DefaultToolbarContent({ editorState, onAction, isKeyboardVisible }: EditorToolbarProps) {
  return (
    <View className="flex-row items-center">
      <ToolbarIconButton
        icon="heading"
        label="1"
        active={editorState.headingLevel === 1}
        onPress={() => onAction({ type: 'setHeading', level: 1 })}
      />
      <ToolbarIconButton
        icon="heading"
        label="2"
        active={editorState.headingLevel === 2}
        onPress={() => onAction({ type: 'setHeading', level: 2 })}
      />
      <ToolbarIconButton
        icon="quote-left"
        active={editorState.isBlockquote}
        onPress={() => onAction({ type: 'toggleBlockquote' })}
      />
      <ToolbarIconButton
        icon="list-ul"
        active={editorState.isBulletList}
        onPress={() => onAction({ type: 'toggleBulletList' })}
      />
      <ToolbarIconButton
        icon="square-check"
        active={editorState.isTaskList}
        onPress={() => onAction({ type: 'toggleTaskList' })}
      />
      {isKeyboardVisible && (
        <>
          <View className="flex-1" />
          <ToolbarIconButton
            icon="keyboard"
            onPress={() => KeyboardController.dismiss()}
          />
        </>
      )}
    </View>
  );
}

function ListToolbarContent({ editorState, onAction, isKeyboardVisible }: EditorToolbarProps) {
  return (
    <View className="flex-row items-center">
      <ToolbarIconButton
        icon="list-ul"
        active={editorState.isBulletList}
        onPress={() => onAction({ type: 'toggleBulletList' })}
      />
      <ToolbarIconButton
        icon="list-ol"
        active={editorState.isOrderedList}
        onPress={() => onAction({ type: 'toggleOrderedList' })}
      />
      <ToolbarIconButton
        icon="square-check"
        active={editorState.isTaskList}
        onPress={() => onAction({ type: 'toggleTaskList' })}
      />
      <ToolbarIconButton
        icon="outdent"
        onPress={() => onAction({ type: 'outdent' })}
        disabled={editorState.listDepth <= 1}
      />
      <ToolbarIconButton
        icon="indent"
        onPress={() => onAction({ type: 'indent' })}
      />
      <ToolbarIconButton
        icon="arrow-up"
        onPress={() => onAction({ type: 'moveUp' })}
        disabled={editorState.listItemIndex === 0}
      />
      <ToolbarIconButton
        icon="arrow-down"
        onPress={() => onAction({ type: 'moveDown' })}
        disabled={editorState.listItemIndex >= editorState.listLength - 1}
      />
      {isKeyboardVisible && (
        <>
          <View className="flex-1" />
          <ToolbarIconButton
            icon="keyboard"
            onPress={() => KeyboardController.dismiss()}
          />
        </>
      )}
    </View>
  );
}

interface SelectionToolbarContentProps extends EditorToolbarProps {
  onLinkPress: () => void;
}

function SelectionToolbarContent({
  editorState,
  onAction,
  onLinkPress,
}: SelectionToolbarContentProps) {
  return (
    <View className="flex-row items-center">
      <ToolbarIconButton
        icon="bold"
        active={editorState.isBold}
        onPress={() => onAction({ type: 'toggleBold' })}
      />
      <ToolbarIconButton
        icon="italic"
        active={editorState.isItalic}
        onPress={() => onAction({ type: 'toggleItalic' })}
      />
      <ToolbarIconButton
        icon="strikethrough"
        active={editorState.isStrike}
        onPress={() => onAction({ type: 'toggleStrike' })}
      />
      <ToolbarIconButton
        icon="link"
        active={editorState.isLink}
        onPress={onLinkPress}
      />
    </View>
  );
}

interface LinkInputContentProps {
  linkUrl: string;
  onChangeUrl: (url: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function LinkInputContent({
  linkUrl,
  onChangeUrl,
  onConfirm,
  onCancel,
}: LinkInputContentProps) {
  return (
    <View className="flex-row items-center gap-2">
      <TextInput
        className="flex-1 h-10 bg-neutral-800 rounded-lg px-3 text-white text-base"
        value={linkUrl}
        onChangeText={onChangeUrl}
        placeholder="Enter URL..."
        placeholderTextColor="#636366"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        autoFocus
        onSubmitEditing={onConfirm}
      />
      <Pressable className="w-10 h-10 rounded-lg items-center justify-center bg-neutral-800" onPress={onConfirm}>
        <FontAwesome6 name="check" size={18} color="#30D158" />
      </Pressable>
      <Pressable className="w-10 h-10 rounded-lg items-center justify-center bg-neutral-800" onPress={onCancel}>
        <FontAwesome6 name="xmark" size={18} color="#FF453A" />
      </Pressable>
    </View>
  );
}
