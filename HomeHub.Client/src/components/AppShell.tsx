import * as stylex from '@stylexjs/stylex';
import { useLocation } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { useCurrentUser } from '../api/hooks/useCurrentUser';
import { queryClient } from '../lib/queryClient';
import { clearApiKey } from '../lib/session';
import { toast } from '../lib/toasts';
import { colors } from '../styles/tokens.stylex';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { ShellPage } from './ShellPage';
import { Sidebar } from './Sidebar';
import { displayNameFor, roleLabelFor } from './shellIdentity';

const SIDEBAR_KEY = 'homehub.sidebarHidden';

function readSidebarHidden() {
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

const styles = stylex.create({
  shell: { display: 'flex', minHeight: '100dvh', backgroundColor: colors.canvas },
  main: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
});

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const currentUser = useCurrentUser();
  const [sidebarHidden, setSidebarHidden] = useState(readSidebarHidden);
  const isAdmin = currentUser.data?.isAdmin ?? false;
  const displayName = displayNameFor(isAdmin, currentUser.data?.user?.fullName);
  const roleLabel = roleLabelFor(isAdmin, currentUser.data?.user?.type);

  function setSidebar(next: boolean) {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    } catch {
      // Storage can be unavailable in private modes; keep the in-memory state.
    }
    setSidebarHidden(next);
  }

  function signOut() {
    clearApiKey();
    queryClient.clear();
    toast('Signed out.');
  }

  return (
    <div {...stylex.props(styles.shell)}>
      <Sidebar
        hidden={sidebarHidden}
        displayName={displayName}
        roleLabel={roleLabel}
        isAdmin={isAdmin}
        pending={currentUser.isPending}
        onHide={() => setSidebar(true)}
        onShow={() => setSidebar(false)}
        onSignOut={signOut}
      />

      <main {...stylex.props(styles.main)}>
        <MobileHeader displayName={displayName} onSignOut={signOut} />

        <ShellPage pathname={location.pathname} sidebarHidden={sidebarHidden}>
          {children}
        </ShellPage>
      </main>

      <BottomNav />
    </div>
  );
}
