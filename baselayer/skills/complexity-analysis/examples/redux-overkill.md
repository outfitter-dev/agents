# Example: Challenging Redux for Simple Form

## Scenario

User proposes using Redux + Redux Saga for managing a 3-field contact form (name, email, message).

## Challenge Session

### IDENTIFY: Framework Overkill

**Proposal**: "I want to set up Redux with Redux Saga to manage the contact form state. We'll need actions for field updates, form submission, validation errors, and API status."

**Complexity Smell Detected**: Framework Overkill
- Redux + Saga = ~50 LOC boilerplate for 3 fields
- Time-travel debugging not needed for contact form
- No complex async orchestration required
- Single form, no shared state across components

**Escalation Level**: ◆ Caution

### ALTERNATIVE: Propose Simpler Solutions

**Response**:
> ◆ **Caution**: Redux + Saga adds significant complexity for this use case. This pattern is typically used for complex apps with shared state across many components. For a single contact form, this will likely cause maintenance burden without clear benefits.
>
> Here are simpler alternatives that meet the requirements:

**Option 1: React useState (Recommended)**

```typescript
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await submitContact(form)
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.name}
        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
      />
      {/* email, message fields ... */}
      <button disabled={status === 'loading'}>Submit</button>
    </form>
  )
}
```

**Option 2: React Hook Form (If validation is complex)**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function ContactForm() {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data) => {
    await submitContact(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... */}
    </form>
  )
}
```

**Comparison**:

| Approach | LOC | Dependencies | Learning Curve | Maintenance |
|----------|-----|--------------|----------------|-------------|
| Redux + Saga | ~150 | 2 libraries | High | High |
| useState | ~30 | 0 | Low | Low |
| React Hook Form | ~40 | 1 library | Medium | Low |

### QUESTION: Investigate Constraints

**Questions to ask**:
1. "Will this form state need to be shared across multiple components or pages?"
2. "Do you need time-travel debugging or state persistence for this form?"
3. "Is there complex async orchestration (dependent requests, polling, retry logic)?"
4. "Will the form scale to 20+ fields with complex validation rules?"
5. "Does the team have existing Redux infrastructure this would integrate with?"

### Likely Answers & Responses

**If "We might add more forms later"**:
> "Let's start with useState for this form. When we add the second form, we'll have concrete requirements and can decide if shared state management is needed. Adding Redux later is straightforward if justified."

**If "I want to learn Redux"**:
> "Learning Redux is valuable, but production code isn't the ideal learning environment. Consider building a Redux tutorial app separately, then apply it to work projects when requirements justify it. For this contact form, simpler patterns will ship faster and be easier to maintain."

**If "We need the form data in the header component"**:
> "If you need to lift state, you can pass it through props or use React Context. Here's how:
>
> ```typescript
> const FormContext = createContext()
>
> function App() {
>   const [contactData, setContactData] = useState(null)
>   return (
>     <FormContext.Provider value={{ contactData, setContactData }}>
>       <Header />
>       <ContactForm />
>     </FormContext.Provider>
>   )
> }
> ```
>
> This still avoids Redux boilerplate while enabling state sharing."

### DOCUMENT: Record Decision

**If proceeding with Redux** (unlikely after questioning):

```markdown
## ADR: Redux for Contact Form

**Decision**: Use Redux + Redux Saga for contact form state management

**Context**: Contact form requires state sharing with [specific component], complex async orchestration for [specific workflow], and integration with existing Redux store managing [other domain].

**Consequences**:
- **Pros**: Consistent state management pattern across app, debugging with Redux DevTools
- **Cons**: Increased boilerplate (~150 LOC vs ~30 LOC), steeper learning curve for new contributors
- **Mitigation**: Isolate form logic in dedicated slice, document with examples

**Review**: Revisit if form remains isolated without cross-component state needs after 3 months.
```

**If proceeding with useState** (likely outcome):

```typescript
// ContactForm.tsx
// Using useState for simplicity - form state is local and doesn't need sharing.
// If requirements change (shared state, complex validation), consider React Hook Form or Zustand.

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  // ...
}
```

## Outcome

**Result**: User agrees to start with `useState`, with plan to revisit if requirements evolve.

**Time saved**: ~2 hours setup + ongoing maintenance burden avoided

**Technical debt avoided**: Unnecessary abstraction that would confuse future maintainers

## Key Lessons

1. **Framework choice should match problem scale**: Redux excels at complex state; overkill for simple forms
2. **Reversibility matters**: Starting simple → complex is easier than complex → simple
3. **Concrete alternatives convince**: Code examples beat abstract arguments
4. **Question assumptions**: "We might need it later" rarely justifies current complexity
