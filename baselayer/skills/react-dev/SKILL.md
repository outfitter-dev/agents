---
name: react-dev
version: 1.0.0
description: Type-safe React patterns for React 18-19 including generic components, proper event typing, Server Components, Actions, and TanStack Router integration. Use when building React components with TypeScript, typing hooks, handling events, or when React TypeScript, React 19, Server Components, or --react-dev flag mentioned.
---

# React TypeScript

Type-safe React → compile-time guarantees → confident refactoring.

<when_to_use>

- Building typed React components
- Implementing generic components
- Typing event handlers, forms, refs
- Using React 19 features (Actions, Server Components, use())
- TanStack Router integration
- Custom hooks with proper typing
- Props composition and extension

NOT for: non-React TypeScript, vanilla JS React, general TypeScript patterns

</when_to_use>

<react_19_changes>

React 19 simplifies TypeScript patterns — breaking changes require migration:

**ref as prop** — forwardRef deprecated:

```typescript
// ✅ React 19 - ref as regular prop
type ButtonProps = {
  ref?: React.Ref<HTMLButtonElement>;
} & React.ComponentPropsWithoutRef<'button'>;

function Button({ ref, children, ...props }: ButtonProps) {
  return <button ref={ref} {...props}>{children}</button>;
}

// ❌ Old pattern (still works, but unnecessary)
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return <button ref={ref} {...props}>{children}</button>;
  }
);
```

**useActionState** — replaces useFormState:

```typescript
// ✅ React 19
import { useActionState } from 'react';

type FormState = { errors?: string[]; success?: boolean };

async function submitAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  'use server';
  // Server-side validation/mutation
  return { success: true };
}

function Form() {
  const [state, formAction, isPending] = useActionState(submitAction, {});
  return <form action={formAction}>...</form>;
}

// ❌ Old pattern
import { useFormState, useFormStatus } from 'react-dom';
```

**use()** — unwraps promises/context:

```typescript
// ✅ React 19 - use() for promises
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspends until resolved
  return <div>{user.name}</div>;
}

// ✅ use() for context
function Component() {
  const theme = use(ThemeContext);
  return <div className={theme} />;
}
```

**Server Components** — async by default:

```typescript
// ✅ React 19 Server Component
async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id);
  return <div>{user.name}</div>;
}

// Client Component must be separate file with 'use client'
```

See [react-19-patterns.md](references/react-19-patterns.md)

</react_19_changes>

<component_patterns>

**Props typing** — three patterns:

```typescript
// 1. Interface (extensible)
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}

// 2. Type alias (composable)
type ButtonProps = {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
};

// 3. Extend native props
type ButtonProps = {
  variant: 'primary' | 'secondary';
} & React.ComponentPropsWithoutRef<'button'>;

function Button({ variant, children, ...props }: ButtonProps) {
  return <button className={variant} {...props}>{children}</button>;
}
```

**Children typing**:

```typescript
// ✅ Specific types
type Props = {
  children: React.ReactNode;        // Anything renderable
  icon: React.ReactElement;          // Single element
  render: (data: T) => React.ReactNode;  // Render prop
};

// ❌ Avoid
type Props = {
  children: JSX.Element;  // Too restrictive
  children: any;          // Too permissive
};
```

**Optional props**:

```typescript
// ✅ Clear optionality
type Props = {
  required: string;
  optional?: string;
  withDefault: string;
};

function Component({
  required,
  optional,
  withDefault = 'default'
}: Props) {
  // optional is string | undefined
  // withDefault is string
}
```

**Discriminated unions** — type-safe variants:

```typescript
type ButtonProps =
  | { variant: 'link'; href: string }
  | { variant: 'button'; onClick: () => void };

function Button(props: ButtonProps) {
  if (props.variant === 'link') {
    return <a href={props.href}>Link</a>; // href available
  }
  return <button onClick={props.onClick}>Button</button>; // onClick available
}
```

</component_patterns>

<event_handlers>

**Event types** — use specific types for accurate target typing:

```typescript
// ✅ Mouse events
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  event.currentTarget.disabled = true; // Type-safe
  console.log(event.clientX, event.clientY);
}

// ✅ Form events
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
}

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value); // string
  console.log(event.target.checked); // boolean for checkbox
}

// ✅ Keyboard events
function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.currentTarget.blur();
  }
}

// ✅ Focus events
function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.target.select();
}
```

**Generic event handlers**:

```typescript
// ✅ Reusable handler
function createHandler<T extends HTMLElement>(
  callback: (value: string) => void
) {
  return (event: React.ChangeEvent<T>) => {
    if ('value' in event.target) {
      callback(event.target.value);
    }
  };
}

// ❌ Avoid any
function handleEvent(event: any) { /* ... */ }
```

See [event-handlers.md](references/event-handlers.md)

</event_handlers>

<hooks_typing>

**useState** — type inference and explicit typing:

```typescript
// ✅ Inference works
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string

// ✅ Explicit for unions/null
const [user, setUser] = useState<User | null>(null);
const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

// ✅ Complex initial state
type FormData = { name: string; email: string };
const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
});
```

**useRef** — distinguish element refs from mutable values:

```typescript
// ✅ DOM element ref
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus(); // Optional chaining for null
}, []);

// ✅ Mutable value ref
const countRef = useRef<number>(0);
countRef.current += 1; // No optional chaining

// ✅ Interval/timeout ref
const timeoutRef = useRef<NodeJS.Timeout>();
timeoutRef.current = setTimeout(() => {}, 1000);
```

**useReducer** — typed actions with discriminated unions:

```typescript
type State = { count: number; status: 'idle' | 'loading' };

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number }
  | { type: 'setStatus'; payload: State['status'] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'set':
      return { ...state, count: action.payload }; // payload typed
    case 'setStatus':
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

function Component() {
  const [state, dispatch] = useReducer(reducer, { count: 0, status: 'idle' });
  dispatch({ type: 'set', payload: 10 }); // ✅ Type-safe
  dispatch({ type: 'set' }); // ❌ Error: payload required
}
```

**Custom hooks** — explicit return types for clarity:

```typescript
// ✅ Simple return
function useCounter(initial: number) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  return { count, increment }; // Inferred return type
}

// ✅ Complex return - explicit tuple
function useToggle(initial = false): [boolean, () => void, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v);
  const setTrue = () => setValue(true);
  return [value, toggle, setTrue];
}

// ✅ Generic custom hook
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const; // Tuple with readonly
}

// Usage - T inferred as User
const [user, setUser] = useLocalStorage('user', { name: 'John' });
```

**useContext** — typed context:

```typescript
// ✅ Context with default value
type Theme = 'light' | 'dark';
const ThemeContext = createContext<Theme>('light');

function useTheme() {
  return useContext(ThemeContext);
}

// ✅ Context without default (must be null)
type User = { name: string; id: string };
const UserContext = createContext<User | null>(null);

function useUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error('useUser must be used within UserProvider');
  return user; // Type narrowed to User
}
```

</hooks_typing>

<generic_components>

Generic components → type inference from props → no manual type annotations at call site.

**Generic Table**:

```typescript
type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
};

function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={keyExtractor(item)}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col.render ? col.render(item[col.key], item) : String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage - T inferred as User
type User = { id: number; name: string; email: string };
<Table
  data={users}
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email', render: (val) => <a href={`mailto:${val}`}>{val}</a> }
  ]}
  keyExtractor={(user) => user.id}
/>
```

**Generic Select**:

```typescript
type SelectProps<T> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
};

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={getValue(value)}
      onChange={(e) => {
        const selected = options.find((opt) => getValue(opt) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      {options.map((option) => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

// Usage - T inferred
type Country = { code: string; name: string };
<Select
  options={countries}
  value={selectedCountry}
  onChange={setSelectedCountry}
  getLabel={(c) => c.name}
  getValue={(c) => c.code}
/>
```

**Constrained generics**:

```typescript
// ✅ Constraint ensures required properties
type HasId = { id: string | number };

type ListProps<T extends HasId> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T extends HasId>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li> // id guaranteed
      ))}
    </ul>
  );
}
```

See [generic-components.md](examples/generic-components.md)

</generic_components>

<server_components>

React 19 Server Components — async by default, run on server.

**Async Server Component**:

```typescript
// app/users/[id]/page.tsx
type Props = {
  params: { id: string };
  searchParams?: { tab?: string };
};

export default async function UserPage({ params, searchParams }: Props) {
  const user = await fetchUser(params.id); // Runs on server
  return (
    <div>
      <h1>{user.name}</h1>
      <UserTabs user={user} activeTab={searchParams?.tab} />
    </div>
  );
}
```

**Server Actions** — 'use server' directive:

```typescript
// actions/user.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function updateUser(
  userId: string,
  formData: FormData
): Promise<{ success: boolean; errors?: string[] }> {
  const name = formData.get('name');
  if (typeof name !== 'string' || name.length < 2) {
    return { success: false, errors: ['Name must be at least 2 characters'] };
  }

  await db.user.update({ where: { id: userId }, data: { name } });
  revalidatePath(`/users/${userId}`);
  return { success: true };
}
```

**Client Component with Server Action**:

```typescript
// components/UserForm.tsx
'use client';

import { useActionState } from 'react';
import { updateUser } from '@/actions/user';

type FormState = { success?: boolean; errors?: string[] };

export function UserForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prevState, formData) => updateUser(userId, formData),
    {}
  );

  return (
    <form action={formAction}>
      <input name="name" required />
      {state.errors?.map((err) => <p key={err}>{err}</p>)}
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

**use() with promises**:

```typescript
// Server Component passes promise to Client Component
async function Page() {
  const userPromise = fetchUser('123'); // Don't await
  return <UserProfile userPromise={userPromise} />;
}

// Client Component suspends until resolved
'use client';
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

See [server-components.md](examples/server-components.md)

</server_components>

<tanstack_integration>

TanStack Router — type-safe routing with loader data, search params validation.

**Route definition**:

```typescript
import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';

const userRoute = createRoute({
  path: '/users/$userId',
  component: UserPage,
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId);
    return { user };
  },
  validateSearch: z.object({
    tab: z.enum(['profile', 'settings', 'activity']).optional(),
    page: z.number().int().positive().optional(),
  }),
});
```

**Using typed route data**:

```typescript
import { useLoaderData, useSearch, useParams } from '@tanstack/react-router';

function UserPage() {
  const { user } = useLoaderData({ from: userRoute.id }); // Typed as { user: User }
  const { tab, page } = useSearch({ from: userRoute.id }); // Typed from Zod schema
  const { userId } = useParams({ from: userRoute.id }); // Typed as { userId: string }

  return (
    <div>
      <h1>{user.name}</h1>
      <Tabs activeTab={tab} />
      {page && <Pagination currentPage={page} />}
    </div>
  );
}
```

**Type-safe navigation**:

```typescript
import { useNavigate } from '@tanstack/react-router';

function Component() {
  const navigate = useNavigate();

  const goToUser = (userId: string) => {
    navigate({
      to: '/users/$userId',
      params: { userId },
      search: { tab: 'profile' }, // Type-checked against validateSearch
    });
  };
}
```

**Search params with defaults**:

```typescript
const listRoute = createRoute({
  path: '/products',
  component: ProductList,
  validateSearch: z.object({
    category: z.string().optional(),
    sortBy: z.enum(['price', 'name', 'rating']).default('name'),
    page: z.number().int().positive().default(1),
  }),
});

function ProductList() {
  const { category, sortBy, page } = useSearch({ from: listRoute.id });
  // sortBy and page have default values, never undefined
}
```

See [tanstack-router.md](references/tanstack-router.md)

</tanstack_integration>

<rules>

ALWAYS:
- Use specific event types (MouseEvent, ChangeEvent, etc)
- Type useState explicitly for unions/null
- Use ComponentPropsWithoutRef to extend native elements
- Return explicit types from custom hooks for complex returns
- Use discriminated unions for variant props
- Use as const for tuple returns from hooks
- Type Server Actions with Promise return types
- Validate search params with Zod in TanStack Router
- Use ref as prop in React 19 (no forwardRef)
- Use useActionState for form actions in React 19

NEVER:
- Use any for event handlers
- Use JSX.Element for children (use ReactNode)
- Use forwardRef in React 19+ (use ref as prop)
- Use useFormState (deprecated, use useActionState)
- Forget to handle null for useRef with DOM elements
- Mix Server and Client components in same file
- Await promises in Server Component when passing to use()
- Ignore type errors with ts-ignore in component props

</rules>

<references>

- [generic-components.md](examples/generic-components.md) — table, select, list patterns
- [server-components.md](examples/server-components.md) — async components, Server Actions
- [react-19-patterns.md](references/react-19-patterns.md) — useActionState, use(), ref as prop
- [event-handlers.md](references/event-handlers.md) — all event types, generic handlers
- [tanstack-router.md](references/tanstack-router.md) — typed routes, search params, navigation

</references>
