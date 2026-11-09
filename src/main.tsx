import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MultiUserApp from './auth/MultiUserApp';
import './styles.css';
import './nextgen.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('PLAYFORGE could not start because the #root element was not found in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <MultiUserApp />
  </StrictMode>,
);
