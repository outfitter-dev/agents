# Workflow: Write Component Tests

Write tests for React components covering rendering, user interactions, async behavior, and accessibility.

<required_reading>

**Read these reference files NOW:**

1. [hooks.md](../references/hooks.md) - Hook patterns you may need to test
2. [event-handlers.md](../references/event-handlers.md) - Event patterns to verify

</required_reading>

<prerequisites>

- Testing library installed (@testing-library/react)
- Test runner configured (vitest, jest, bun:test)
- Component to test exists
- Understanding of component's expected behavior

</prerequisites>

<process>

## Step 1: Create Test File

Set up the test file with proper imports and structure.

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest'; // or 'bun:test'
import { Button } from './Button';

describe('Button', () => {
  // Tests go here
});
```

**File naming conventions:**
- `Component.test.tsx` - Co-located with component
- `__tests__/Component.test.tsx` - Tests directory

## Step 2: Set Up Testing Library

Configure testing utilities and custom render if needed.

```typescript
// test-utils.tsx
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';

// Custom render with providers
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>
        {children}
      </ThemeProvider>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };
```

```typescript
// In your test
import { render, screen } from './test-utils';

it('renders with theme', () => {
  render(<ThemedButton />);
  // ThemeProvider is automatically wrapped
});
```

## Step 3: Test Rendering

Verify component renders correctly with various props.

```typescript
describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    render(<Button variant="primary">Primary</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders loading state', () => {
    render(<Button isLoading>Submit</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

**Query priorities (prefer in this order):**
1. `getByRole` - Accessible queries
2. `getByLabelText` - Form fields
3. `getByPlaceholderText` - Inputs without labels
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

## Step 4: Test User Interactions

Verify component responds to user actions.

```typescript
describe('Button interactions', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick} disabled>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('Form interactions', () => {
  it('handles text input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input label="Name" onChange={handleChange} />);

    await user.type(screen.getByLabelText('Name'), 'John');

    expect(handleChange).toHaveBeenCalled();
    expect(screen.getByLabelText('Name')).toHaveValue('John');
  });

  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <Form onSubmit={handleSubmit}>
        <Input name="email" label="Email" />
        <Button type="submit">Submit</Button>
      </Form>
    );

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
      })
    );
  });
});
```

**userEvent vs fireEvent:**
- `userEvent` - Simulates real user behavior (preferred)
- `fireEvent` - Direct event dispatch (faster, less realistic)

## Step 5: Test Async Behavior

Handle loading states, data fetching, and async updates.

```typescript
import { render, screen, waitFor } from '@testing-library/react';

describe('UserProfile', () => {
  it('shows loading state initially', () => {
    render(<UserProfile userId="123" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows user data after loading', async () => {
    render(<UserProfile userId="123" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows error state on failure', async () => {
    // Mock API to fail
    vi.mocked(fetchUser).mockRejectedValue(new Error('Not found'));

    render(<UserProfile userId="invalid" />);

    await waitFor(() => {
      expect(screen.getByText('Error: Not found')).toBeInTheDocument();
    });
  });
});

describe('Form submission', () => {
  it('shows pending state during submit', async () => {
    const user = userEvent.setup();

    // Mock slow API
    vi.mocked(submitForm).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    // Check pending state
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
    });
  });
});
```

**Async utilities:**
- `waitFor` - Wait for condition to be true
- `findBy*` - Combined getBy + waitFor
- `waitForElementToBeRemoved` - Wait for element to disappear

## Step 6: Test Edge Cases and Accessibility

```typescript
describe('Accessibility', () => {
  it('has accessible name', () => {
    render(<Button aria-label="Close dialog">X</Button>);

    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('associates label with input', () => {
    render(<Input id="email" label="Email address" />);

    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('id', 'email');
  });

  it('announces errors to screen readers', () => {
    render(<Input label="Email" error="Invalid email" />);

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Invalid email');
  });
});

describe('Edge cases', () => {
  it('handles empty state', () => {
    render(<UserList users={[]} />);

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('handles undefined props gracefully', () => {
    render(<UserCard user={undefined} />);

    expect(screen.getByText('Unknown user')).toBeInTheDocument();
  });

  it('truncates long text', () => {
    const longText = 'A'.repeat(200);
    render(<Card title={longText} />);

    const title = screen.getByRole('heading');
    expect(title.textContent?.length).toBeLessThan(100);
  });
});
```

## Step 7: Run and Verify Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test Button.test.tsx

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

**Verify:**
- [ ] All tests pass
- [ ] Tests cover happy path
- [ ] Tests cover error states
- [ ] Tests cover loading states
- [ ] Tests verify accessibility
- [ ] No flaky tests

</process>

<anti_patterns>

Avoid:

- Testing implementation details - test behavior, not internals
- Using test IDs everywhere - prefer accessible queries
- Not using userEvent - fireEvent is less realistic
- Forgetting cleanup - testing-library auto-cleans, but verify
- Too many assertions per test - one concept per test

```typescript
// Bad: Testing implementation
expect(component.state.isOpen).toBe(true);

// Good: Testing behavior
expect(screen.getByRole('dialog')).toBeVisible();


// Bad: Implementation-coupled query
screen.getByTestId('submit-button');

// Good: Accessible query
screen.getByRole('button', { name: 'Submit' });


// Bad: fireEvent (not realistic)
fireEvent.click(button);

// Good: userEvent (simulates real user)
await user.click(button);
```

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Test file created with proper structure
- [ ] Rendering tests verify correct output
- [ ] Interaction tests verify user behavior
- [ ] Async tests handle loading/error states
- [ ] Accessibility tests verify a11y
- [ ] All tests pass
- [ ] Coverage meets target (aim for 80%+)

</success_criteria>

<cross_references>

- **tdd skill** - For Red-Green-Refactor methodology
- **debugging skill** - When tests fail unexpectedly

</cross_references>
