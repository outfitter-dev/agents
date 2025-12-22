# Example: State Machine with Discriminated Unions

Demonstrates using discriminated unions to model complex state machines, making illegal states unrepresentable at compile time.

## The Problem

State machines with loose typing allow nonsensical states:

```typescript
// ❌ Illegal states possible
type FormState = {
  status: 'idle' | 'validating' | 'submitting' | 'success' | 'error';
  data?: FormData;
  validationErrors?: ValidationError[];
  submitError?: string;
  submittedId?: string;
};

// This compiles but makes no sense:
const bad: FormState = {
  status: 'idle',
  validationErrors: [...], // Errors while idle?
  submittedId: '123'       // ID before submission?
};
```

## Solution: Discriminated Union

```typescript
// ✅ Only valid states possible
type FormState =
  | { readonly status: 'idle' }
  | { readonly status: 'validating'; readonly data: FormData }
  | { readonly status: 'validation-error'; readonly errors: readonly ValidationError[] }
  | { readonly status: 'submitting'; readonly data: FormData }
  | { readonly status: 'success'; readonly id: string; readonly data: FormData }
  | { readonly status: 'submit-error'; readonly error: string; readonly data: FormData };
```

## Full Example: Multi-Step Form

```typescript
// types.ts - Form domain types
type FormData = {
  readonly step1: Step1Data | null;
  readonly step2: Step2Data | null;
  readonly step3: Step3Data | null;
};

type Step1Data = {
  readonly name: string;
  readonly email: string;
};

type Step2Data = {
  readonly address: string;
  readonly city: string;
  readonly zipCode: string;
};

type Step3Data = {
  readonly paymentMethod: 'card' | 'paypal';
  readonly agreeToTerms: boolean;
};

type ValidationError = {
  readonly field: string;
  readonly message: string;
};

// State machine with all valid states
type FormState =
  // Initial state
  | {
      readonly status: 'editing';
      readonly currentStep: 1 | 2 | 3;
      readonly data: FormData;
    }
  // Validating current step
  | {
      readonly status: 'validating';
      readonly currentStep: 1 | 2 | 3;
      readonly data: FormData;
    }
  // Validation failed
  | {
      readonly status: 'validation-error';
      readonly currentStep: 1 | 2 | 3;
      readonly data: FormData;
      readonly errors: readonly ValidationError[];
    }
  // Final submission in progress
  | {
      readonly status: 'submitting';
      readonly data: FormData;
    }
  // Successfully submitted
  | {
      readonly status: 'success';
      readonly id: string;
      readonly data: FormData;
    }
  // Submission failed
  | {
      readonly status: 'submit-error';
      readonly error: string;
      readonly data: FormData;
    };

// State transitions - each returns new state
type FormAction =
  | { type: 'edit-step-1'; data: Partial<Step1Data> }
  | { type: 'edit-step-2'; data: Partial<Step2Data> }
  | { type: 'edit-step-3'; data: Partial<Step3Data> }
  | { type: 'next-step' }
  | { type: 'previous-step' }
  | { type: 'validation-started' }
  | { type: 'validation-success' }
  | { type: 'validation-failed'; errors: readonly ValidationError[] }
  | { type: 'submit-started' }
  | { type: 'submit-success'; id: string }
  | { type: 'submit-failed'; error: string }
  | { type: 'reset' };

// Reducer with exhaustive pattern matching
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'edit-step-1':
      // Can only edit when in editing or validation-error state
      if (state.status === 'editing' || state.status === 'validation-error') {
        return {
          status: 'editing',
          currentStep: 1,
          data: {
            ...state.data,
            step1: state.data.step1
              ? { ...state.data.step1, ...action.data }
              : { name: '', email: '', ...action.data }
          }
        };
      }
      return state;

    case 'edit-step-2':
      if (state.status === 'editing' || state.status === 'validation-error') {
        return {
          status: 'editing',
          currentStep: 2,
          data: {
            ...state.data,
            step2: state.data.step2
              ? { ...state.data.step2, ...action.data }
              : { address: '', city: '', zipCode: '', ...action.data }
          }
        };
      }
      return state;

    case 'edit-step-3':
      if (state.status === 'editing' || state.status === 'validation-error') {
        return {
          status: 'editing',
          currentStep: 3,
          data: {
            ...state.data,
            step3: state.data.step3
              ? { ...state.data.step3, ...action.data }
              : { paymentMethod: 'card', agreeToTerms: false, ...action.data }
          }
        };
      }
      return state;

    case 'next-step':
      if (state.status === 'editing' && state.currentStep < 3) {
        return {
          ...state,
          currentStep: (state.currentStep + 1) as 2 | 3
        };
      }
      return state;

    case 'previous-step':
      if ((state.status === 'editing' || state.status === 'validation-error') && state.currentStep > 1) {
        return {
          status: 'editing',
          currentStep: (state.currentStep - 1) as 1 | 2,
          data: state.data
        };
      }
      return state;

    case 'validation-started':
      if (state.status === 'editing') {
        return {
          status: 'validating',
          currentStep: state.currentStep,
          data: state.data
        };
      }
      return state;

    case 'validation-success':
      if (state.status === 'validating') {
        // If on last step, go to submitting, otherwise editing next step
        if (state.currentStep === 3) {
          return {
            status: 'submitting',
            data: state.data
          };
        }
        return {
          status: 'editing',
          currentStep: (state.currentStep + 1) as 2 | 3,
          data: state.data
        };
      }
      return state;

    case 'validation-failed':
      if (state.status === 'validating') {
        return {
          status: 'validation-error',
          currentStep: state.currentStep,
          data: state.data,
          errors: action.errors
        };
      }
      return state;

    case 'submit-started':
      if (state.status === 'editing' && state.currentStep === 3) {
        return {
          status: 'submitting',
          data: state.data
        };
      }
      return state;

    case 'submit-success':
      if (state.status === 'submitting') {
        return {
          status: 'success',
          id: action.id,
          data: state.data
        };
      }
      return state;

    case 'submit-failed':
      if (state.status === 'submitting') {
        return {
          status: 'submit-error',
          error: action.error,
          data: state.data
        };
      }
      return state;

    case 'reset':
      return initialState;

    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

// Initial state
const initialState: FormState = {
  status: 'editing',
  currentStep: 1,
  data: {
    step1: null,
    step2: null,
    step3: null
  }
};

// Validation logic
function validateStep1(data: Step1Data | null): readonly ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data) {
    return [{ field: 'step1', message: 'Step 1 data required' }];
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!data.email || !data.email.includes('@')) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  return errors;
}

function validateStep2(data: Step2Data | null): readonly ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data) {
    return [{ field: 'step2', message: 'Step 2 data required' }];
  }

  if (!data.address || data.address.trim().length === 0) {
    errors.push({ field: 'address', message: 'Address is required' });
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!data.zipCode || !/^\d{5}$/.test(data.zipCode)) {
    errors.push({ field: 'zipCode', message: 'Valid 5-digit zip code required' });
  }

  return errors;
}

function validateStep3(data: Step3Data | null): readonly ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data) {
    return [{ field: 'step3', message: 'Step 3 data required' }];
  }

  if (!data.agreeToTerms) {
    errors.push({ field: 'agreeToTerms', message: 'Must agree to terms' });
  }

  return errors;
}

// React component
function MultiStepForm() {
  const [state, dispatch] = React.useReducer(formReducer, initialState);

  const handleNext = async () => {
    dispatch({ type: 'validation-started' });

    // Validate current step
    let errors: readonly ValidationError[] = [];
    switch (state.currentStep) {
      case 1:
        errors = validateStep1(state.data.step1);
        break;
      case 2:
        errors = validateStep2(state.data.step2);
        break;
      case 3:
        errors = validateStep3(state.data.step3);
        break;
    }

    if (errors.length > 0) {
      dispatch({ type: 'validation-failed', errors });
    } else {
      dispatch({ type: 'validation-success' });
    }
  };

  // Submit form
  React.useEffect(() => {
    if (state.status === 'submitting') {
      submitForm(state.data)
        .then(id => dispatch({ type: 'submit-success', id }))
        .catch(error => dispatch({
          type: 'submit-failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
    }
  }, [state.status]);

  // Render based on state
  switch (state.status) {
    case 'editing':
    case 'validating':
    case 'validation-error':
      return (
        <div>
          {state.status === 'validation-error' && (
            <ErrorList errors={state.errors} />
          )}

          {state.currentStep === 1 && (
            <Step1Form
              data={state.data.step1}
              onChange={data => dispatch({ type: 'edit-step-1', data })}
              disabled={state.status === 'validating'}
            />
          )}

          {state.currentStep === 2 && (
            <Step2Form
              data={state.data.step2}
              onChange={data => dispatch({ type: 'edit-step-2', data })}
              disabled={state.status === 'validating'}
            />
          )}

          {state.currentStep === 3 && (
            <Step3Form
              data={state.data.step3}
              onChange={data => dispatch({ type: 'edit-step-3', data })}
              disabled={state.status === 'validating'}
            />
          )}

          <div>
            {state.currentStep > 1 && (
              <button
                onClick={() => dispatch({ type: 'previous-step' })}
                disabled={state.status === 'validating'}
              >
                Previous
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={state.status === 'validating'}
            >
              {state.status === 'validating' ? 'Validating...' : 'Next'}
            </button>
          </div>
        </div>
      );

    case 'submitting':
      return <div>Submitting form...</div>;

    case 'success':
      return (
        <div>
          <h2>Success!</h2>
          <p>Form submitted with ID: {state.id}</p>
        </div>
      );

    case 'submit-error':
      return (
        <div>
          <h2>Submission failed</h2>
          <p>{state.error}</p>
          <button onClick={() => dispatch({ type: 'reset' })}>
            Try Again
          </button>
        </div>
      );

    default:
      return assertNever(state);
  }
}

// Helper to submit form
async function submitForm(data: FormData): Promise<string> {
  const response = await fetch('/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.id;
}
```

## State Diagram

```
┌─────────┐
│  Idle   │
└────┬────┘
     │
     ▼
┌──────────────┐
│   Editing    │◄──────────────┐
│  (Step 1-3)  │               │
└──────┬───────┘               │
       │                       │
       │ Next                  │
       ▼                       │
┌──────────────┐               │
│  Validating  │               │
└──────┬───────┘               │
       │                       │
       ├─── Errors ────────────┘
       │
       │ Success (step < 3) ───┐
       │                       │
       │ Success (step 3)      │
       ▼                       ▼
┌──────────────┐         ┌─────────┐
│  Submitting  │         │ Editing │
└──────┬───────┘         │ (next)  │
       │                 └─────────┘
       ├─── Error ─────┐
       │               ▼
       │          ┌────────────┐
       │          │Submit Error│
       │          └────────────┘
       ▼
   ┌─────────┐
   │ Success │
   └─────────┘
```

## Benefits

1. **Impossible states prevented**: Can't have validation errors in idle state
2. **Exhaustive handling**: TypeScript ensures all states handled
3. **Self-documenting**: State machine visible in type definition
4. **Refactor-safe**: Adding state forces updating all switch statements
5. **Testable**: Pure reducer, easy to test state transitions

## Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('formReducer', () => {
  it('starts in editing state at step 1', () => {
    const state = initialState;
    expect(state.status).toBe('editing');
    expect(state.currentStep).toBe(1);
  });

  it('transitions to validating when next clicked', () => {
    const state = formReducer(initialState, { type: 'validation-started' });
    expect(state.status).toBe('validating');
  });

  it('transitions to validation-error on failed validation', () => {
    const validating: FormState = {
      status: 'validating',
      currentStep: 1,
      data: initialState.data
    };

    const errors = [{ field: 'name', message: 'Required' }];
    const state = formReducer(validating, {
      type: 'validation-failed',
      errors
    });

    expect(state.status).toBe('validation-error');
    if (state.status === 'validation-error') {
      expect(state.errors).toEqual(errors);
    }
  });

  it('transitions to submitting on step 3 validation success', () => {
    const validating: FormState = {
      status: 'validating',
      currentStep: 3,
      data: {
        step1: { name: 'Test', email: 'test@example.com' },
        step2: { address: '123 Main', city: 'City', zipCode: '12345' },
        step3: { paymentMethod: 'card', agreeToTerms: true }
      }
    };

    const state = formReducer(validating, { type: 'validation-success' });
    expect(state.status).toBe('submitting');
  });

  it('transitions to success on successful submit', () => {
    const submitting: FormState = {
      status: 'submitting',
      data: initialState.data
    };

    const state = formReducer(submitting, {
      type: 'submit-success',
      id: 'form-123'
    });

    expect(state.status).toBe('success');
    if (state.status === 'success') {
      expect(state.id).toBe('form-123');
    }
  });
});
```

## Key Patterns

1. **Discriminated union**: `status` field discriminates state variants
2. **Readonly**: All state is immutable
3. **Exhaustive matching**: `assertNever` catches unhandled states
4. **Type narrowing**: TypeScript narrows in each switch case
5. **Pure reducer**: No side effects, easy to test and reason about
