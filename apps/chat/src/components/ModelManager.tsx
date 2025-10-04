import { Button, Card, CardContent, CardHeader, CardTitle, Icon } from '@ariob/ui';
import { useModelDownloads } from '../hooks/useModelDownloads';
import { DownloadProgress } from './DownloadProgress';

interface ModelManagerProps {
  onClose?: () => void;
}

export function ModelManager({ onClose }: ModelManagerProps) {
  const { downloads, pauseDownload, resumeDownload, cancelDownload } = useModelDownloads();

  return (
    <view className="w-full max-w-md mx-auto">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <view className="flex items-center justify-between">
            <view className="flex items-center gap-2">
              <Icon name="download" className="h-5 w-5 text-primary" />
              <CardTitle>Downloads</CardTitle>
            </view>
            <Button
              variant="ghost"
              size="sm"
              icon="x"
              bindtap={onClose}
              aria-label="Close"
              className="h-8 w-8 min-w-8"
            />
          </view>
          {downloads.length > 0 && (
            <text className="text-xs text-muted-foreground mt-1 block">
              {downloads.length} {downloads.length === 1 ? 'download' : 'downloads'} in progress
            </text>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {downloads.length === 0 ? (
            <view className="py-12 px-6 text-center">
              <Icon name="inbox" className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
              <text className="text-sm font-medium text-foreground block mb-1">No active downloads</text>
              <text className="text-xs text-muted-foreground block">Download progress will appear here</text>
            </view>
          ) : (
            <scroll-view className="max-h-80" scroll-y>
              <view className="p-4 space-y-3">
                {downloads.map(download => (
                  <DownloadProgress
                    key={download.modelName}
                    modelName={download.modelName}
                    percentage={download.percentage}
                    status={download.status}
                    errorMessage={download.errorMessage}
                    onPause={() => pauseDownload(download.modelName)}
                    onResume={() => resumeDownload(download.modelName)}
                    onCancel={() => cancelDownload(download.modelName)}
                  />
                ))}
              </view>
            </scroll-view>
          )}
        </CardContent>
      </Card>
    </view>
  );
}
