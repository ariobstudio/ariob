import { useBibleStore } from '../store/bible-store';
import { Button, Card, Column, Row } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

export function Settings() {
  const { fontScale, theme, setFontScale, setTheme, goBack } = useBibleStore();
  const { withTheme } = useTheme();

  const handleFontScaleChange = (e: any) => {
    const value = parseFloat(e.detail.value);
    setFontScale(value);
  };

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border bg-card">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <Column spacing="xs" className="flex-1">
            <text className="text-xl font-bold text-foreground">Settings</text>
            <text className="text-xs text-muted-foreground">
              Customize your reading experience
            </text>
          </Column>
        </Row>
      </view>

      {/* Settings Content */}
      <scroll-view scroll-y className="flex-1 w-full">
        <Column spacing="md" className="p-4">
          {/* Typography Section */}
          <Column spacing="sm">
            <text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Typography
            </text>

            <Card>
              <Column spacing="lg" className="p-4">
                {/* Font Scale */}
                <Column spacing="sm">
                  <Row align="center" justify="between">
                    <text className="text-sm font-medium text-foreground">Font Size</text>
                    <text className="text-xs text-muted-foreground">
                      {Math.round(fontScale * 100)}%
                    </text>
                  </Row>
                  <view className="w-full">
                    <slider
                      min={0.8}
                      max={1.5}
                      step={0.1}
                      value={fontScale}
                      bindchange={handleFontScaleChange}
                      className="w-full"
                    />
                  </view>
                  <text className="text-xs text-muted-foreground">
                    Adjust text size for comfortable reading
                  </text>
                </Column>
              </Column>
            </Card>
          </Column>

          {/* Appearance Section */}
          <Column spacing="sm">
            <text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Appearance
            </text>

            <Card>
              <Column spacing="sm" className="p-4">
                <text className="text-sm font-medium text-foreground mb-2">Theme</text>

                <Row spacing="sm" width="full">
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="flex-1"
                  >
                    <text>System</text>
                  </Button>
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex-1"
                  >
                    <text>Light</text>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex-1"
                  >
                    <text>Dark</text>
                  </Button>
                </Row>

                <text className="text-xs text-muted-foreground mt-2">
                  Choose how the app appears
                </text>
              </Column>
            </Card>
          </Column>

          {/* About Section */}
          <Column spacing="sm">
            <text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              About
            </text>

            <Card>
              <Column spacing="md" className="p-4">
                <Column spacing="xs">
                  <text className="text-sm font-bold text-foreground">Orthodox Study Bible</text>
                  <text className="text-xs text-muted-foreground">Version 1.0.0</text>
                </Column>

                <view className="h-px bg-border" />

                <text className="text-xs text-muted-foreground leading-relaxed">
                  Built with LynxJS and powered by the Orthodox Study Bible text with study notes,
                  cross-references, and liturgical readings.
                </text>
              </Column>
            </Card>
          </Column>
        </Column>
      </scroll-view>
    </Column>
  );
}
