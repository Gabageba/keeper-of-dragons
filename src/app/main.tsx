import '@fontsource/balsamiq-sans/400.css';
import '@fontsource/balsamiq-sans/700.css';
import '@fontsource/balsamiq-sans/400-italic.css';
import '@fontsource/balsamiq-sans/700-italic.css';
import '@fontsource-variable/nunito/wght.css';
import '@fontsource-variable/nunito/wght-italic.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No #root element found');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
