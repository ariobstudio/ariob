/**
 * Tests for Ripple Schema Definitions
 *
 * Tests the type schemas and validation helpers for NodeData structures.
 */

import type { NodeType, NodeData } from '../components/node';
import type { PostData } from '../nodes/post';
import type { MessageData } from '../nodes/message';
import type { ProfileData } from '../nodes/profile';
import type { AuthData } from '../nodes/auth';
import type { SyncData } from '../nodes/sync';
import type { GhostData } from '../nodes/ghost';
import type { SuggestionData } from '../nodes/suggestion';
import type { AIModelData, ModelOption } from '../nodes/ai';

describe('NodeType', () => {
  it('includes all expected node types', () => {
    const validTypes: NodeType[] = [
      'post',
      'message',
      'profile',
      'auth',
      'sync',
      'ghost',
      'suggestion',
      'ai-model',
    ];

    // Type check - these would fail at compile time if types are wrong
    validTypes.forEach((type) => {
      expect(typeof type).toBe('string');
    });
  });
});

describe('NodeData', () => {
  it('has required base properties', () => {
    const node: NodeData = {
      id: 'node-123',
      type: 'post',
      author: 'Alice',
      timestamp: '2h ago',
      degree: 1,
    };

    expect(node.id).toBe('node-123');
    expect(node.type).toBe('post');
    expect(node.author).toBe('Alice');
    expect(node.timestamp).toBe('2h ago');
    expect(node.degree).toBe(1);
  });

  it('allows optional properties', () => {
    const nodeWithAvatar: NodeData = {
      id: 'node-456',
      type: 'profile',
      author: 'Bob',
      timestamp: '1d ago',
      degree: 2,
      avatar: 'https://example.com/avatar.png',
      handle: '@bob',
    };

    expect(nodeWithAvatar.avatar).toBe('https://example.com/avatar.png');
    expect(nodeWithAvatar.handle).toBe('@bob');
  });

  it('accepts type-specific data objects', () => {
    const postNode: NodeData = {
      id: 'post-1',
      type: 'post',
      author: 'Charlie',
      timestamp: '30m ago',
      degree: 0,
      post: {
        content: 'Hello world!',
      },
    };

    expect(postNode.post?.content).toBe('Hello world!');
  });
});

describe('PostData', () => {
  it('has required content property', () => {
    const post: PostData = {
      content: 'This is a test post',
    };

    expect(post.content).toBe('This is a test post');
  });

  it('allows multiline content', () => {
    const post: PostData = {
      content: 'Line 1\nLine 2\nLine 3',
    };

    expect(post.content).toContain('\n');
    expect(post.content.split('\n')).toHaveLength(3);
  });
});

describe('MessageData', () => {
  it('has required messages array', () => {
    const message: MessageData = {
      id: 'msg-1',
      messages: [{ id: 'm1', from: 'me', content: 'Hey!', time: '1m' }],
    };

    expect(message.messages).toHaveLength(1);
    expect(message.messages[0].content).toBe('Hey!');
  });

  it('supports multiple messages', () => {
    const conversation: MessageData = {
      id: 'conv-1',
      messages: [
        { id: 'm1', from: 'them', content: 'Hi there', time: '5m' },
        { id: 'm2', from: 'me', content: 'Hello!', time: '4m' },
        { id: 'm3', from: 'them', content: 'How are you?', time: '3m' },
      ],
    };

    expect(conversation.messages).toHaveLength(3);
  });
});

describe('ProfileData', () => {
  it('has required properties', () => {
    const profile: ProfileData = {
      avatar: 'D',
      handle: '@dave',
      pubkey: 'pub123abc...',
      mode: 'view',
    };

    expect(profile.avatar).toBe('D');
    expect(profile.handle).toBe('@dave');
    expect(profile.pubkey).toBeTruthy();
    expect(profile.mode).toBe('view');
  });

  it('mode can be view or create', () => {
    const viewProfile: ProfileData = {
      avatar: 'V',
      handle: '@viewer',
      pubkey: 'pub...',
      mode: 'view',
    };

    const createProfile: ProfileData = {
      avatar: 'E',
      handle: '@new',
      mode: 'create',
    };

    expect(viewProfile.mode).toBe('view');
    expect(createProfile.mode).toBe('create');
  });
});

describe('AuthData', () => {
  it('can be empty (auth node is static)', () => {
    const auth: AuthData = {};

    expect(auth).toBeDefined();
    expect(Object.keys(auth)).toHaveLength(0);
  });
});

describe('SyncData', () => {
  it('has teaser property', () => {
    const sync: SyncData = {
      teaser: 'Alice, Bob, and others',
    };

    expect(sync.teaser).toBe('Alice, Bob, and others');
  });
});

describe('GhostData', () => {
  it('has content property', () => {
    const ghost: GhostData = {
      content: 'Try posting something new...',
    };

    expect(ghost.content).toBeTruthy();
    expect(typeof ghost.content).toBe('string');
  });
});

describe('SuggestionData', () => {
  it('has content property', () => {
    const suggestion: SuggestionData = {
      content: 'Connect with Alice - You have 3 mutual friends',
    };

    expect(suggestion.content).toBe('Connect with Alice - You have 3 mutual friends');
  });
});

describe('AIModelData', () => {
  it('has all required properties', () => {
    const modelOption: ModelOption = {
      id: 'llama-3.2',
      name: 'Llama 3.2',
      description: 'Fast and capable',
      size: '1.2GB',
      ramRequired: '4GB',
    };

    const aiModel: AIModelData = {
      selectedModel: null,
      downloadProgress: 0,
      isDownloading: false,
      isReady: false,
      error: null,
      models: [modelOption],
    };

    expect(aiModel.selectedModel).toBeNull();
    expect(aiModel.downloadProgress).toBe(0);
    expect(aiModel.isDownloading).toBe(false);
    expect(aiModel.isReady).toBe(false);
    expect(aiModel.error).toBeNull();
    expect(aiModel.models).toHaveLength(1);
  });

  it('tracks download progress', () => {
    const downloading: AIModelData = {
      selectedModel: 'llama-3.2',
      downloadProgress: 0.45,
      isDownloading: true,
      isReady: false,
      error: null,
      models: [],
    };

    expect(downloading.selectedModel).toBe('llama-3.2');
    expect(downloading.downloadProgress).toBe(0.45);
    expect(downloading.isDownloading).toBe(true);
  });

  it('indicates ready state', () => {
    const ready: AIModelData = {
      selectedModel: 'llama-3.2',
      downloadProgress: 1,
      isDownloading: false,
      isReady: true,
      error: null,
      models: [],
    };

    expect(ready.isReady).toBe(true);
    expect(ready.downloadProgress).toBe(1);
  });

  it('can hold error state', () => {
    const errored: AIModelData = {
      selectedModel: 'llama-3.2',
      downloadProgress: 0.3,
      isDownloading: false,
      isReady: false,
      error: 'Network error',
      models: [],
    };

    expect(errored.error).toBe('Network error');
    expect(errored.isDownloading).toBe(false);
  });
});

describe('ModelOption', () => {
  it('has all required properties', () => {
    const model: ModelOption = {
      id: 'qwen-2.5',
      name: 'Qwen 2.5',
      description: 'Efficient multilingual model',
      size: '800MB',
      ramRequired: '2GB',
    };

    expect(model.id).toBe('qwen-2.5');
    expect(model.name).toBe('Qwen 2.5');
    expect(model.description).toBeTruthy();
    expect(model.size).toBe('800MB');
    expect(model.ramRequired).toBe('2GB');
  });
});
