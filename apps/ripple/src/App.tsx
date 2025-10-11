import { useTheme, Tabs, TabsList, TabsTrigger, TabsContent, Column } from '@ariob/ui';
import { StreamTest } from './components/StreamTest';
import { AuthTest } from './components/AuthTest';
import { CrudTest } from './components/CrudTest';

export function App() {
  const { withTheme } = useTheme();

  return (
    <page className={
      withTheme("bg-background pt-safe-top w-full h-full", "dark bg-background pt-safe-top w-full h-full")
    }>
      <Column className="w-full h-full">
        <Tabs defaultValue="counter" className="w-full h-full">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="counter">Counter</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="crud">CRUD</TabsTrigger>
          </TabsList>

          <TabsContent value="counter">
            <StreamTest />
          </TabsContent>

          <TabsContent value="auth">
            <AuthTest />
          </TabsContent>

          <TabsContent value="crud">
            <CrudTest />
          </TabsContent>
        </Tabs>
      </Column>
    </page>
  )
}
