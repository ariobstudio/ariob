import { useTheme, Tabs, TabsList, TabsTrigger, TabsContent, Column } from '@ariob/ui';
import { AuthTest } from './components/AuthTest';
import { CrudTest } from './components/CrudTest';
import { IncrementalTest } from './components/IncrementalTest';

export function App() {
  const { withTheme } = useTheme();

  return (
    <page className={
      withTheme("bg-background pt-safe-top w-full h-full", "dark bg-background pt-safe-top w-full h-full")
    }>
      <Column className="w-full h-full">
        <Tabs defaultValue="test" className="w-full h-full">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="crud">CRUD</TabsTrigger>
          </TabsList>

          <TabsContent value="test">
            <IncrementalTest />
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
