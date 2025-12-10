import { The } from '@ariob/the';
import hello from './hello.js';

export function App() {
  return (
    <page className="w-full h-full pt-safe-top pb-safe-bottom px-2">
      <The app={hello} />
    </page>
  )
}
