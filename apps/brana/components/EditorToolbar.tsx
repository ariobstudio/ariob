import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { FontAwesome6 } from '@expo/vector-icons';
import { ToolbarIconButton } from './ToolbarIconButton';
import type { EditorState, EditorCommand } from '../types/editor';
import { getToolbarContext } from '../types/editor';

interface EditorToolbarProps {
  editorState: EditorState;
  onAction: (command: EditorCommand) => void;
}

export function EditorToolbar({ editorState, onAction }: EditorToolbarProps) {
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
          <ListToolbarContent editorState={editorState} onAction={onAction} />
        );
      default:
        return (
          <DefaultToolbarContent editorState={editorState} onAction={onAction} />
        );
    }
  };

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
      <View className="px-2 py-1.5">{renderContent()}</View>
    </KeyboardStickyView>
  );
}

function DefaultToolbarContent({ editorState, onAction }: EditorToolbarProps) {
  return (
    <View className="flex-row items-center">
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
      </View>
      <View className="w-px h-6 bg-neutral-700 mx-2" />
      <View className="flex-row items-center">
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
        <ToolbarIconButton
          icon="scissors"
          onPress={() => onAction({ type: 'createNewPaper' })}
        />
      </View>
    </View>
  );
}

function ListToolbarContent({ editorState, onAction }: EditorToolbarProps) {
  return (
    <View className="flex-row items-center">
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
      </View>
      <View className="w-px h-6 bg-neutral-700 mx-2" />
      <View className="flex-row items-center">
        <ToolbarIconButton
          icon="outdent"
          onPress={() => onAction({ type: 'outdent' })}
          disabled={editorState.listDepth <= 1}
        />
        <ToolbarIconButton
          icon="indent"
          onPress={() => onAction({ type: 'indent' })}
        />
      </View>
      <View className="w-px h-6 bg-neutral-700 mx-2" />
      <View className="flex-row items-center">
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
      </View>
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
      <View className="flex-row items-center">
        <ToolbarIconButton
          icon="bold"
          active={editorState.isBold}
          onPress={() => onAction({ type: 'toggleBold' })}
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
