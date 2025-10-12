import '@lynx-js/preact-devtools';
import '@lynx-js/react/debug';
import { root } from '@lynx-js/react';
import { App } from './App';
import { GraphProvider } from './GraphContext';
import './styles/globals.css';

root.render(
  <GraphProvider>
    <App />
  </GraphProvider>
);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
