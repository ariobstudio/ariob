import { useState, useCallback } from '@lynx-js/react'
import {
  Button,
  ThemeProvider,
  Container,
  Layout,
  ScrollableContent,
  PageHeader,
  Text,
  Box,
  Flex,
  Spacer,
  Pressable,
  Avatar,
  Badge,
  Card,
  Chip,
  Input,
  List,
  ListItem,
  Modal,
  Progress,
  Spinner,
  StatusDot,
  Accordion,
  Tooltip
} from '@/components'
import { useTheme } from '@/components/ThemeProvider';  

export function ComponentShowcase() {
  const { theme, setTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  
  return (
    <ThemeProvider>
      <Layout>
        <PageHeader title="Component Showcase" description='Ariob Design System Showcase' 
          actions={
            <Button size="sm" variant={theme === 'light' ? 'primary' : 'secondary'} onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle Theme</Button>
          }
        />
      <ScrollableContent>
      {/* Buttons */}
      <Card className="mb-4">
        <Text size="xl" weight="semibold" className="mb-2">Buttons</Text>
        <Flex gap={3} align="center" justify="center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outlined">Outlined</Button>
        </Flex>
      </Card>

      {/* Badges & Chips */}
      <Card className="mb-4">
        <Text size="xl" weight="semibold" className="mb-2">Badges & Chips</Text>
        <Flex direction="column" align="center" gap={3}>
          <Flex gap={3}>
            <Badge colorScheme="primary">Primary</Badge>
            <Badge colorScheme="success">Success</Badge>
            <Badge colorScheme="danger">Danger</Badge>
          </Flex>
          <Flex gap={3}>
            <Chip colorScheme="primary">Chip</Chip>
            <Chip colorScheme="warning">Warning</Chip>
          </Flex>
        </Flex>
      </Card>

      {/* Avatars & Status */}
      <Card className="mb-4">
        <Text size="xl" weight="semibold" className="mb-2">Avatars & Status</Text>
        <Flex gap={3} align="center">
          <Avatar src="https://i.pravatar.cc/100?img=3" size={48} />
          <Avatar src="https://i.pravatar.cc/100?img=5" size={32} />
          <StatusDot status="online" />
          <StatusDot status="busy" />
          <StatusDot status="offline" />
        </Flex>
      </Card>

      {/* Progress & Spinner */}
      <Card className="mb-4">
        <Text size="xl" weight="semibold" className="mb-2">Progress & Spinner</Text>
        <Flex gap={3} align="center" direction="column">
          <Progress value={70} colorScheme="primary" style={{ width: 120 }} />
          <Progress value={40} colorScheme="danger" style={{ width: 120 }} />
          <Spinner size={32} />
        </Flex>
      </Card>

      {/* Modal & Tooltip */}
      <Card className="mb-4">
        <Text size="xl" weight="semibold" className="mb-2">Modal & Tooltip</Text>
        <Flex gap={3} align="center">
          <Button onPress={() => setModalOpen(true)}>Open Modal</Button>
          <Tooltip content="This is a tooltip!"><Button>Hover me</Button></Tooltip>
        </Flex>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Text size="lg" weight="bold">This is a modal!</Text>
          <Button className="mt-4" onPress={() => setModalOpen(false)}>Close</Button>
        </Modal>
      </Card>

      {/* Accordion */}
      <Card className="mb-4">
        <Text size="xl" weight="semibold" className="mb-2">Accordion</Text>
        <Accordion title="Click to expand" isOpen={accordionOpen} onToggle={() => setAccordionOpen(!accordionOpen)}>
          <Text>This is the accordion content.</Text>
        </Accordion>
      </Card>

      {/* List */}
      <Card className="mb-4">
        <Text size="xl" weight="semibold" className="mb-2">List</Text>
        <List variant="bordered">
          <ListItem icon={<StatusDot status="online" />}>Alice</ListItem>
          <ListItem icon={<StatusDot status="busy" />}>Bob</ListItem>
          <ListItem icon={<StatusDot status="offline" />}>Charlie</ListItem>
        </List>
      </Card>
        </ScrollableContent>
      </Layout>
    </ThemeProvider>
  )
}
