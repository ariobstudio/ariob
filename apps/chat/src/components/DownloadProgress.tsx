import { Button, Icon } from '@ariob/ui';

interface DownloadProgressProps {
  modelName: string;
  percentage: number;
  status: 'downloading' | 'paused' | 'complete' | 'error';
  errorMessage?: string;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

export function DownloadProgress({
  modelName,
  percentage,
  status,
  errorMessage,
  onPause,
  onResume,
  onCancel,
}: DownloadProgressProps) {
  const isDownloading = status === 'downloading';
  const isPaused = status === 'paused';
  const isError = status === 'error';
  const isComplete = status === 'complete';

  const statusColor = {
    downloading: 'bg-primary',
    paused: 'bg-secondary',
    complete: 'bg-success',
    error: 'bg-destructive',
  }[status];

  const statusText = {
    downloading: 'Downloading',
    paused: 'Paused',
    complete: 'Complete',
    error: 'Failed',
  }[status];

  return (
    <view className="p-3 rounded-lg border border-border bg-card shadow-sm">
      {/* Header with model name and controls */}
      <view className="flex items-center justify-between mb-2">
        <view className="flex items-center gap-2 flex-1 min-w-0">
          <Icon
            name={isDownloading ? 'download' : isPaused ? 'pause' : isComplete ? 'circle-check' : 'circle-alert'}
            className={`h-4 w-4 flex-shrink-0 ${isDownloading ? 'text-primary' : isPaused ? 'text-secondary' : isComplete ? 'text-green-600' : 'text-destructive'}`}
            style={isDownloading ? { animation: 'pulse 2s ease-in-out infinite' } : undefined}
          />
          <text className="text-sm font-medium text-foreground truncate">{modelName}</text>
        </view>
        <view className="flex items-center gap-0.5 flex-shrink-0">
          {isDownloading && onPause && (
            <Button
              variant="ghost"
              size="sm"
              icon="pause"
              bindtap={onPause}
              aria-label="Pause download"
              className="h-8 w-8 min-w-8"
            />
          )}
          {isPaused && onResume && (
            <Button
              variant="ghost"
              size="sm"
              icon="play"
              bindtap={onResume}
              aria-label="Resume download"
              className="h-8 w-8 min-w-8"
            />
          )}
          {(isDownloading || isPaused) && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              icon="x"
              bindtap={onCancel}
              aria-label="Cancel download"
              className="h-8 w-8 min-w-8 text-destructive hover:text-destructive"
            />
          )}
        </view>
      </view>

      {/* Progress bar with percentage */}
      <view className="space-y-1.5">
        <view className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <view
            className={`h-full ${statusColor} transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </view>

        {/* Status and percentage */}
        <view className="flex items-center justify-between">
          <text className="text-xs text-muted-foreground">{statusText}</text>
          <text className="text-xs font-semibold text-foreground tabular-nums">{percentage.toFixed(0)}%</text>
        </view>
      </view>

      {/* Error message */}
      {isError && errorMessage && (
        <view className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
          <text className="text-xs text-destructive">{errorMessage}</text>
        </view>
      )}
    </view>
  );
}
