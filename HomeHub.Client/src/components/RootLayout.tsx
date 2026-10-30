import { useStore } from '@nanostores/react';
import { Outlet } from '@tanstack/react-router';
import { LoginScreen } from '../features/auth/LoginScreen';
import { $apiKey } from '../lib/session';
import { AppShell } from './AppShell';

export function RootLayout() {
  const apiKey = useStore($apiKey);
  if (!apiKey) return <LoginScreen />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
