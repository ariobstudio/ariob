import { useTheme } from '@ariob/ui';

export function App() {
  const { withTheme } = useTheme();

  return (
    <page className={
      withTheme("bg-card pt-safe-top w-full h-full", "dark bg-card pt-safe-top w-full h-full")
    }>
      <text className="text-foreground">
        Hello World!
      </text>
    
    </page>
  )
}
