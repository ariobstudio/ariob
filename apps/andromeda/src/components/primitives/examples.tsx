import * as React from 'react';
import { Column, Row, List, ListItem, Scrollable } from './index';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Example data for demonstrations
const sampleItems = [
  { id: '1', title: 'First Item', subtitle: 'This is the first item', description: 'Some additional details about the first item' },
  { id: '2', title: 'Second Item', subtitle: 'This is the second item', description: 'Some additional details about the second item' },
  { id: '3', title: 'Third Item', subtitle: 'This is the third item', description: 'Some additional details about the third item' },
  { id: '4', title: 'Fourth Item', subtitle: 'This is the fourth item', description: 'Some additional details about the fourth item' },
  { id: '5', title: 'Fifth Item', subtitle: 'This is the fifth item', description: 'Some additional details about the fifth item' },
];

// Example 1: Basic Column and Row Layout
export function BasicLayoutExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Layout Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Column spacing="md">
          <Row spacing="sm" justify="between" align="center">
            <text className="font-medium">Header Section</text>
            <Button size="sm">Action</Button>
          </Row>
          
          <Row spacing="md" wrap="wrap">
            <view className="bg-primary/10 p-4 rounded-lg flex-1 min-w-48">
              <text className="text-center">Item 1</text>
            </view>
            <view className="bg-secondary/10 p-4 rounded-lg flex-1 min-w-48">
              <text className="text-center">Item 2</text>
            </view>
            <view className="bg-accent/10 p-4 rounded-lg flex-1 min-w-48">
              <text className="text-center">Item 3</text>
            </view>
          </Row>
        </Column>
      </CardContent>
    </Card>
  );
}

// Example 2: Scrollable Content
export function ScrollableExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scrollable Content Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Scrollable 
          direction="vertical" 
          height="screen" 
          padding="md" 
          spacing="sm"
          className="max-h-64 border border-border rounded-lg"
        >
          {Array.from({ length: 20 }, (_, i) => (
            <view 
              key={i} 
              className="bg-muted/50 p-3 rounded border-l-4 border-primary"
            >
              <text className="font-medium">Scrollable Item {i + 1}</text>
              <text className="text-sm text-muted-foreground">
                This is content inside a scrollable container. 
                You can scroll vertically to see more items.
              </text>
            </view>
          ))}
        </Scrollable>
      </CardContent>
    </Card>
  );
}

// Example 3: High-Performance List with renderItem
export function PerformantListExample() {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  const handleItemPress = React.useCallback((item: typeof sampleItems[0]) => {
    setSelectedItem(item.id);
  }, []);

  const renderItem = React.useCallback((item: typeof sampleItems[0], index: number) => (
    <ListItem
      variant="bordered"
      size="md"
      selected={selectedItem === item.id}
      title={item.title}
      subtitle={item.subtitle}
      description={item.description}
      leftElement={
        <view className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
          <text className="text-xs font-bold text-primary">{index + 1}</text>
        </view>
      }
      rightElement={
        selectedItem === item.id ? (
          <view className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <text className="text-xs text-white">✓</text>
          </view>
        ) : null
      }
    />
  ), [selectedItem]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>High-Performance List Example</CardTitle>
      </CardHeader>
      <CardContent>
        <List
          variant="bordered"
          height="fit"
          className="max-h-80"
          data={sampleItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onItemPress={handleItemPress}
          headerComponent={
            <view className="bg-muted/30 p-3 border-b border-border">
              <text className="font-medium text-center">Select an item below</text>
            </view>
          }
          footerComponent={
            <view className="bg-muted/30 p-3 border-t border-border">
              <text className="text-sm text-muted-foreground text-center">
                {selectedItem ? `Selected: ${selectedItem}` : 'No item selected'}
              </text>
            </view>
          }
        />
      </CardContent>
    </Card>
  );
}

// Example 4: List with Children (Manual ListItems)
export function ManualListExample() {
  const [activeStates, setActiveStates] = React.useState<boolean[]>(
    Array(5).fill(false)
  );

  const toggleState = React.useCallback((index: number) => {
    setActiveStates(prev => 
      prev.map((state, i) => i === index ? !state : state)
    );
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual List Example</CardTitle>
      </CardHeader>
      <CardContent>
        <List variant="elevated" padding="sm" spacing="xs">
          {sampleItems.map((item, index) => (
            <ListItem
              key={item.id}
              variant="card"
              size="lg"
              state={activeStates[index] ? 'active' : 'default'}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => toggleState(index)}
              leftElement={
                <view className={`w-3 h-3 rounded-full ${
                  activeStates[index] ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              }
              rightElement={
                <Button 
                  variant="ghost" 
                  size="sm"
                  bindtap={() => toggleState(index)}
                >
                  {activeStates[index] ? 'Active' : 'Inactive'}
                </Button>
              }
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// Example 5: Complex Layout Composition
export function ComplexLayoutExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complex Layout Composition</CardTitle>
      </CardHeader>
      <CardContent>
        <Column spacing="lg">
          {/* Header with actions */}
          <Row justify="between" align="center">
            <Column spacing="xs">
              <text className="text-lg font-semibold">Dashboard</text>
              <text className="text-sm text-muted-foreground">
                Welcome back! Here's what's happening.
              </text>
            </Column>
            <Row spacing="sm">
              <Button variant="outline" size="sm">Settings</Button>
              <Button size="sm">New Item</Button>
            </Row>
          </Row>

          {/* Stats row */}
          <Row spacing="md">
            {['Users', 'Revenue', 'Orders'].map((stat, index) => (
              <view 
                key={stat}
                className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border"
              >
                <text className="text-sm text-muted-foreground">{stat}</text>
                <text className="text-2xl font-bold text-primary">
                  {(index + 1) * 1250}
                </text>
              </view>
            ))}
          </Row>

          {/* Content sections */}
          <Row spacing="md" align="start">
            {/* Left sidebar */}
            <Column spacing="sm" className="w-64">
              <text className="font-medium">Quick Actions</text>
              <List variant="bordered">
                {['Create User', 'Generate Report', 'Export Data'].map((action) => (
                  <ListItem
                    key={action}
                    variant="ghost"
                    size="sm"
                    title={action}
                    rightElement={<text className="text-xs text-muted-foreground">→</text>}
                  />
                ))}
              </List>
            </Column>

            {/* Main content */}
            <Column spacing="sm" className="flex-1">
              <text className="font-medium">Recent Activity</text>
              <Scrollable 
                direction="vertical" 
                className="max-h-64 border rounded-lg"
                padding="sm"
              >
                <List>
                  {Array.from({ length: 10 }, (_, i) => (
                    <ListItem
                      key={i}
                      variant="bordered"
                      title={`Activity ${i + 1}`}
                      subtitle={`This happened ${i + 1} minutes ago`}
                      leftElement={
                        <view className="w-2 h-2 bg-green-500 rounded-full" />
                      }
                    />
                  ))}
                </List>
              </Scrollable>
            </Column>
          </Row>
        </Column>
      </CardContent>
    </Card>
  );
} 