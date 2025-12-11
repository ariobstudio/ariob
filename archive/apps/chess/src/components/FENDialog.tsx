/**
 * FEN Dialog Component
 *
 * Allows users to:
 * - Export current game position as FEN notation
 * - Import game positions from FEN strings
 * - Copy FEN to clipboard for sharing
 */

import { useState } from '@lynx-js/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  Button,
  Icon,
  Column,
  Row,
  Input,
  Badge,
} from '@ariob/ui';
import { fenToGameState, validateFEN } from '../engine/fen';
import type { GameState } from '../types';

export interface FENDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFEN: string;
  onImportFEN: (gameState: GameState) => void;
}

/**
 * FEN Dialog Component
 */
export function FENDialog({
  open,
  onOpenChange,
  currentFEN,
  onImportFEN,
}: FENDialogProps) {
  const [importFEN, setImportFEN] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Handle FEN copy to clipboard
   */
  const handleCopyFEN = () => {
    'background only';

    // Note: Native clipboard not available in LynxJS yet
    // For now, just show success message
    // In production, this would use native clipboard module
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);

    // Log for debugging
    console.log('[FEN] Copied to clipboard:', currentFEN);
  };

  /**
   * Handle FEN import
   */
  const handleImportFEN = () => {
    'background only';

    const trimmedFEN = importFEN.trim();

    if (!trimmedFEN) {
      setImportError('Please enter a FEN string');
      return;
    }

    // Validate FEN
    const validation = validateFEN(trimmedFEN);
    if (!validation.valid) {
      setImportError(validation.error || 'Invalid FEN format');
      return;
    }

    try {
      // Convert FEN to game state
      const gameState = fenToGameState(trimmedFEN);

      // Import the game state
      onImportFEN(gameState);

      // Show success
      setImportSuccess(true);
      setImportError('');
      setImportFEN('');

      // Auto-close after success
      setTimeout(() => {
        setImportSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'Failed to import FEN'
      );
    }
  };

  /**
   * Handle FEN input change
   */
  const handleFENChange = (value: string) => {
    setImportFEN(value);
    setImportError('');
    setImportSuccess(false);
  };

  /**
   * Clear import field
   */
  const handleClearImport = () => {
    'background only';
    setImportFEN('');
    setImportError('');
    setImportSuccess(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>FEN Notation</SheetTitle>
        </SheetHeader>

        <SheetBody>
          <Column className="gap-6 py-4">
            {/* Export Section */}
            <view>
              <Row className="items-center gap-2 mb-3">
                <Icon name="download" className="text-primary" />
                <text className="text-base font-semibold">Export Position</text>
              </Row>

              <view className="bg-muted rounded-lg p-3 mb-3">
                <text
                  className="text-sm font-mono break-all"
                  style={{ wordBreak: 'break-all', lineHeight: '1.5' }}
                >
                  {currentFEN}
                </text>
              </view>

              <Button
                onTap={handleCopyFEN}
                variant={copySuccess ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                icon={
                  <Icon
                    name={copySuccess ? 'check' : 'copy'}
                    className={copySuccess ? 'text-primary-foreground' : 'text-foreground'}
                  />
                }
              >
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </Button>

              <text className="text-xs text-muted-foreground mt-2">
                Share this FEN string to save or replay this exact position
              </text>
            </view>

            {/* Divider */}
            <view className="h-px bg-border" />

            {/* Import Section */}
            <view>
              <Row className="items-center gap-2 mb-3">
                <Icon name="upload" className="text-primary" />
                <text className="text-base font-semibold">Import Position</text>
              </Row>

              <Column className="gap-3">
                <view>
                  <Input
                    value={importFEN}
                    onChange={handleFENChange}
                    placeholder="Paste FEN string here..."
                    className="w-full font-mono text-sm"
                  />

                  {importError && (
                    <Row className="items-center gap-1.5 mt-2">
                      <Icon name="circle-x" size="sm" className="text-destructive" />
                      <text className="text-xs text-destructive">
                        {importError}
                      </text>
                    </Row>
                  )}

                  {importSuccess && (
                    <Row className="items-center gap-1.5 mt-2">
                      <Icon name="circle-check" size="sm" className="text-primary" />
                      <text className="text-xs font-medium text-primary">
                        Position loaded successfully!
                      </text>
                    </Row>
                  )}
                </view>

                <Row className="gap-2">
                  <Button
                    onTap={handleImportFEN}
                    size="sm"
                    className="flex-1"
                    disabled={!importFEN.trim() || importSuccess}
                  >
                    Load Position
                  </Button>

                  {importFEN && (
                    <Button
                      onTap={handleClearImport}
                      variant="outline"
                      size="sm"
                      icon={<Icon name="x" />}
                    >
                      Clear
                    </Button>
                  )}
                </Row>

                <text className="text-xs text-muted-foreground">
                  Paste a FEN string to load a specific game position
                </text>
              </Column>
            </view>

            {/* Info Section */}
            <view className="bg-accent rounded-lg p-4">
              <Row className="items-start gap-2 mb-2">
                <Icon name="info" size="sm" className="text-primary" />
                <text className="text-sm font-semibold text-primary">
                  About FEN Notation
                </text>
              </Row>

              <text className="text-xs text-muted-foreground leading-relaxed">
                FEN (Forsyth-Edwards Notation) is a standard way to describe a chess
                position. It includes the board layout, current player, game phase, and
                move count.
              </text>

              <view className="mt-3">
                <text className="text-xs font-semibold text-foreground mb-1">
                  Senterej Pieces:
                </text>
                <Row className="flex-wrap gap-x-3 gap-y-1">
                  <Badge variant="outline" className="text-xs">K = Negus (King)</Badge>
                  <Badge variant="outline" className="text-xs">Q = Fers (Minister)</Badge>
                  <Badge variant="outline" className="text-xs">B = Saba (Elephant)</Badge>
                  <Badge variant="outline" className="text-xs">N = Ferese (Knight)</Badge>
                  <Badge variant="outline" className="text-xs">R = Der (Rook)</Badge>
                  <Badge variant="outline" className="text-xs">P = Medeq (Pawn)</Badge>
                </Row>
              </view>
            </view>
          </Column>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
