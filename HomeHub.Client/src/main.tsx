import '@fontsource-variable/inter';
import '@fontsource-variable/newsreader';
import '@fontsource-variable/newsreader/wght-italic.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastViewport } from './components/ToastViewport';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastViewport />
    </QueryClientProvider>
  </StrictMode>,
);
