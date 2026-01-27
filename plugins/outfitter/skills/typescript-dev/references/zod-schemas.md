# Schema Composition

Deep dive on combining, extending, and deriving schemas with Zod.

## merge() vs extend()

Both combine schemas, but with subtle differences.

### merge()

Combines two object schemas. Both must be object schemas.

```typescript
const UserBase = z.object({
  id: z.string(),
  email: z.string().email()
});

const UserExtended = z.object({
  name: z.string(),
  age: z.number()
});

const FullUser = UserBase.merge(UserExtended);
// { id: string, email: string, name: string, age: number }

type FullUser = z.infer<typeof FullUser>;
```

**Use merge when**: combining two complete, standalone schemas.

**Properties**:
- Creates new schema (doesn't modify originals)
- Later schema wins on conflicts
- Type-safe at compile time
- Both arguments must be `ZodObject`

**Conflict resolution**:

```typescript
const Schema1 = z.object({
  name: z.string(),
  value: z.number()
});

const Schema2 = z.object({
  value: z.string(), // Different type!
  extra: z.boolean()
});

const Merged = Schema1.merge(Schema2);
// { name: string, value: string, extra: boolean }
// Schema2.value wins
```

### extend()

Sugar for merge with inline object definition.

```typescript
const UserBase = z.object({
  id: z.string(),
  email: z.string().email()
});

const FullUser = UserBase.extend({
  name: z.string(),
  age: z.number()
});
// Equivalent to UserBase.merge(z.object({ name, age }))
```

**Use extend when**: adding fields to one schema.

**When to use each**:

```typescript
// ✅ extend — adding to one schema
const User = BaseUser.extend({
  createdAt: z.date()
});

// ✅ merge — combining two existing schemas
const FullProfile = UserSchema.merge(AddressSchema);

// ❌ Awkward — creating schema just to merge
const User = BaseUser.merge(z.object({
  createdAt: z.date()
}));
```

## pick() and omit()

Create derived schemas by selecting or excluding fields.

### pick()

Select specific fields from schema.

```typescript
const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  passwordHash: z.string(),
  role: z.enum(["admin", "user"]),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Public user (only safe fields)
const PublicUser = User.pick({
  id: true,
  email: true,
  name: true,
  role: true
});
// { id, email, name, role }

// Login credentials
const Credentials = User.pick({
  email: true,
  passwordHash: true
});
// { email, passwordHash }

type PublicUser = z.infer<typeof PublicUser>;
```

**Use pick when**: selecting small subset of fields.

### omit()

Exclude specific fields from schema.

```typescript
// Everything except password
const UserWithoutPassword = User.omit({
  passwordHash: true
});
// { id, email, name, role, createdAt, updatedAt }

// Without timestamps
const UserCore = User.omit({
  createdAt: true,
  updatedAt: true
});
// { id, email, name, passwordHash, role }

type UserWithoutPassword = z.infer<typeof UserWithoutPassword>;
```

**Use omit when**: excluding small number of fields.

### pick vs omit

```typescript
// Many fields, want few → pick
const Summary = LargeSchema.pick({ id: true, name: true });

// Few fields to exclude → omit
const WithoutPassword = UserSchema.omit({ passwordHash: true });
```

### Chaining pick/omit

```typescript
const User = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  passwordHash: z.string(),
  internalNote: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// First remove internal fields, then remove password
const PublicUser = User
  .omit({ passwordHash: true, internalNote: true })
  .omit({ createdAt: true, updatedAt: true });
// { id, email, name }

// Or in one step
const PublicUser2 = User.omit({
  passwordHash: true,
  internalNote: true,
  createdAt: true,
  updatedAt: true
});
```

## partial() and required()

Control field optionality.

### partial()

Make all (or specific) fields optional.

```typescript
const User = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
});

// All fields optional
const PartialUser = User.partial();
// { id?: string, email?: string, name?: string }

// Specific fields optional
const UserWithOptionalName = User.partial({
  name: true
});
// { id: string, email: string, name?: string }

type PartialUser = z.infer<typeof PartialUser>;
```

**Common pattern: update DTOs**

```typescript
const CreateUser = z.object({
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "user"])
});

// All fields optional for updates
const UpdateUser = CreateUser.partial();

// But require at least one field
const UpdateUserNonEmpty = CreateUser.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field required for update"
);
```

### required()

Make all (or specific) fields required.

```typescript
const UserDraft = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional()
});

// All required
const User = UserDraft.required();
// { id: string, email: string, name: string }

// Specific fields required
const UserWithRequiredEmail = UserDraft.required({
  email: true
});
// { id?: string, email: string, name?: string }

type User = z.infer<typeof User>;
```

### deepPartial()

Makes nested fields optional too.

```typescript
const User = z.object({
  id: z.string(),
  profile: z.object({
    name: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string()
    })
  })
});

// Shallow partial — only top level optional
const ShallowPartial = User.partial();
// {
//   id?: string,
//   profile?: { name: string, address: { street: string, city: string } }
// }

// Deep partial — all levels optional
const DeepPartial = User.deepPartial();
// {
//   id?: string,
//   profile?: {
//     name?: string,
//     address?: {
//       street?: string,
//       city?: string
//     }
//   }
// }
```

## passthrough(), strict(), strip()

Control extra property handling.

### strip() (default)

Removes unknown properties silently.

```typescript
const User = z.object({
  id: z.string(),
  name: z.string()
});

const data = {
  id: "123",
  name: "John",
  extra: "ignored" // Will be removed
};

const user = User.parse(data);
// { id: "123", name: "John" }
// 'extra' was silently removed
```

**Use strip for**: API responses (ignore server's extra fields).

### passthrough()

Allows unknown properties through.

```typescript
const User = z.object({
  id: z.string(),
  name: z.string()
}).passthrough();

const data = {
  id: "123",
  name: "John",
  extra: "kept"
};

const user = User.parse(data);
// { id: "123", name: "John", extra: "kept" }
```

**Use passthrough for**:
- Proxying data
- Migrations (keep fields you'll validate later)
- When exact shape unknown but want to preserve data

### strict()

Throws error if unknown properties present.

```typescript
const User = z.object({
  id: z.string(),
  name: z.string()
}).strict();

const data = {
  id: "123",
  name: "John",
  extra: "error!" // Will cause validation error
};

const result = User.safeParse(data);
// {
//   success: false,
//   error: ZodError: "Unrecognized key(s) in object: 'extra'"
// }
```

**Use strict for**: API requests (catch client typos and mistakes).

### Combining with pick/omit

```typescript
const Schema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string()
});

// Pick creates new schema, resets to default strip() mode
const Picked = Schema.pick({ id: true, name: true });

// Need to reapply strict() if wanted
const StrictPicked = Schema.pick({ id: true, name: true }).strict();

// Or chain everything
const Result = Schema
  .omit({ email: true })
  .strict()
  .partial();
```

## Reusable Schema Patterns

### Base schemas with variations

```typescript
// Base entity fields
const EntityBase = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

// User entity
const UserEntity = EntityBase.extend({
  email: z.string().email(),
  name: z.string()
});

// Post entity
const PostEntity = EntityBase.extend({
  title: z.string(),
  content: z.string(),
  authorId: z.string().uuid()
});

// All entities share id, createdAt, updatedAt
```

### CRUD schema family

```typescript
const UserCore = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "user"])
});

// Create — all fields required, plus password
const CreateUser = UserCore.extend({
  password: z.string().min(8)
});

// Update — all fields optional
const UpdateUser = UserCore.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field required"
);

// Response — includes ID and timestamps, excludes password
const UserResponse = UserCore
  .extend({
    id: z.string().uuid(),
    createdAt: z.coerce.date()
  })
  .omit({ password: true });

// Summary — minimal fields
const UserSummary = UserResponse.pick({
  id: true,
  name: true
});

type CreateUser = z.infer<typeof CreateUser>;
type UpdateUser = z.infer<typeof UpdateUser>;
type UserResponse = z.infer<typeof UserResponse>;
type UserSummary = z.infer<typeof UserSummary>;
```

### Domain-specific extensions

```typescript
// Base product
const ProductBase = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive()
});

// Physical product
const PhysicalProduct = ProductBase.extend({
  type: z.literal("physical"),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number()
  })
});

// Digital product
const DigitalProduct = ProductBase.extend({
  type: z.literal("digital"),
  downloadUrl: z.string().url(),
  fileSize: z.number().positive()
});

// Service product
const ServiceProduct = ProductBase.extend({
  type: z.literal("service"),
  duration: z.number().positive(), // in minutes
  capacity: z.number().int().positive()
});

// Union of all product types
const Product = z.discriminatedUnion("type", [
  PhysicalProduct,
  DigitalProduct,
  ServiceProduct
]);

type Product = z.infer<typeof Product>;
```

### Shared validation rules

```typescript
// Reusable field validators
const EmailField = z.string().email();
const PasswordField = z.string().min(8).max(100);
const UuidField = z.string().uuid();
const SlugField = z.string().regex(/^[a-z0-9-]+$/);
const PhoneField = z.string().regex(/^\+?1?\d{10,14}$/);

// Use in multiple schemas
const UserSignup = z.object({
  email: EmailField,
  password: PasswordField
});

const UserProfile = z.object({
  id: UuidField,
  email: EmailField,
  phone: PhoneField.optional()
});

const BlogPost = z.object({
  id: UuidField,
  slug: SlugField,
  authorId: UuidField
});
```

### Branded type integration

```typescript
import type { Brand } from "./types";

type UserId = Brand<string, "UserId">;
type ProductId = Brand<string, "ProductId">;

// Schema that validates and brands
const UserIdSchema = z.string().uuid().transform((val) => val as UserId);
const ProductIdSchema = z.string().uuid().transform((val) => val as ProductId);

// Use in larger schemas
const Order = z.object({
  id: z.string().uuid(),
  userId: UserIdSchema,
  items: z.array(
    z.object({
      productId: ProductIdSchema,
      quantity: z.number().int().positive()
    })
  )
});

type Order = z.infer<typeof Order>;
// {
//   id: string;
//   userId: UserId;
//   items: { productId: ProductId; quantity: number }[];
// }
```

## Advanced Composition Patterns

### Conditional schemas

```typescript
const BaseConfig = z.object({
  mode: z.enum(["development", "production"])
});

const DevelopmentConfig = BaseConfig.extend({
  mode: z.literal("development"),
  debugLevel: z.number().int().min(0).max(5),
  hotReload: z.boolean()
});

const ProductionConfig = BaseConfig.extend({
  mode: z.literal("production"),
  cacheEnabled: z.boolean(),
  maxConnections: z.number().int().positive()
});

const Config = z.discriminatedUnion("mode", [
  DevelopmentConfig,
  ProductionConfig
]);

type Config = z.infer<typeof Config>;
```

### Schema factories

```typescript
function createPaginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0)
    })
  });
}

// Usage
const PaginatedUsers = createPaginatedSchema(UserSchema);
const PaginatedPosts = createPaginatedSchema(PostSchema);

type PaginatedUsers = z.infer<typeof PaginatedUsers>;
```

### Recursive composition

```typescript
type Category = {
  id: string;
  name: string;
  parent?: Category;
  children: Category[];
};

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    parent: CategorySchema.optional(),
    children: z.array(CategorySchema)
  })
);

// Can validate deeply nested category trees
const category = CategorySchema.parse({
  id: "1",
  name: "Root",
  children: [
    {
      id: "2",
      name: "Child 1",
      children: [
        {
          id: "3",
          name: "Grandchild",
          children: []
        }
      ]
    }
  ]
});
```

### Intersection-like behavior

Zod doesn't have `.and()` for intersections, but you can achieve it:

```typescript
// ❌ Not supported
// const Schema = Schema1.and(Schema2);

// ✅ Use merge for objects
const Schema = Schema1.merge(Schema2);

// ✅ For unions, use discrimination
const Combined = z.discriminatedUnion("type", [
  Schema1.extend({ type: z.literal("a") }),
  Schema2.extend({ type: z.literal("b") })
]);
```

### Dynamic schema composition

```typescript
function createUserSchema(options: { withPassword?: boolean; withRole?: boolean }) {
  let schema = z.object({
    email: z.string().email(),
    name: z.string()
  });

  if (options.withPassword) {
    schema = schema.extend({
      password: z.string().min(8)
    });
  }

  if (options.withRole) {
    schema = schema.extend({
      role: z.enum(["admin", "user"])
    });
  }

  return schema;
}

// Different schemas based on context
const SignupSchema = createUserSchema({ withPassword: true });
const ProfileUpdateSchema = createUserSchema({ withRole: true });
const AdminCreateUserSchema = createUserSchema({
  withPassword: true,
  withRole: true
});
```

## Best Practices

### 1. Export both schema and type

```typescript
// ✅ Always export both
export const UserSchema = z.object({
  id: z.string(),
  name: z.string()
});

export type User = z.infer<typeof UserSchema>;

// Then consumers can:
import { UserSchema, type User } from "./schemas";
```

### 2. Schema caching

```typescript
// ❌ Recreates schema every call
function validateUser(data: unknown) {
  const schema = UserBase.extend({ timestamp: z.date() });
  return schema.parse(data);
}

// ✅ Cache at module level
const UserWithTimestamp = UserBase.extend({ timestamp: z.date() });

function validateUser(data: unknown) {
  return UserWithTimestamp.parse(data);
}
```

### 3. Compose over duplicate

```typescript
// ❌ Duplication
const CreateUser = z.object({
  email: z.string().email(),
  name: z.string()
});

const UpdateUser = z.object({
  email: z.string().email().optional(),
  name: z.string().optional()
});

// ✅ Composition
const UserFields = z.object({
  email: z.string().email(),
  name: z.string()
});

const CreateUser = UserFields;
const UpdateUser = UserFields.partial();
```

### 4. Discriminated unions over plain unions

```typescript
// ❌ Hard to narrow
const Response = z.union([
  z.object({ data: z.string() }),
  z.object({ error: z.string() })
]);

// ✅ Type-safe discrimination
const Response = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("error"), error: z.string() })
]);
```

### 5. Use defaults wisely

```typescript
// Defaults applied after validation
const Config = z.object({
  port: z.number().int().default(3000),
  host: z.string().default("localhost")
});

Config.parse({}); // { port: 3000, host: "localhost" }
Config.parse({ port: 8080 }); // { port: 8080, host: "localhost" }
```
