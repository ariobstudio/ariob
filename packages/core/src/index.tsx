import { root } from '@lynx-js/react';
import { MemoryRouter, Routes, Route } from 'react-router';

import { App } from './App';
import { IntroScreen } from './screens/intro/IntroScreen';
import { Step1Screen } from './screens/step1/Step1Screen';
import { Step2Screen } from './screens/step2/Step2Screen';
import { Step3Screen } from './screens/step3/Step3Screen';

root.render(
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<IntroScreen />} />
      <Route path="/home" element={<App />} />
      <Route path="/step1" element={<Step1Screen />} />
      <Route path="/step2" element={<Step2Screen />} />
      <Route path="/step3" element={<Step3Screen />} />
    </Routes>
  </MemoryRouter>,
);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}