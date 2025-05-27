import '@/styles/globals.css';

import { root } from '@lynx-js/react';
import { MemoryRouter } from 'react-router';
import { App } from './App';

root.render(
  <MemoryRouter>
    <App />
  </MemoryRouter>,
);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
