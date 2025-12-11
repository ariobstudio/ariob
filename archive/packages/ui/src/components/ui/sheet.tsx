import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { cn } from '../../lib/utils';
import { Icon } from './icon';
import type { LynxReactNode } from '../../types/react';

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet');
  }
  return context;
}

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: LynxReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetContentProps extends ViewProps {
  side?: 'bottom' | 'top';
  className?: string;
  children: LynxReactNode;
}

function SheetContent({ side = 'bottom', className, children, ...props }: SheetContentProps) {
  const { open, onOpenChange } = useSheetContext();
  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const startY = React.useRef(0);

  // Reset closing state when opening
  React.useEffect(() => {
    if (open) {
      setIsClosing(false);
      setDragY(0);
    }
  }, [open]);

  if (!open && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setIsDragging(false);
    setTimeout(() => {
      onOpenChange(false);
      setIsClosing(false);
      setDragY(0);
    }, 300); // Match animation duration
  };

  const handleOverlayTap = () => {
    'background only';
    handleClose();
  };

  const handleTouchStart = (e: any) => {
    'background only';
    if (isClosing) return;

    // LynxJS touch event structure: try both e.detail.touches and e.touches
    const touches = e.detail?.touches || e.touches;
    if (!touches || touches.length === 0) return;

    const touch = touches[0];
    const yPos = touch.pageY || touch.clientY || 0;
    startY.current = yPos;
    setIsDragging(true);
  };

  const handleTouchMove = (e: any) => {
    'background only';
    if (!isDragging || isClosing) return;

    // LynxJS touch event structure
    const touches = e.detail?.touches || e.touches;
    if (!touches || touches.length === 0) return;

    const touch = touches[0];
    const currentY = touch.pageY || touch.clientY || 0;
    const diff = side === 'bottom' ? currentY - startY.current : startY.current - currentY;

    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    'background only';
    if (isClosing) return;

    if (dragY > 100) {
      handleClose();
    } else {
      setDragY(0);
      setIsDragging(false);
    }
  };

  const slideAnimation = !isDragging && dragY === 0
    ? (isClosing
        ? (side === 'bottom' ? 'slideDown 0.3s ease-out' : 'slideUpOut 0.3s ease-out')
        : (side === 'bottom' ? 'slideUp 0.3s ease-out' : 'slideDownIn 0.3s ease-out')
      )
    : 'none';

  const transformValue = isClosing
    ? (side === 'bottom' ? 'translateY(100vh)' : 'translateY(-100vh)')
    : `translateY(${side === 'bottom' ? dragY : -dragY}px)`;

  return (
    <>
      {/* Overlay */}
      <view
        className="absolute top-0 left-0 right-0 bottom-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          animation: isClosing ? 'fadeOut 0.3s ease-out forwards' : 'fadeInOverlay 0.2s ease-out',
          opacity: isClosing ? 0 : 1,
          transition: isClosing ? 'opacity 0.3s ease-out' : 'none',
        }}
        bindtap={handleOverlayTap}
      />

      {/* Sheet Content */}
      <view
        className={cn(
          'absolute left-0 right-0 z-50 bg-background',
          side === 'bottom' ? 'bottom-0' : 'top-0',
          className
        )}
        style={{
          borderTopLeftRadius: side === 'bottom' ? '24px' : '0',
          borderTopRightRadius: side === 'bottom' ? '24px' : '0',
          borderBottomLeftRadius: side === 'top' ? '24px' : '0',
          borderBottomRightRadius: side === 'top' ? '24px' : '0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: slideAnimation,
          maxHeight: '85vh',
          // LynxJS doesn't support overflow property
          transform: transformValue,
          transition: isClosing ? 'transform 0.3s ease-out' : (isDragging ? 'none' : 'transform 0.2s ease-out'),
        }}
        bindtouchstart={handleTouchStart}
        bindtouchmove={handleTouchMove}
        bindtouchend={handleTouchEnd}
        {...props}
      >
        {children}
      </view>
    </>
  );
}

interface SheetHeaderProps extends ViewProps {
  showHandle?: boolean;
  showClose?: boolean;
  className?: string;
  children?: LynxReactNode;
}

function SheetHeader({ showHandle = true, showClose = true, className, children, ...props }: SheetHeaderProps) {
  const { onOpenChange } = useSheetContext();

  const handleCloseClick = () => {
    'background only';
    onOpenChange(false);
  };

  return (
    <>
      {/* Drag Handle */}
      {showHandle && (
        <view className="w-full flex items-center justify-center pt-3 pb-2">
          <view
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: 'var(--border)',
              borderRadius: '2px',
            }}
          />
        </view>
      )}

      {/* Header Content */}
      <view
        className={cn('px-6 flex flex-row justify-between items-center', !showHandle && 'pt-6', className)}
        {...props}
      >
        {children}
        {showClose && (
          <view
            bindtap={handleCloseClick}
            className="h-9 w-9 flex items-center justify-center rounded-full"
            style={{ cursor: 'pointer' }}
          >
            <Icon name="x" className="text-muted-foreground" />
          </view>
        )}
      </view>
    </>
  );
}

interface SheetTitleProps {
  className?: string;
  children: LynxReactNode;
}

function SheetTitle({ className, children }: SheetTitleProps) {
  return (
    <text className={cn('text-2xl font-bold text-foreground', className)}>
      {children}
    </text>
  );
}

interface SheetDescriptionProps {
  className?: string;
  children: LynxReactNode;
}

function SheetDescription({ className, children }: SheetDescriptionProps) {
  return (
    <text className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </text>
  );
}

interface SheetBodyProps extends ViewProps {
  className?: string;
  children: LynxReactNode;
}

function SheetBody({ className, children, ...props }: SheetBodyProps) {
  // LynxJS doesn't support overflow-y-auto, use scroll-view for scrolling
  return (
    <scroll-view
      className={cn('px-6 pb-6', className)}
      style={{ maxHeight: 'calc(85vh - 60px)' }}
      scroll-orientation="vertical"
      enable-scroll={true}
      scroll-bar-enable={false}
      {...props}
    >
      {children}
    </scroll-view>
  );
}

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
};
