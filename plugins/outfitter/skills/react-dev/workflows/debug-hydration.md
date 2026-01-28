# Workflow: Debug Hydration

Debug SSR hydration mismatches where server-rendered HTML doesn't match client render.

<required_reading>

**Read these reference files NOW:**

1. [react-19-patterns.md](../references/react-19-patterns.md) - Server/client component patterns

</required_reading>

<prerequisites>

- SSR/SSG React app (Next.js, Remix, etc.)
- Hydration warning in console
- Understanding of server vs client rendering

</prerequisites>

<process>

## Step 1: Identify the Mismatch

Look for hydration warnings in the browser console.

```
Warning: Text content did not match. Server: "January 28, 2026" Client: "January 27, 2026"

Warning: Prop `className` did not match. Server: "theme-dark" Client: "theme-light"

Warning: Expected server HTML to contain a matching <div> in <div>.
```

The warning tells you:
- What didn't match (text, prop, element)
- Server value vs client value
- Where in the tree it occurred

## Step 2: Identify Common Causes

Check these common hydration mismatch sources:

### Date/Time Differences

```typescript
// Problem: Different timezones
function Footer() {
  return <span>Copyright {new Date().getFullYear()}</span>;
  // Server: 2026 (UTC) | Client: 2025 (local timezone near midnight)
}

// Fix: Use consistent formatting
function Footer() {
  const [year, setYear] = useState<number>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span>Copyright {year ?? '2025-2026'}</span>;
}
```

### Browser-Only APIs

```typescript
// Problem: window/document not available on server
function Layout() {
  const width = window.innerWidth; // Error on server!
  return <div className={width > 768 ? 'desktop' : 'mobile'}>...</div>;
}

// Fix: Check for client-side or use useEffect
function Layout() {
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render mobile-first on server, update on client
  const isMobile = width === undefined || width <= 768;
  return <div className={isMobile ? 'mobile' : 'desktop'}>...</div>;
}
```

### Random IDs

```typescript
// Problem: Different random values
function Form() {
  const id = `input-${Math.random()}`; // Different on server vs client!
  return (
    <div>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </div>
  );
}

// Fix: Use useId hook
function Form() {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </div>
  );
}
```

### localStorage/sessionStorage

```typescript
// Problem: Storage not available on server
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = localStorage.getItem('theme') || 'light'; // Fails on server!
  return <div className={`theme-${theme}`}>{children}</div>;
}

// Fix: Initialize in useEffect
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light'); // Default for SSR

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
  }, []);

  return <div className={`theme-${theme}`}>{children}</div>;
}
```

### User Agent / Feature Detection

```typescript
// Problem: Server doesn't know client capabilities
function VideoPlayer({ src }: { src: string }) {
  const supportsHLS = document.createElement('video').canPlayType('application/vnd.apple.mpegurl');
  // Server: can't check | Client: checks and differs
}

// Fix: Check on client only
function VideoPlayer({ src }: { src: string }) {
  const [format, setFormat] = useState<'hls' | 'mp4'>('mp4');

  useEffect(() => {
    const video = document.createElement('video');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      setFormat('hls');
    }
  }, []);

  return <video src={format === 'hls' ? src.replace('.mp4', '.m3u8') : src} />;
}
```

## Step 3: Compare Server vs Client Render

Create a debugging utility to log differences.

```typescript
// Debug utility - remove in production
function HydrationDebug({ name, value }: { name: string; value: unknown }) {
  const [clientValue, setClientValue] = useState<unknown>();

  useEffect(() => {
    setClientValue(value);
    if (value !== clientValue) {
      console.log(`[Hydration] ${name} mismatch:`, {
        server: clientValue,
        client: value,
      });
    }
  }, [value]);

  return null;
}

// Usage
function MyComponent() {
  const date = new Date().toISOString();
  return (
    <>
      <HydrationDebug name="date" value={date} />
      <span>{date}</span>
    </>
  );
}
```

## Step 4: Use suppressHydrationWarning Strategically

For intentional mismatches that can't be avoided.

```typescript
// Appropriate uses:
// 1. Timestamps that should show current time
<time dateTime={date.toISOString()} suppressHydrationWarning>
  {date.toLocaleTimeString()}
</time>

// 2. User-specific content that differs
<span suppressHydrationWarning>
  Welcome, {user?.name ?? 'Guest'}
</span>

// 3. Analytics/tracking IDs
<div data-visitor-id={visitorId} suppressHydrationWarning />
```

**Warning:** Don't use this to hide real bugs. Only use when:
- The mismatch is intentional
- The component will immediately update to correct value
- There's no visual flash or layout shift

## Step 5: Move Client-Only Code to useEffect

Pattern for safely handling client-only logic.

```typescript
// Pattern: Client-only component
function ClientOnly({
  children,
  fallback = null
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
}

// Usage
<ClientOnly fallback={<LoadingSpinner />}>
  <BrowserOnlyChart data={data} />
</ClientOnly>
```

```typescript
// Pattern: Deferred client value
function useDeferredClientValue<T>(clientValue: T, serverValue: T): T {
  const [value, setValue] = useState(serverValue);

  useEffect(() => {
    setValue(clientValue);
  }, [clientValue]);

  return value;
}

// Usage
function ThemeToggle() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = useDeferredClientValue(prefersDark ? 'dark' : 'light', 'light');

  return <div className={`theme-${theme}`}>...</div>;
}
```

## Step 6: Framework-Specific Solutions

### Next.js

```typescript
// Use dynamic import with ssr: false
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false, loading: () => <Skeleton /> }
);

// Or use next/script for external scripts
import Script from 'next/script';

<Script
  src="https://example.com/analytics.js"
  strategy="afterInteractive"
/>
```

### Remix

```typescript
// Use ClientOnly from remix-utils
import { ClientOnly } from 'remix-utils';

<ClientOnly fallback={<Skeleton />}>
  {() => <BrowserOnlyComponent />}
</ClientOnly>
```

## Step 7: Verify Fix

- [ ] No hydration warnings in console
- [ ] Content appears correctly
- [ ] No flash of incorrect content
- [ ] SSR still works (check page source)
- [ ] Client interactivity works

</process>

<anti_patterns>

Avoid:

- Using suppressHydrationWarning everywhere - hides real bugs
- Checking `typeof window !== 'undefined'` at render time - still causes mismatch
- Different component structure server vs client - causes element mismatch
- Relying on useEffect for critical above-fold content - causes flash

```typescript
// Bad: Conditional component structure
function Layout() {
  if (typeof window !== 'undefined') {
    return <ClientLayout />;  // Different component!
  }
  return <ServerLayout />;
}

// Good: Same structure, deferred values
function Layout() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className="layout">
      {isMounted ? <ClientFeatures /> : null}
      <MainContent />
    </div>
  );
}
```

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Hydration warning identified and understood
- [ ] Root cause determined (date, storage, random, etc.)
- [ ] Fix implemented using appropriate pattern
- [ ] No hydration warnings in console
- [ ] No visual flash or content shift
- [ ] SSR output still valid

</success_criteria>

<cross_references>

- **debugging skill** - For systematic root cause investigation
- **add-server-action.md** - For server/client boundary patterns

</cross_references>
