'use client';
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem('zoox-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
