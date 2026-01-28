# Workflow: Migrate to React 19

Migrate existing React components to React 19 patterns, replacing deprecated APIs with modern equivalents.

<required_reading>

**Read these reference files NOW:**

1. [react-19-patterns.md](../references/react-19-patterns.md) - All React 19 patterns and migration checklist
2. [hooks.md](../references/hooks.md) - Updated hook patterns

</required_reading>

<prerequisites>

- React 19 and @types/react 19.x installed
- TypeScript 5.0+ for best type support
- Existing React 18 codebase to migrate

</prerequisites>

<process>

## Step 1: Replace forwardRef with ref Prop

React 19 allows ref as a regular prop - forwardRef is deprecated.

**Before (React 18):**

```typescript
import { forwardRef } from 'react';

type InputProps = {
  label: string;
} & React.ComponentPropsWithoutRef<'input'>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} />
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**After (React 19):**

```typescript
type InputProps = {
  ref?: React.Ref<HTMLInputElement>;
  label: string;
} & React.ComponentPropsWithoutRef<'input'>;

function Input({ ref, label, ...props }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  );
}
```

**Migration steps:**
1. Remove `forwardRef` import and wrapper
2. Add `ref?: React.Ref<ElementType>` to props type
3. Destructure ref from props
4. Remove `.displayName` assignment
5. Convert to regular function declaration

## Step 2: Replace useFormState with useActionState

useFormState is deprecated - useActionState adds isPending.

**Before (React 18 / react-dom):**

```typescript
import { useFormState } from 'react-dom';

function Form() {
  const [state, formAction] = useFormState(submitAction, initialState);
  const { pending } = useFormStatus(); // Separate hook for pending

  return (
    <form action={formAction}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}
```

**After (React 19):**

```typescript
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(submitAction, initialState);

  return (
    <form action={formAction}>
      <button disabled={isPending}>Submit</button>
    </form>
  );
}
```

**Migration steps:**
1. Change import from `react-dom` to `react`
2. Rename `useFormState` to `useActionState`
3. Add `isPending` as third destructured value
4. Remove `useFormStatus` calls for pending state

## Step 3: Add use() for Promise Handling

use() can unwrap promises and context conditionally.

**Before (React 18):**

```typescript
// Server Component
async function Page({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id); // Must await
  return <UserProfile user={user} />;
}

// Client Component
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

**After (React 19):**

```typescript
// Server Component
async function Page({ params }: { params: { id: string } }) {
  const userPromise = fetchUser(params.id); // Don't await
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}

// Client Component
'use client';
import { use } from 'react';

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspends until resolved
  return <div>{user.name}</div>;
}
```

**Migration steps:**
1. Identify await points that could stream
2. Pass promise instead of awaited value
3. Import `use` from 'react' in client component
4. Call `use(promise)` to unwrap
5. Wrap in Suspense for loading state

## Step 4: Update Context Patterns

use() works with context and can be called conditionally.

**Before (React 18):**

```typescript
function Component({ overrideTheme }: { overrideTheme?: Theme }) {
  // useContext can't be conditional
  const contextTheme = useContext(ThemeContext);
  const theme = overrideTheme ?? contextTheme;

  return <div className={theme}>Content</div>;
}
```

**After (React 19):**

```typescript
import { use } from 'react';

function Component({ overrideTheme }: { overrideTheme?: Theme }) {
  // use() can be conditional
  const theme = overrideTheme ?? use(ThemeContext);

  return <div className={theme}>Content</div>;
}
```

**Note:** This is optional - useContext still works fine. Use `use()` when you need conditional context access.

## Step 5: Remove Deprecated Patterns

Clean up patterns that are no longer needed.

**Remove unnecessary fragments:**

```typescript
// Before: Fragment needed for key
{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.label}</dt>
    <dd>{item.value}</dd>
  </Fragment>
))}

// After: Fragments can have keys directly (this worked before too)
// Just a reminder - no change needed
```

**Update string refs (if any legacy code):**

```typescript
// Before: string refs (deprecated long ago)
<input ref="myInput" />

// After: callback or useRef
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
```

**Update legacy context (if any):**

```typescript
// Before: Legacy context API
static contextTypes = { theme: PropTypes.string };

// After: Modern context
const theme = useContext(ThemeContext);
```

## Step 6: Verify Migration

Run through this checklist for each component:

```typescript
// Migration verification checklist
const migrationChecklist = {
  // Required changes
  forwardRefRemoved: true,      // No more forwardRef wrappers
  useFormStateReplaced: true,   // Using useActionState instead
  typesUpdated: true,           // @types/react@19.x

  // Optional improvements
  useForPromises: false,        // use() for streaming data
  useForContext: false,         // use() for conditional context

  // Verify no regressions
  refsStillWork: true,          // Test ref forwarding
  formsStillWork: true,         // Test form submission
  suspenseWorks: true,          // Test loading states
};
```

## Step 7: Test Thoroughly

- [ ] All components render without errors
- [ ] Refs forward correctly to DOM elements
- [ ] Forms submit and show pending state
- [ ] Error boundaries catch errors
- [ ] Suspense boundaries show fallbacks
- [ ] TypeScript has no errors

</process>

<anti_patterns>

Avoid:

- Mixing old and new patterns - be consistent across codebase
- Forgetting to update types package - @types/react must be 19.x
- Using use() outside client components for context - it works but useContext is clearer
- Removing Suspense when using use() with promises - you need the boundary

```typescript
// Bad: use() without Suspense boundary
function Page() {
  return <UserProfile userPromise={fetchUser()} />; // No Suspense!
}

// Good: Suspense wraps component using use()
function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userPromise={fetchUser()} />
    </Suspense>
  );
}
```

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] All forwardRef usages replaced with ref prop
- [ ] All useFormState replaced with useActionState
- [ ] Streaming data uses use() where beneficial
- [ ] No deprecated API warnings in console
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Manual testing confirms functionality

</success_criteria>

<migration_checklist>

React 18 to React 19:

- [ ] Update react and react-dom to 19.x
- [ ] Update @types/react and @types/react-dom to 19.x
- [ ] Update TypeScript to 5.0+ (recommended)
- [ ] Replace forwardRef with ref as prop
- [ ] Replace useFormState with useActionState
- [ ] Add 'use server' directive to Server Actions
- [ ] Add 'use client' directive to Client Components
- [ ] Use use() for streaming promises (optional)
- [ ] Test all form submissions
- [ ] Test all ref forwarding
- [ ] Verify no console warnings

</migration_checklist>

<cross_references>

- **build-component.md** - For React 19 component patterns
- **add-server-action.md** - For Server Action patterns
- **debugging skill** - If migration causes issues

</cross_references>
