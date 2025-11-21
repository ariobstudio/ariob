import type { BaseEvent, StandardProps} from '@lynx-js/types';

// Fix React 19 bigint incompatibility
declare module 'react' {
  // Override ReactNode to exclude bigint for Lynx compatibility
  type ReactNode = 
    | ReactElement
    | string
    | number
    | Iterable<ReactNode>
    | ReactPortal
    | boolean
    | null
    | undefined;
}

declare module '@lynx-js/types' {
  interface GlobalProps {
    preferredTheme?: string;
    theme: string;
    isNotchScreen: boolean;
  }

  interface TextProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
  }

  interface ViewProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
  }

  interface InputProps extends StandardProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    keyboardAvoid?: boolean;
    bindinput?: (e: BaseEvent) => void;
    bindblur?: (e: BaseEvent) => void;
    bindfocus?: (e: BaseEvent) => void;
  }

  interface TextAreaProps extends StandardProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    bindinput?: (e: BaseEvent) => void;
    bindblur?: (e: BaseEvent) => void;
    bindfocus?: (e: BaseEvent) => void;
    'auto-height'?: boolean;
  }

  interface ImageProps extends StandardProps {
    src?: string;
    alt?: string;
    className?: string;
  }

  interface ScrollViewProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    'scroll-orientation'?: 'vertical' | 'horizontal';
    'enable-scroll'?: boolean;
    'scroll-bar-enable'?: boolean;
    'initial-scroll-offset'?: number;
    'initial-scroll-to-index'?: number;
    bindscroll?: (e: BaseEvent) => void;
    bindscrollend?: (e: BaseEvent) => void;
    'main-thread:ref'?: any;
    'main-thread:bindscrollend'?: (e: any) => void;
  }

  interface ListProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    bindscroll?: (e: BaseEvent) => void;
    bindscrollend?: (e: BaseEvent) => void;
  }

  interface PageProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
  }

  interface SwiperProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    'indicator-dots'?: boolean;
    autoplay?: boolean;
    current?: number;
    bindchange?: (e: BaseEvent) => void;
  }

  interface SwiperItemProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
  }

  interface CarouselProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    'current-page'?: number;
    'paging-enabled'?: boolean;
    bindpagechange?: (e: BaseEvent) => void;
  }

  interface PagerProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    'current-page'?: number;
    'paging-enabled'?: boolean;
    bindpagechange?: (e: BaseEvent) => void;
  }

  // Navigation Components

  interface StackNavigatorProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    'initial-route-name'?: string;
    screens?: Array<any>;
    bindnavigationchange?: (e: BaseEvent) => void;
  }

  interface TabNavigatorProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    'initial-tab-index'?: number;
    tabs?: Array<any>;
    'selected-index'?: number;
    'tab-bar-hidden'?: boolean;
    'tab-bar-tint-color'?: string;
    'tab-bar-background-color'?: string;
    bindtabchange?: (e: BaseEvent) => void;
  }

  interface ScreenProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    name?: string;
    title?: string;
    component?: string;
    'initial-params'?: any;
    'header-shown'?: boolean;
    'header-back-title'?: string;
    'tab-bar-icon'?: string;
    'tab-bar-active-icon'?: string;
    'tab-bar-badge'?: string;
  }

  interface LiquidGlassProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    intensity?: number;
    'tint-color'?: string;
    saturation?: number;
  }

  interface IntrinsicElements extends Lynx.IntrinsicElements {
    input: InputProps;
    textarea: TextAreaProps;
    text: TextProps;
    image: ImageProps;
    scrollview: ScrollViewProps;
    view: ViewProps;
    list: ListProps;
    page: PageProps;
    carousel: CarouselProps;
    pager: PagerProps;
    'stack-navigator': StackNavigatorProps;
    'tab-navigator': TabNavigatorProps;
    screen: ScreenProps;
    'liquid-glass': LiquidGlassProps;
  }
}

// Extend JSX namespace for React
declare global {
  namespace JSX {
    interface IntrinsicElements {
      input: import('@lynx-js/types').InputProps;
      textarea: import('@lynx-js/types').TextAreaProps;
      text: import('@lynx-js/types').TextProps;
      image: import('@lynx-js/types').ImageProps;
      'scroll-view': import('@lynx-js/types').ScrollViewProps;
      view: import('@lynx-js/types').ViewProps;
      list: import('@lynx-js/types').ListProps;
      page: import('@lynx-js/types').PageProps;
      carousel: import('@lynx-js/types').CarouselProps;
      pager: import('@lynx-js/types').PagerProps;
      swiper: import('@lynx-js/types').SwiperProps;
      'swiper-item': import('@lynx-js/types').SwiperItemProps;
      'stack-navigator': import('@lynx-js/types').StackNavigatorProps;
      'tab-navigator': import('@lynx-js/types').TabNavigatorProps;
      screen: import('@lynx-js/types').ScreenProps;
      'liquid-glass': import('@lynx-js/types').LiquidGlassProps;
    }
  }

  // ExplorerModule types for navigation
  declare let NativeModules: {
    ExplorerModule?: {
      openSchema(url: string): void;
      openScan(): void;
      setThreadMode(mode: number): void;
      switchPreSize(enable: boolean): void;
      getSettingInfo(): { threadMode: number; preSize: boolean; enableRenderNode: boolean };
      openDevtoolSwitchPage(): void;
      navigateBack(): void;
      saveThemePreferences(theme: string, value: string): void;
    };
  };
}

export {};
