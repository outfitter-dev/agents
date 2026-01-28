# Workflow: Add Form

Add a validated form with proper typing, submission handling, error display, and loading states.

<required_reading>

**Read these reference files NOW:**

1. [react-19-patterns.md](../references/react-19-patterns.md) - useActionState for form state
2. [event-handlers.md](../references/event-handlers.md) - Form and input event typing

</required_reading>

<prerequisites>

- Zod installed for schema validation
- Understanding of form data requirements
- Decision: client-side vs server action submission

</prerequisites>

<process>

## Step 1: Define Form Schema

Create Zod schema for validation and TypeScript type inference.

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'guest']),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  notifications: z.boolean().default(false),
});

type CreateUserInput = z.infer<typeof createUserSchema>;
```

**Common validation patterns:**

```typescript
// Password with confirmation
const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Conditional fields
const contactSchema = z.discriminatedUnion('contactMethod', [
  z.object({ contactMethod: z.literal('email'), email: z.string().email() }),
  z.object({ contactMethod: z.literal('phone'), phone: z.string().min(10) }),
]);
```

## Step 2: Create Form Component Structure

Set up form with proper field naming and structure.

```typescript
type FormState = {
  success?: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

function CreateUserForm() {
  const [state, setState] = useState<FormState>({});
  const [isPending, setIsPending] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      {/* Fields go here */}
    </form>
  );
}
```

## Step 3: Handle Submission

Choose between client-side and server action approaches.

**Client-side submission:**

```typescript
function CreateUserForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [state, setState] = useState<FormState>({});
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({});

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData);

    // Validate
    const result = createUserSchema.safeParse({
      ...rawData,
      notifications: formData.get('notifications') === 'on',
    });

    if (!result.success) {
      setState({
        errors: result.error.flatten().fieldErrors,
      });
      setIsPending(false);
      return;
    }

    // Submit
    try {
      const user = await createUser(result.data);
      setState({ success: true, message: 'User created!' });
      onSuccess(user);
    } catch (error) {
      setState({
        message: error instanceof Error ? error.message : 'Failed to create user'
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

**React 19 with useActionState:**

```typescript
'use client';

import { useActionState } from 'react';
import { createUserAction } from '@/actions/user';

function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    {} as FormState
  );

  return (
    <form action={formAction}>
      {/* Fields use name attribute, no onChange needed */}
    </form>
  );
}
```

## Step 4: Display Validation Errors

Show field-level and form-level errors.

```typescript
function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, {});

  return (
    <form action={formAction}>
      {/* Form-level message */}
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}

      {/* Field with error */}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          aria-invalid={!!state.errors?.name}
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" className="error">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={!!state.errors?.email}
          aria-describedby={state.errors?.email ? 'email-error' : undefined}
        />
        {state.errors?.email && (
          <p id="email-error" className="error">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="role">Role</label>
        <select id="role" name="role" required>
          <option value="">Select a role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
        {state.errors?.role && (
          <p className="error">{state.errors.role[0]}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

## Step 5: Show Loading State

Disable form and show progress during submission.

```typescript
<form action={formAction}>
  <fieldset disabled={isPending}>
    {/* All fields disabled during submission */}
    <input name="name" type="text" />
    <input name="email" type="email" />

    <button type="submit">
      {isPending ? (
        <>
          <Spinner aria-hidden />
          Creating...
        </>
      ) : (
        'Create User'
      )}
    </button>
  </fieldset>
</form>
```

## Step 6: Handle Success/Error

Reset form on success, preserve values on error.

```typescript
function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await createUserAction(prev, formData);

      // Reset form on success
      if (result.success) {
        formRef.current?.reset();
      }

      return result;
    },
    {}
  );

  return (
    <form ref={formRef} action={formAction}>
      {state.success && (
        <div className="success" role="alert">
          User created successfully!
        </div>
      )}
      {/* ... */}
    </form>
  );
}
```

## Step 7: Verify

- [ ] Schema validates all fields correctly
- [ ] Form submits without errors
- [ ] Validation errors display per-field
- [ ] Loading state shows during submission
- [ ] Success message appears after submit
- [ ] Form resets on success (if desired)

</process>

<anti_patterns>

Avoid:

- Using controlled inputs for every field - uncontrolled with FormData is simpler
- Not disabling submit during pending - allows double submission
- Showing only first error - users have to fix one at a time
- Not using aria attributes - accessibility suffers
- Validating only on submit - consider real-time validation for complex fields

```typescript
// Bad: no error association
{errors.name && <p>{errors.name}</p>}

// Good: accessible error
<input
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? 'name-error' : undefined}
/>
{errors.name && <p id="name-error" role="alert">{errors.name}</p>}
```

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Zod schema validates all fields
- [ ] Form component handles submission
- [ ] Field-level errors display correctly
- [ ] Loading state disables form
- [ ] Success/error messages show
- [ ] Form is accessible (aria attributes)
- [ ] No TypeScript errors

</success_criteria>

<cross_references>

- **typescript-dev skill** - For advanced Zod patterns (refinements, transforms)
- **tdd skill** - For testing form behavior
- **add-server-action.md** - If using React 19 server actions

</cross_references>
