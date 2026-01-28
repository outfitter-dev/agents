# Workflow: Debug Hooks

Debug hook-related issues including stale closures, missing dependencies, infinite loops, and incorrect state updates.

<required_reading>

**Read these reference files NOW:**

1. [hooks.md](../references/hooks.md) - Correct hook patterns and typing

</required_reading>

<prerequisites>

- Reproducible hook issue
- React DevTools installed (recommended)
- Understanding of React's rendering model

</prerequisites>

<process>

## Step 1: Identify the Symptom

Categorize the issue to narrow down the cause.

| Symptom | Likely Cause |
|---------|--------------|
| Stale data in callbacks | Stale closure - missing dependency |
| Infinite re-renders | useEffect dependency changes every render |
| State not updating | Object/array mutation instead of new reference |
| Effect runs too often | Object/function in dependency array |
| Effect runs once, should run again | Missing dependency |
| Component re-renders unexpectedly | Parent re-renders, or context changes |

## Step 2: Add Logging to Hook Lifecycle

Instrument the hook to understand when and why it runs.

```typescript
function useDebuggedEffect(callback: () => void, deps: unknown[], name: string) {
  const renderCount = useRef(0);
  const prevDeps = useRef<unknown[]>();

  renderCount.current += 1;

  useEffect(() => {
    console.log(`[${name}] Effect running (render #${renderCount.current})`);

    if (prevDeps.current) {
      deps.forEach((dep, i) => {
        if (dep !== prevDeps.current![i]) {
          console.log(`[${name}] Dependency ${i} changed:`, {
            prev: prevDeps.current![i],
            curr: dep,
          });
        }
      });
    }

    prevDeps.current = deps;

    return callback();
  }, deps);
}

// Usage
useDebuggedEffect(() => {
  fetchData(userId);
}, [userId, config], 'FetchUserData');
```

**Quick debugging without custom hook:**

```typescript
useEffect(() => {
  console.log('Effect running', { userId, config });
  // ... effect body
}, [userId, config]);

// Log renders
console.log('Component rendering', { userId, config });
```

## Step 3: Check Dependency Arrays

Verify all dependencies are included and stable.

**Common issues:**

```typescript
// Issue 1: Missing dependency (stale closure)
const [count, setCount] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    console.log(count); // Always logs initial value!
  }, 1000);
  return () => clearInterval(interval);
}, []); // Missing count dependency

// Fix: Include dependency or use functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1); // Functional update - no dependency needed
  }, 1000);
  return () => clearInterval(interval);
}, []);


// Issue 2: Object recreated every render (infinite loop)
function Component({ userId }: { userId: string }) {
  const config = { userId, limit: 10 }; // New object every render!

  useEffect(() => {
    fetchData(config);
  }, [config]); // Infinite loop - config always changes
}

// Fix: Memoize or use primitives
function Component({ userId }: { userId: string }) {
  const config = useMemo(() => ({ userId, limit: 10 }), [userId]);

  useEffect(() => {
    fetchData(config);
  }, [config]); // Now stable
}


// Issue 3: Function in dependency array
function Component({ onSelect }: { onSelect: (id: string) => void }) {
  useEffect(() => {
    // Setup that uses onSelect
  }, [onSelect]); // Runs if parent re-renders and creates new function
}

// Fix: useCallback in parent, or useRef to track latest
function Component({ onSelect }: { onSelect: (id: string) => void }) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    // Use onSelectRef.current instead
  }, []); // Stable - no dependency on callback
}
```

## Step 4: Diagnose State Update Issues

State updates that don't seem to work.

```typescript
// Issue: Mutating state directly
const [items, setItems] = useState<Item[]>([]);

const addItem = (item: Item) => {
  items.push(item); // Mutating existing array!
  setItems(items);  // Same reference - no re-render
};

// Fix: Create new array
const addItem = (item: Item) => {
  setItems(prev => [...prev, item]); // New array reference
};


// Issue: State update batching confusion
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  // Only increments by 1! All use same count value
};

// Fix: Use functional updates
const handleClick = () => {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
  // Increments by 3
};


// Issue: Object state partial update
const [user, setUser] = useState({ name: '', email: '' });

const updateName = (name: string) => {
  setUser({ name }); // Loses email!
};

// Fix: Spread previous state
const updateName = (name: string) => {
  setUser(prev => ({ ...prev, name }));
};
```

## Step 5: Debug Infinite Loops

When component keeps re-rendering.

```typescript
// Detect infinite loop
let renderCount = 0;

function Component() {
  renderCount += 1;
  if (renderCount > 100) {
    throw new Error('Infinite loop detected');
  }

  // ... component code
}

// Common causes:

// 1. Effect sets state unconditionally
useEffect(() => {
  setData(transformData(props.data)); // Runs every render, causes re-render
}, [props.data]); // If props.data is new object each time = infinite

// Fix: Check if update is needed
useEffect(() => {
  const transformed = transformData(props.data);
  if (!isEqual(data, transformed)) {
    setData(transformed);
  }
}, [props.data]);

// 2. Object/array in JSX creates new reference
<MyComponent
  style={{ color: 'red' }}  // New object every render
  items={[1, 2, 3]}         // New array every render
/>

// Fix: Define outside or useMemo
const style = useMemo(() => ({ color: 'red' }), []);
const items = useMemo(() => [1, 2, 3], []);
```

## Step 6: Use React DevTools

React DevTools provides hook inspection.

**Steps:**
1. Open React DevTools in browser
2. Select the component with hook issues
3. Look at "hooks" section in right panel
4. Observe state/effect values
5. Use "Highlight updates" to see what re-renders

**DevTools features:**
- See current hook values
- Track which components re-render
- Profile render timing
- Inspect component props and state

## Step 7: Verify Fix

- [ ] Hook runs at expected times
- [ ] State updates reflect correctly
- [ ] No console warnings about dependencies
- [ ] No infinite loops
- [ ] Performance is acceptable

</process>

<common_issues>

### Stale Closure

```typescript
// Problem
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // Always 0
    }, 1000);
    return () => clearInterval(id);
  }, []);
}

// Solutions
// 1. Add to deps (creates new interval each time)
useEffect(() => { ... }, [count]);

// 2. Use ref (no re-render on change)
const countRef = useRef(count);
countRef.current = count;
useEffect(() => {
  setInterval(() => console.log(countRef.current), 1000);
}, []);

// 3. Functional update (for setters)
setCount(c => c + 1);
```

### Missing Cleanup

```typescript
// Problem
useEffect(() => {
  const subscription = subscribe(userId);
  // No cleanup - memory leak and stale data
}, [userId]);

// Fix
useEffect(() => {
  const subscription = subscribe(userId);
  return () => subscription.unsubscribe();
}, [userId]);
```

### Race Condition

```typescript
// Problem
useEffect(() => {
  fetchUser(userId).then(setUser);
  // If userId changes quickly, old request may resolve after new one
}, [userId]);

// Fix
useEffect(() => {
  let cancelled = false;

  fetchUser(userId).then(user => {
    if (!cancelled) setUser(user);
  });

  return () => { cancelled = true; };
}, [userId]);
```

</common_issues>

<anti_patterns>

Avoid:

- Disabling eslint-plugin-react-hooks warnings - they catch real bugs
- Using refs to "fix" missing dependencies - usually indicates design issue
- Putting everything in one massive useEffect - split into focused effects
- Memoizing everything - only memoize when profiling shows need

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Root cause identified
- [ ] Fix implemented
- [ ] No dependency array warnings
- [ ] Component renders expected number of times
- [ ] No memory leaks (cleanup works)
- [ ] Behavior matches expectations

</success_criteria>

<cross_references>

- **debugging skill** - For systematic root cause investigation
- **tdd skill** - For writing tests that catch hook issues

</cross_references>
