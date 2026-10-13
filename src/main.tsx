import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './nextgen.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('PLAYFORGE could not start because the #root element was not found in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
