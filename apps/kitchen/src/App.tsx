/**
 * Kitchen Sink App - Component Showcase
 *
 * Demonstrates all Ariob UI components using boolean flag navigation (LynxJS pattern)
 */

import { useState } from '@lynx-js/react';
import {
  Icon,
  useTheme,
  Theme,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Input,
  TextArea,
  Checkbox,
  Separator,
  Avatar,
  Spinner,
  EmptyState,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Scrollable,
} from '@ariob/ui';
import { Column, Row } from '@ariob/ui';

import './styles/globals.css';

export function App() {
  const { withTheme, currentTheme, setTheme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Boolean flags for in-app navigation (LynxJS pattern)
  const [activeTab, setActiveTab] = useState({
    components: true,
    forms: false,
    feedback: false,
    layout: false,
  });

  const toggleTheme = () => {
    'background only';
    const next = currentTheme === Theme.Light ? Theme.Dark : currentTheme === Theme.Dark ? Theme.Auto : Theme.Light;
    setTheme(next);
  };

  const openTab = (tab: string) => {
    'background only';
    setActiveTab({
      components: tab === 'components',
      forms: tab === 'forms',
      feedback: tab === 'feedback',
      layout: tab === 'layout',
    });
  };

  const handleOpenSheet = () => {
    'background only';
    setSheetOpen(true);
  };

  const handleCloseSheet = (open: boolean) => {
    'background only';
    setSheetOpen(open);
  };

  return (
    <page className={withTheme('bg-background pt-safe-top pb-safe-bottom w-full h-full', 'dark bg-background pt-safe-top pb-safe-bottom w-full h-full')}>
      <view className="flex h-full flex-col text-foreground">
        {/* Header - fixed at top */}
        <view className="px-4 py-3 border-b border-border bg-card">
          <Row justify="between" align="center">
            <text className="text-xl font-bold text-foreground">Kitchen Sink</text>
            <view bindtap={toggleTheme} className="p-2 -mr-2">
              <Icon name={currentTheme === Theme.Dark ? 'moon' : 'sun'} size="sm" />
            </view>
          </Row>
        </view>

        {/* Main scrollable content - fills remaining space */}
        <Scrollable direction="vertical" className="flex-1 bg-card">
          <view className="p-4 pb-2">
            {activeTab.components && <ComponentsScreen onOpenSheet={handleOpenSheet} />}
            {activeTab.forms && <FormsScreen />}
            {activeTab.feedback && <FeedbackScreen />}
            {activeTab.layout && <LayoutScreen />}
          </view>
        </Scrollable>

        {/* Bottom Tab Bar - fixed at bottom */}
        <view className="border-t border-border bg-card">
          <Row justify="around" align="center" className="p-2">
            <Column align="center" spacing="xs" className="flex-1" bindtap={() => openTab('components')}>
              <Icon
                name="layout-dashboard"
                size="sm"
                className={activeTab.components ? 'text-primary' : 'text-muted-foreground'}
              />
              <text className={`text-xs ${activeTab.components ? 'text-primary' : 'text-muted-foreground'}`}>
                Components
              </text>
            </Column>

            <Column align="center" spacing="xs" className="flex-1" bindtap={() => openTab('forms')}>
              <Icon
                name="file-text"
                size="sm"
                className={activeTab.forms ? 'text-primary' : 'text-muted-foreground'}
              />
              <text className={`text-xs ${activeTab.forms ? 'text-primary' : 'text-muted-foreground'}`}>
                Forms
              </text>
            </Column>

            <Column align="center" spacing="xs" className="flex-1" bindtap={() => openTab('feedback')}>
              <Icon
                name="message-circle"
                size="sm"
                className={activeTab.feedback ? 'text-primary' : 'text-muted-foreground'}
              />
              <text className={`text-xs ${activeTab.feedback ? 'text-primary' : 'text-muted-foreground'}`}>
                Feedback
              </text>
            </Column>

            <Column align="center" spacing="xs" className="flex-1" bindtap={() => openTab('layout')}>
              <Icon
                name="grid-2x2"
                size="sm"
                className={activeTab.layout ? 'text-primary' : 'text-muted-foreground'}
              />
              <text className={`text-xs ${activeTab.layout ? 'text-primary' : 'text-muted-foreground'}`}>
                Layout
              </text>
            </Column>
          </Row>
        </view>

        {/* Sheet Example */}
        {sheetOpen && (
          <Sheet open={sheetOpen} onOpenChange={handleCloseSheet}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Example Sheet</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <Column spacing="md">
                  <text className="text-muted-foreground">
                    This is an example bottom sheet component.
                  </text>
                  <Button bindtap={() => handleCloseSheet(false)}>Close Sheet</Button>
                </Column>
              </SheetBody>
            </SheetContent>
          </Sheet>
        )}
      </view>
    </page>
  );
}

function ComponentsScreen({ onOpenSheet }: { onOpenSheet: () => void }) {
  return (
    <Column spacing="md">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Different button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <Row spacing="sm" wrap="wrap">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </Row>
              <Row spacing="sm" wrap="wrap">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </Row>
            </Column>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Badge components with variants</CardDescription>
          </CardHeader>
          <CardContent>
            <Row spacing="sm" wrap="wrap">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
            <CardDescription>Avatar component with sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <Row spacing="sm" align="center">
              <Avatar size="sm" name="John Doe" />
              <Avatar size="default" name="Jane Smith" />
              <Avatar size="lg" name="Bob Johnson" />
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sheet</CardTitle>
            <CardDescription>Bottom sheet example</CardDescription>
          </CardHeader>
          <CardContent>
            <Button bindtap={onOpenSheet}>Open Sheet</Button>
          </CardContent>
        </Card>
      </Column>
  );
}

function FormsScreen() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [checked, setChecked] = useState(false);

  const handleInputChange = (e: any) => {
    'background only';
    setInputValue(e.detail.value);
  };

  const handleTextareaChange = (e: any) => {
    'background only';
    setTextareaValue(e.detail.value);
  };

  const handleCheckboxChange = (value: boolean) => {
    'background only';
    setChecked(value);
  };

  return (
    <Column spacing="md">
        <Card>
          <CardHeader>
            <CardTitle>Input Fields</CardTitle>
            <CardDescription>Text input examples</CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <Input
                placeholder="Enter text..."
                value={inputValue}
                bindinput={handleInputChange}
              />
              <Input
                placeholder="Disabled input"
                disabled
              />
              <Input
                placeholder="With prefix"
                prefix={<Icon name="search" size="sm" />}
              />
              <Input
                placeholder="With suffix"
                suffix={<Icon name="x" size="sm" />}
              />
            </Column>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TextArea</CardTitle>
            <CardDescription>Multi-line text input</CardDescription>
          </CardHeader>
          <CardContent>
            <TextArea
              placeholder="Enter multiple lines..."
              value={textareaValue}
              bindinput={handleTextareaChange}
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkbox</CardTitle>
            <CardDescription>Checkbox component</CardDescription>
          </CardHeader>
          <CardContent>
            <Row spacing="sm" align="center">
              <Checkbox
                checked={checked}
                onCheckedChange={handleCheckboxChange}
              />
              <text className="text-sm">Accept terms and conditions</text>
            </Row>
          </CardContent>
        </Card>
      </Column>
  );
}

function FeedbackScreen() {
  return (
    <Column spacing="md">
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Alert components with variants</CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="sm">
              <Alert variant="default">
                <AlertTitle icon={<Icon name="info" size="sm" />}>
                  Information
                </AlertTitle>
                <AlertDescription>
                  This is an informational alert message.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTitle icon={<Icon name="circle-alert" size="sm" />}>
                  Error
                </AlertTitle>
                <AlertDescription>
                  Something went wrong with your request.
                </AlertDescription>
              </Alert>
            </Column>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spinner</CardTitle>
            <CardDescription>Loading indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <Row spacing="md" align="center">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empty State</CardTitle>
            <CardDescription>Empty state component</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon="inbox"
              title="No items found"
              description="There are no items to display at this time."
              action={
                <Button variant="outline">Refresh</Button>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
            <CardDescription>Collapsible content sections</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <text>What is Ariob?</text>
                </AccordionTrigger>
                <AccordionContent>
                  <text>Ariob is a cross-platform framework built with LynxJS.</text>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <text>How does it work?</text>
                </AccordionTrigger>
                <AccordionContent>
                  <text>It uses a dual-thread architecture for optimal performance.</text>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </Column>
  );
}

function LayoutScreen() {
  return (
    <Column spacing="md">
        <Card>
          <CardHeader>
            <CardTitle>Rows & Columns</CardTitle>
            <CardDescription>Layout primitives</CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <view>
                <text className="text-sm font-medium mb-2">Row with spacing</text>
                <Row spacing="sm" className="p-2 bg-muted rounded">
                  <view className="p-4 bg-primary/20 rounded flex-1">
                    <text className="text-sm">Item 1</text>
                  </view>
                  <view className="p-4 bg-primary/20 rounded flex-1">
                    <text className="text-sm">Item 2</text>
                  </view>
                  <view className="p-4 bg-primary/20 rounded flex-1">
                    <text className="text-sm">Item 3</text>
                  </view>
                </Row>
              </view>

              <view>
                <text className="text-sm font-medium mb-2">Column with spacing</text>
                <Column spacing="sm" className="p-2 bg-muted rounded">
                  <view className="p-4 bg-secondary/20 rounded">
                    <text className="text-sm">Item 1</text>
                  </view>
                  <view className="p-4 bg-secondary/20 rounded">
                    <text className="text-sm">Item 2</text>
                  </view>
                  <view className="p-4 bg-secondary/20 rounded">
                    <text className="text-sm">Item 3</text>
                  </view>
                </Column>
              </view>
            </Column>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Separator</CardTitle>
            <CardDescription>Visual dividers</CardDescription>
          </CardHeader>
          <CardContent>
            <Column spacing="md">
              <text>Content above</text>
              <Separator />
              <text>Content below</text>
            </Column>
          </CardContent>
        </Card>
      </Column>
  );
}
