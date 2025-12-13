# Form Validation with React Hook Form + Zod

Complete patterns for type-safe form validation using React Hook Form with Zod resolver.

## Basic Form Setup

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type FormData = z.infer<typeof FormSchema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema)
  });

  const onSubmit = async (data: FormData) => {
    // data is fully validated and typed
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

## Complex Form with Nested Fields

```typescript
const AddressSchema = z.object({
  street: z.string().min(1, "Street required"),
  city: z.string().min(1, "City required"),
  state: z.string().length(2, "State must be 2 characters"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code")
});

const ProfileFormSchema = z.object({
  // Basic fields
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  email: z.string().email("Invalid email address"),

  // Nested object
  address: AddressSchema,

  // Optional fields
  phone: z
    .string()
    .regex(/^\+?1?\d{10,14}$/, "Invalid phone number")
    .optional(),

  // Number field with coercion
  age: z.coerce.number().int().min(18, "Must be 18 or older").max(120),

  // Boolean
  newsletter: z.boolean().default(false),

  // Select/enum
  role: z.enum(["user", "admin", "moderator"])
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;

function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      newsletter: false,
      role: "user"
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First Name" />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input {...register("lastName")} placeholder="Last Name" />
      {errors.lastName && <span>{errors.lastName.message}</span>}

      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("address.street")} placeholder="Street" />
      {errors.address?.street && <span>{errors.address.street.message}</span>}

      <input {...register("address.city")} placeholder="City" />
      {errors.address?.city && <span>{errors.address.city.message}</span>}

      <input {...register("address.state")} placeholder="State" maxLength={2} />
      {errors.address?.state && <span>{errors.address.state.message}</span>}

      <input {...register("address.zip")} placeholder="ZIP" />
      {errors.address?.zip && <span>{errors.address.zip.message}</span>}

      <input {...register("phone")} placeholder="Phone (optional)" />
      {errors.phone && <span>{errors.phone.message}</span>}

      <input {...register("age")} type="number" placeholder="Age" />
      {errors.age && <span>{errors.age.message}</span>}

      <label>
        <input {...register("newsletter")} type="checkbox" />
        Subscribe to newsletter
      </label>

      <select {...register("role")}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
      </select>
      {errors.role && <span>{errors.role.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Password Confirmation

```typescript
const PasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"] // Error shows on confirmPassword field
  });

type PasswordFormData = z.infer<typeof PasswordFormSchema>;

function PasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordFormSchema)
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <div>
        <input {...register("password")} type="password" placeholder="Password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <div>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      <button type="submit">Set Password</button>
    </form>
  );
}
```

## Dynamic Arrays (FieldArray)

```typescript
import { useForm, useFieldArray } from "react-hook-form";

const TodoSchema = z.object({
  text: z.string().min(1, "Todo text required"),
  completed: z.boolean().default(false)
});

const TodoListSchema = z.object({
  todos: z
    .array(TodoSchema)
    .min(1, "At least one todo required")
    .max(10, "Maximum 10 todos allowed")
});

type TodoListData = z.infer<typeof TodoListSchema>;

function TodoListForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TodoListData>({
    resolver: zodResolver(TodoListSchema),
    defaultValues: {
      todos: [{ text: "", completed: false }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "todos"
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`todos.${index}.text`)}
            placeholder={`Todo ${index + 1}`}
          />
          {errors.todos?.[index]?.text && (
            <span>{errors.todos[index]?.text?.message}</span>
          )}

          <label>
            <input {...register(`todos.${index}.completed`)} type="checkbox" />
            Completed
          </label>

          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      {errors.todos?.root && <span>{errors.todos.root.message}</span>}

      <button
        type="button"
        onClick={() => append({ text: "", completed: false })}
      >
        Add Todo
      </button>

      <button type="submit">Save All</button>
    </form>
  );
}
```

## Async Validation

```typescript
const SignupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .refine(
      async (username) => {
        // Check if username is available
        const response = await fetch(`/api/users/check?username=${username}`);
        const { available } = await response.json();
        return available;
      },
      { message: "Username already taken" }
    ),
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      async (email) => {
        const response = await fetch(`/api/users/check?email=${email}`);
        const { available } = await response.json();
        return available;
      },
      { message: "Email already registered" }
    )
});

type SignupData = z.infer<typeof SignupSchema>;

function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValidating }
  } = useForm<SignupData>({
    resolver: zodResolver(SignupSchema),
    mode: "onBlur" // Validate on blur to avoid excessive API calls
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <div>
        <input {...register("username")} placeholder="Username" />
        {errors.username && <span>{errors.username.message}</span>}
      </div>

      <div>
        <input {...register("email")} type="email" placeholder="Email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      {isValidating && <span>Validating...</span>}

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

## Conditional Fields

```typescript
const PaymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardNumber: z.string().regex(/^\d{16}$/, "Invalid card number"),
    cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
    expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Invalid expiry (MM/YY)")
  }),
  z.object({
    method: z.literal("paypal"),
    email: z.string().email("Invalid PayPal email")
  }),
  z.object({
    method: z.literal("bank"),
    accountNumber: z.string().min(8, "Invalid account number"),
    routingNumber: z.string().regex(/^\d{9}$/, "Invalid routing number")
  })
]);

type PaymentData = z.infer<typeof PaymentSchema>;

function PaymentForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PaymentData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      method: "card"
    }
  });

  const method = watch("method");

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <select {...register("method")}>
        <option value="card">Credit Card</option>
        <option value="paypal">PayPal</option>
        <option value="bank">Bank Transfer</option>
      </select>

      {method === "card" && (
        <>
          <input {...register("cardNumber")} placeholder="Card Number" />
          {errors.cardNumber && <span>{errors.cardNumber.message}</span>}

          <input {...register("cvv")} placeholder="CVV" />
          {errors.cvv && <span>{errors.cvv.message}</span>}

          <input {...register("expiryDate")} placeholder="MM/YY" />
          {errors.expiryDate && <span>{errors.expiryDate.message}</span>}
        </>
      )}

      {method === "paypal" && (
        <>
          <input {...register("email")} type="email" placeholder="PayPal Email" />
          {errors.email && <span>{errors.email.message}</span>}
        </>
      )}

      {method === "bank" && (
        <>
          <input {...register("accountNumber")} placeholder="Account Number" />
          {errors.accountNumber && <span>{errors.accountNumber.message}</span>}

          <input {...register("routingNumber")} placeholder="Routing Number" />
          {errors.routingNumber && <span>{errors.routingNumber.message}</span>}
        </>
      )}

      <button type="submit">Submit Payment</button>
    </form>
  );
}
```

## File Upload Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const FileUploadSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Please select a file")
    .transform((files) => files[0])
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    )
});

type FileUploadData = z.infer<typeof FileUploadSchema>;

function AvatarUploadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FileUploadData>({
    resolver: zodResolver(FileUploadSchema)
  });

  const onSubmit = async (data: FileUploadData) => {
    const formData = new FormData();
    formData.append("avatar", data.avatar);

    await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("avatar")} type="file" accept="image/*" />
      {errors.avatar && <span>{errors.avatar.message}</span>}

      <button type="submit">Upload</button>
    </form>
  );
}
```

## Multi-Step Form

```typescript
// Step 1: Personal Info
const PersonalInfoSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email()
});

// Step 2: Account Info
const AccountInfoSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Step 3: Preferences
const PreferencesSchema = z.object({
  newsletter: z.boolean(),
  theme: z.enum(["light", "dark"])
});

// Combined schema for final submission
const FullSignupSchema = PersonalInfoSchema.merge(AccountInfoSchema).merge(
  PreferencesSchema
);

type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
type AccountInfo = z.infer<typeof AccountInfoSchema>;
type Preferences = z.infer<typeof PreferencesSchema>;
type FullSignup = z.infer<typeof FullSignupSchema>;

function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FullSignup>>({});

  const schema =
    step === 1
      ? PersonalInfoSchema
      : step === 2
      ? AccountInfoSchema
      : PreferencesSchema;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: formData
  });

  const onSubmit = (data: any) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final validation with full schema
      const result = FullSignupSchema.safeParse(updatedData);
      if (result.success) {
        console.log("Final submission:", result.data);
      }
    }
  };

  return (
    <div>
      <div>Step {step} of 3</div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <>
            <input {...register("firstName")} placeholder="First Name" />
            {errors.firstName && <span>{errors.firstName.message}</span>}

            <input {...register("lastName")} placeholder="Last Name" />
            {errors.lastName && <span>{errors.lastName.message}</span>}

            <input {...register("email")} type="email" placeholder="Email" />
            {errors.email && <span>{errors.email.message}</span>}
          </>
        )}

        {step === 2 && (
          <>
            <input {...register("username")} placeholder="Username" />
            {errors.username && <span>{errors.username.message}</span>}

            <input {...register("password")} type="password" placeholder="Password" />
            {errors.password && <span>{errors.password.message}</span>}

            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
          </>
        )}

        {step === 3 && (
          <>
            <label>
              <input {...register("newsletter")} type="checkbox" />
              Subscribe to newsletter
            </label>

            <select {...register("theme")}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </>
        )}

        <div>
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button type="submit">{step === 3 ? "Submit" : "Next"}</button>
        </div>
      </form>
    </div>
  );
}
```

## Error Display Component

```typescript
import type { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label>
        {label}
        {children}
      </label>
      {error && (
        <span className="error" role="alert">
          {error.message}
        </span>
      )}
    </div>
  );
}

// Usage
function Form() {
  const {
    register,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema)
  });

  return (
    <form>
      <FormField label="Email" error={errors.email}>
        <input {...register("email")} type="email" />
      </FormField>

      <FormField label="Password" error={errors.password}>
        <input {...register("password")} type="password" />
      </FormField>
    </form>
  );
}
```
