'use client';
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

export default function ThemeToggle() {
  // Start deterministic so SSR and the first client render match. The real
  // theme (from localStorage / prefers-color-scheme) is applied in useEffect,
  // after hydration, to avoid a hydration mismatch on the title/icon.
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let initial: Theme = 'dark';
    try {
      const stored = localStorage.getItem('zoox-theme');
      if (stored === 'light' || stored === 'dark') initial = stored;
      else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) initial = 'light';
    } catch {
      /* ignore */
    }
    setTheme(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggle = () => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('zoox-theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
    >
      {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
    </button>
  );
}
