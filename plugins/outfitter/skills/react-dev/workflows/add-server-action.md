# Workflow: Add Server Action

Add a React 19 server action for mutations with proper typing, validation, revalidation, and client integration.

<required_reading>

**Read these reference files NOW:**

1. [react-19-patterns.md](../references/react-19-patterns.md) - useActionState, useOptimistic
2. [server-components.md](../examples/server-components.md) - Server/client component patterns

</required_reading>

<prerequisites>

- React 19 with server components support (Next.js 14+, etc.)
- Zod installed for validation
- Understanding of data mutation requirements

</prerequisites>

<process>

## Step 1: Create Server Action File

Create a dedicated file with 'use server' directive at the top.

```typescript
// app/actions/user.ts
'use server';

import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

// Define validation schema
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
});

// Define state type
export type ActionState = {
  success?: boolean;
  errors?: Record<string, string[]>;
  message?: string;
  data?: unknown;
};
```

## Step 2: Define Input Validation

Parse and validate FormData with Zod.

```typescript
'use server';

export async function createUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Parse form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  };

  // Validate
  const result = createUserSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // result.data is now typed
  const { name, email, role } = result.data;

  // Continue with mutation...
}
```

## Step 3: Implement Mutation

Perform the database operation with proper error handling.

```typescript
'use server';

export async function createUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ... validation from Step 2

  try {
    // Check for existing user
    const existing = await db.user.findUnique({
      where: { email: result.data.email },
    });

    if (existing) {
      return {
        success: false,
        errors: { email: ['Email already registered'] },
      };
    }

    // Create user
    const user = await db.user.create({
      data: result.data,
    });

    return {
      success: true,
      message: 'User created successfully',
      data: { id: user.id },
    };
  } catch (error) {
    console.error('Failed to create user:', error);
    return {
      success: false,
      message: 'Failed to create user. Please try again.',
    };
  }
}
```

## Step 4: Handle Revalidation

Invalidate cached data after successful mutation.

```typescript
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ... validation and mutation

  if (user) {
    // Option 1: Revalidate specific path
    revalidatePath('/users');

    // Option 2: Revalidate by tag (for fetch with tags)
    revalidateTag('users');

    // Option 3: Redirect after success
    redirect(`/users/${user.id}`);

    // Note: redirect throws, so this won't execute
    return { success: true };
  }
}
```

**Revalidation strategies:**

```typescript
// Revalidate specific page
revalidatePath('/users');

// Revalidate dynamic route
revalidatePath(`/users/${userId}`);

// Revalidate layout and all nested pages
revalidatePath('/dashboard', 'layout');

// Revalidate by cache tag
revalidateTag('users');
revalidateTag(`user-${userId}`);
```

## Step 5: Create Client Form with useActionState

Connect the server action to your form component.

```typescript
// app/users/create/page.tsx
'use client';

import { useActionState } from 'react';
import { createUser, type ActionState } from '@/actions/user';

export default function CreateUserPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createUser,
    {} // Initial state
  );

  return (
    <form action={formAction}>
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          aria-invalid={!!state.errors?.name}
        />
        {state.errors?.name && (
          <p className="error">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={!!state.errors?.email}
        />
        {state.errors?.email && (
          <p className="error">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <select id="role" name="role" required>
          <option value="">Select role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

## Step 6: Handle Pending/Error States

Add optimistic updates and proper loading indicators.

```typescript
'use client';

import { useActionState, useOptimistic } from 'react';

type User = { id: string; name: string; status: 'active' | 'pending' };

export function UserList({ users }: { users: User[] }) {
  const [optimisticUsers, addOptimisticUser] = useOptimistic(
    users,
    (state, newUser: User) => [...state, { ...newUser, status: 'pending' as const }]
  );

  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      // Add optimistic user before server responds
      addOptimisticUser({
        id: 'temp-' + Date.now(),
        name: formData.get('name') as string,
        status: 'pending',
      });

      return createUser(prev, formData);
    },
    {}
  );

  return (
    <div>
      <ul>
        {optimisticUsers.map((user) => (
          <li
            key={user.id}
            className={user.status === 'pending' ? 'opacity-50' : ''}
          >
            {user.name}
            {user.status === 'pending' && <span> (saving...)</span>}
          </li>
        ))}
      </ul>

      <form action={formAction}>
        <input name="name" type="text" required />
        <button type="submit" disabled={isPending}>
          Add User
        </button>
      </form>
    </div>
  );
}
```

## Step 7: Verify

- [ ] Server action file has 'use server' directive
- [ ] Validation returns field-level errors
- [ ] Mutation handles success and error cases
- [ ] Revalidation refreshes cached data
- [ ] Client form uses useActionState
- [ ] Pending state disables submit
- [ ] Errors display correctly

</process>

<anti_patterns>

Avoid:

- Putting 'use server' inside functions - must be at file top or function level
- Not validating input - server actions are public endpoints
- Exposing sensitive data in action state - state is serialized to client
- Forgetting error handling - unhandled errors crash the action
- Using redirect after returning state - redirect throws, won't reach return

```typescript
// Bad: redirect after return statement
return { success: true };
redirect('/users'); // Never executes

// Good: redirect instead of return
if (success) {
  redirect('/users');
}
return { success: false, message: 'Failed' };
```

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Server action validates input with Zod
- [ ] Action returns typed state with errors
- [ ] Mutation updates database correctly
- [ ] Revalidation refreshes UI after mutation
- [ ] Client form handles all states (idle, pending, success, error)
- [ ] Optimistic updates work (if implemented)
- [ ] No TypeScript errors

</success_criteria>

<cross_references>

- **add-form.md** - For detailed form patterns
- **typescript-dev skill** - For Zod schema patterns
- **debugging skill** - If server action isn't executing

</cross_references>
