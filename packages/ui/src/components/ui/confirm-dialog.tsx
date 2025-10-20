import * as React from '@lynx-js/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from './sheet';
import { Button } from './button';
import { Row, Column, Text } from '../primitives';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    'background only';
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    'background only';
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader showHandle={false}>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <SheetBody>
          <Column spacing="lg">
            {description && (
              <Text variant="muted" size="sm">
                {description}
              </Text>
            )}
            <Row spacing="md" className="w-full">
              <Button
                variant="outline"
                onTap={handleCancel}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                variant={variant}
                onTap={handleConfirm}
                className="flex-1"
              >
                {confirmText}
              </Button>
            </Row>
          </Column>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
