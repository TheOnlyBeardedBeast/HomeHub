import { useStore } from '@nanostores/react';
import { Moon, Sun } from 'lucide-react';
import { $theme, toggleTheme } from '../lib/theme';
import { IconButton } from './ui/Button';

export function ThemeToggle({
  size = 'sm',
  variant = 'ghost',
}: {
  size?: 'sm' | 'md';
  variant?: 'secondary' | 'ghost' | 'quiet';
}) {
  const dark = useStore($theme) === 'dark';

  return (
    <IconButton
      label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      size={size}
      variant={variant}
      onClick={toggleTheme}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </IconButton>
  );
}
