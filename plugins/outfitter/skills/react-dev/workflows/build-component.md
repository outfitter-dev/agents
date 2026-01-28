# Workflow: Build Component

Create a properly typed React component with correct props, ref handling, and children typing.

<required_reading>

**Read these reference files NOW:**

1. [hooks.md](../references/hooks.md) - Hook typing patterns for useState, useRef, custom hooks
2. [react-19-patterns.md](../references/react-19-patterns.md) - ref as prop pattern (no forwardRef)

</required_reading>

<prerequisites>

- React 18+ or React 19 project
- TypeScript configured with strict mode
- Understanding of component requirements

</prerequisites>

<process>

## Step 1: Define Props Type

Determine what props your component needs and extend native elements when wrapping them.

```typescript
// For custom props only
type CardProps = {
  title: string;
  children: React.ReactNode;
};

// Extending native element (preferred for wrapper components)
type ButtonProps = {
  variant: 'primary' | 'secondary';
  isLoading?: boolean;
} & React.ComponentPropsWithoutRef<'button'>;

// With ref support (React 19)
type InputProps = {
  ref?: React.Ref<HTMLInputElement>;
  label: string;
  error?: string;
} & React.ComponentPropsWithoutRef<'input'>;
```

**Key decisions:**
- Use `React.ComponentPropsWithoutRef<'element'>` to inherit native props
- Use `React.ComponentPropsWithRef<'element'>` only if you need ref in the type union
- Add `ref?: React.Ref<ElementType>` explicitly for React 19 pattern

## Step 2: Choose Component Pattern

**React 19 (preferred)** - ref as regular prop:

```typescript
function Input({ ref, label, error, ...props }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

**React 18** - forwardRef (still works in 19):

```typescript
const Input = forwardRef<HTMLInputElement, Omit<InputProps, 'ref'>>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

## Step 3: Implement Component Body

Add hooks, event handlers, and render logic with proper typing.

```typescript
function SearchInput({ ref, label, onSearch, ...props }: SearchInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine refs if needed
  const combinedRef = ref || inputRef;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <label>{label}</label>
      <input
        ref={combinedRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  );
}
```

## Step 4: Add Proper Children Typing

Choose the right children type for your use case:

```typescript
// Any renderable content
type LayoutProps = {
  children: React.ReactNode;
};

// Single React element
type TooltipProps = {
  children: React.ReactElement;
  content: string;
};

// Render prop pattern
type ListProps<T> = {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
};

// Multiple specific children
type TabsProps = {
  children: React.ReactElement<TabProps>[];
};
```

## Step 5: Export Component and Props Type

Always export both for consumers who need to extend or reference types.

```typescript
// Named exports (preferred)
export type { ButtonProps };
export { Button };

// Or combined
export type { ButtonProps, InputProps, CardProps };
export { Button, Input, Card };
```

## Step 6: Verify

- [ ] Component renders without TypeScript errors
- [ ] Props are type-checked at usage sites
- [ ] ref forwarding works (if applicable)
- [ ] Event handlers have correct types
- [ ] Children render correctly

</process>

<anti_patterns>

Avoid:

- Using `any` for event handlers - use specific event types (React.MouseEvent, React.ChangeEvent)
- Using `JSX.Element` for children - use `React.ReactNode` instead
- Forgetting `displayName` when using forwardRef (debugging becomes harder)
- Spreading props before specific props - specific props should come last to override
- Using `React.FC` - it has issues with generics and implicit children

```typescript
// Bad: props before spreads
<button {...props} disabled={isLoading} /> // disabled can be overridden

// Good: spreads before props
<button disabled={isLoading} {...props} /> // Wait, this is also wrong if you want disabled to win

// Best: be explicit about what can be overridden
<button {...props} disabled={isLoading || props.disabled} />
```

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Props type is defined with appropriate native element extension
- [ ] Component uses React 19 ref pattern (or forwardRef with displayName)
- [ ] All hooks and handlers are properly typed
- [ ] Children typing matches actual usage
- [ ] Component and props type are exported
- [ ] No TypeScript errors in component or usage

</success_criteria>

<cross_references>

- **typescript-dev skill** - For advanced type patterns like discriminated unions
- **tdd skill** - For testing component behavior

</cross_references>
