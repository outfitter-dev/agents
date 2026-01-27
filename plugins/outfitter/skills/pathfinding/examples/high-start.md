# Example: High Start (Level 4)

Clear request with context — minimal clarification needed, fast to delivery.

<turn>
<user>

I need to add a dark mode toggle to my Next.js app. I'm using Tailwind CSS and want to persist the preference in localStorage. Should work with system preference as a default.

</user>
<claude>

```text
[Task] Clear requirements — fast path
- Clarify implementation details (in_progress)
- Deliver dark mode implementation (pending)
```

```text
▓▓▓▓░ Mapped

You've given me most of what I need:
- Next.js + Tailwind CSS
- Toggle component
- localStorage persistence
- System preference default

Assumptions:
- Tailwind's built-in dark mode (class strategy)
- Client-side toggle (no server preference)
- Standard light/dark, no custom themes

Decisions:
- Dark mode with localStorage + system fallback
- Tailwind class strategy
- Toggle UI component
```

Can deliver now, or one quick question: where does the toggle live? (header, settings page, floating button)

[★] If you just want the implementation and will place it yourself, I can skip that question.

```text
[EnterPlanMode]
1. Skip — just give me the implementation
2. Header/navbar — always visible
3. Settings page — dedicated settings area
4. Floating button — corner of screen
5. Something else — different placement
```

</claude>
</turn>

<turn>
<user>

1, I'll put it in my header

</user>
<claude>

```text
▓▓▓▓▓ Ready

All clear — delivering implementation.
```

```text
[Task] Delivering
- Clarify implementation details (completed)
- Deliver dark mode implementation (in_progress)
```

## Dark Mode Implementation

**1. Configure Tailwind** (`tailwind.config.js`):

```javascript
module.exports = {
  darkMode: 'class',
  // ... rest of config
}
```

**2. Theme Provider** (`components/theme-provider.tsx`):

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'system', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(media.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

**3. Toggle Component** (`components/theme-toggle.tsx`):

```typescript
'use client';

import { useTheme } from './theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react'; // or your icon library

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="w-5 h-5" />}
      {theme === 'dark' && <Moon className="w-5 h-5" />}
      {theme === 'system' && <Monitor className="w-5 h-5" />}
    </button>
  );
}
```

**4. Wrap App** (`app/layout.tsx`):

```typescript
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**5. Prevent Flash** (add to `<head>` in layout):

```typescript
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('theme') || 'system';
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = theme === 'dark' || (theme === 'system' && systemDark);
        document.documentElement.classList.add(isDark ? 'dark' : 'light');
      })();
    `,
  }}
/>
```

**6. Use in Header**:

```typescript
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <nav>{/* ... */}</nav>
      <ThemeToggle />
    </header>
  );
}
```

**Usage**:
- Click toggle: cycles light → dark → system → light
- System mode: follows OS preference automatically
- Persists in localStorage across sessions
- No flash on page load

```text
[Task] Done
- Clarify implementation details (completed)
- Deliver dark mode implementation (completed)
```

All set — drop `<ThemeToggle />` in your header and you're good.

</claude>
</turn>
