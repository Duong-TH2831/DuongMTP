'use client';

import { useEffect } from 'react';
import { useAppState } from '@/store';

export default function ThemeSync() {
  const { theme } = useAppState();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return null;
}
