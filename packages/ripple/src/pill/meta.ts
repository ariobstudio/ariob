import { useMemo } from 'react';
import { actions, type ActionType } from './actions';

export interface MetaAction {
  icon: string;
  action: ActionType;
  label: string;
  children?: MetaAction[];
}

export interface MetaActions {
  left: MetaAction | null;
  center: MetaAction;
  right: MetaAction | null;
}

interface FullViewData {
  author?: string;
  type?: string;
  isMe?: boolean;
  isProfileView?: boolean;
}

export interface PillState {
  viewDegree: number;
  hasProfile: boolean;
  fullViewData: FullViewData | null;
  focusedNodeId: string | null;
}

interface PillStrategy {
  name: string;
  shouldActivate: (state: PillState) => boolean;
  getActions: (state: PillState, resolveAction: (type: ActionType) => MetaAction) => MetaActions;
}

const FocusedStrategy: PillStrategy = {
  name: 'Focused',
  shouldActivate: (state) => !!state.focusedNodeId,
  getActions: (_, resolve) => ({
    left: null,
    right: null,
    center: resolve('close'),
  }),
};

const FullViewStrategy: PillStrategy = {
  name: 'FullView',
  shouldActivate: (state) => !!state.fullViewData,
  getActions: (state, resolve) => {
    const { fullViewData } = state;
    let center = resolve('reply_full');
    
    if (fullViewData?.type === 'profile' || fullViewData?.isProfileView) {
      const isMe = fullViewData.author === 'You' || (fullViewData.type === 'profile' && fullViewData.isMe);
      center = isMe ? resolve('edit_profile') : resolve('connect');
    }

    return {
      left: resolve('back'),
      right: resolve('options'),
      center,
    };
  },
};

const FeedStrategy: PillStrategy = {
  name: 'Feed',
  shouldActivate: () => true, // Default
  getActions: (state, resolve) => {
    let left: MetaAction | null = null;
    let right: MetaAction | null = null;
    let center = resolve('create');

    if (state.viewDegree === 0) {
      if (state.hasProfile) {
        left = resolve('settings');
        right = resolve('more');
      } else {
        right = resolve('auth_options');
      }
    } else if (state.viewDegree === 1) {
      right = resolve('find_friends');
    } else if (state.viewDegree === 2) {
      left = resolve('trending');
      right = resolve('search_global');
    }

    return { left, right, center };
  },
};

const strategies: PillStrategy[] = [
  FocusedStrategy,
  FullViewStrategy,
  FeedStrategy,
];

const resolveAction = (actionType: ActionType): MetaAction => {
  const base = actions[actionType];
  if (!base) {
    console.warn(`@ariob/ripple: unknown action "${actionType}"`);
    return { icon: '?', action: actionType, label: 'Unknown' };
  }

  const childActions = base.children?.map(resolveAction);
  return {
    icon: base.icon,
    label: base.label,
    action: actionType,
    ...(childActions && childActions.length ? { children: childActions } : {}),
  };
};

export const resolveMetaActions = (state: PillState): MetaActions => {
  const strategy = strategies.find((s) => s.shouldActivate(state)) || FeedStrategy;
  return strategy.getActions(state, resolveAction);
};

export const useMetaActions = (
  viewDegree: number, 
  hasProfile: boolean, 
  fullViewData: FullViewData | null,
  focusedNodeId: string | null = null
): MetaActions => {
  return useMemo(
    () => resolveMetaActions({ viewDegree, hasProfile, fullViewData, focusedNodeId }),
    [viewDegree, hasProfile, fullViewData, focusedNodeId],
  );
};
