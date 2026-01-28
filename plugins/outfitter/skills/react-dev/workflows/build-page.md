# Workflow: Build Page

Create a page component with routing, data loading, search params validation, and error handling using TanStack Router.

<required_reading>

**Read these reference files NOW:**

1. [tanstack-router.md](../references/tanstack-router.md) - Route definition, loaders, typed hooks
2. [hooks.md](../references/hooks.md) - Hook patterns for page state

</required_reading>

<prerequisites>

- TanStack Router configured in project
- Zod installed for search params validation
- Understanding of page data requirements

</prerequisites>

<process>

## Step 1: Define Route in Router Config

Create the route with path, params, and parent relationship.

```typescript
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  component: UserPage,
});

// For index routes
export const usersIndexRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/',
  component: UsersListPage,
});
```

## Step 2: Add Search Params Validation

Define search params schema with Zod for type-safe query strings.

```typescript
import { z } from 'zod';

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  component: UserPage,
  validateSearch: z.object({
    tab: z.enum(['profile', 'posts', 'settings']).default('profile'),
    page: z.number().int().positive().default(1),
    filter: z.string().optional(),
  }),
});
```

**Common search param patterns:**

```typescript
// Pagination
z.object({
  page: z.number().int().positive().default(1),
  perPage: z.number().int().min(10).max(100).default(20),
})

// Sorting
z.object({
  sortBy: z.enum(['name', 'date', 'price']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Filtering
z.object({
  status: z.enum(['all', 'active', 'archived']).default('all'),
  search: z.string().optional(),
  tags: z.array(z.string()).default([]),
})
```

## Step 3: Implement Loader Function

Fetch data needed for the page. Loader runs before component renders.

```typescript
export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  validateSearch: z.object({
    tab: z.enum(['profile', 'posts']).default('profile'),
  }),
  loader: async ({ params, search }) => {
    // params.userId is typed from path
    // search.tab is typed from validateSearch

    const user = await fetchUser(params.userId);

    // Load tab-specific data
    const tabData = search.tab === 'posts'
      ? await fetchUserPosts(params.userId)
      : await fetchUserProfile(params.userId);

    return { user, tabData };
  },
  component: UserPage,
});
```

**Parallel data fetching:**

```typescript
loader: async ({ params }) => {
  const [user, posts, followers] = await Promise.all([
    fetchUser(params.userId),
    fetchUserPosts(params.userId),
    fetchUserFollowers(params.userId),
  ]);

  return { user, posts, followers };
},
```

## Step 4: Create Page Component

Use typed hooks to access params, search, and loader data.

```typescript
function UserPage() {
  // All typed from route definition
  const { userId } = useParams({ from: userRoute.id });
  const { tab, page } = useSearch({ from: userRoute.id });
  const { user, tabData } = useLoaderData({ from: userRoute.id });

  return (
    <div>
      <h1>{user.name}</h1>

      <TabNavigation currentTab={tab} userId={userId} />

      {tab === 'profile' && <ProfileTab data={tabData} />}
      {tab === 'posts' && <PostsTab posts={tabData} page={page} />}
    </div>
  );
}
```

## Step 5: Wire Up Navigation

Use type-safe navigation for search param updates.

```typescript
function TabNavigation({ currentTab, userId }: TabNavigationProps) {
  const navigate = useNavigate({ from: userRoute.id });

  const switchTab = (tab: 'profile' | 'posts') => {
    navigate({
      search: (prev) => ({ ...prev, tab, page: 1 }),
    });
  };

  return (
    <nav>
      <button
        onClick={() => switchTab('profile')}
        data-active={currentTab === 'profile'}
      >
        Profile
      </button>
      <button
        onClick={() => switchTab('posts')}
        data-active={currentTab === 'posts'}
      >
        Posts
      </button>
    </nav>
  );
}
```

## Step 6: Add Error Boundary

Handle loader errors gracefully.

```typescript
export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  component: UserPage,
  errorComponent: UserErrorPage,
  pendingComponent: UserPageSkeleton,
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { user };
  },
});

function UserErrorPage({ error }: { error: Error }) {
  return (
    <div className="error-page">
      <h1>Error Loading User</h1>
      <p>{error.message}</p>
      <Link to="/users">Back to Users</Link>
    </div>
  );
}

function UserPageSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-content" />
    </div>
  );
}
```

## Step 7: Verify

- [ ] Route appears in router tree
- [ ] Search params validate correctly
- [ ] Loader fetches required data
- [ ] Page renders with loader data
- [ ] Navigation updates search params
- [ ] Errors display error component

</process>

<anti_patterns>

Avoid:

- Fetching data in useEffect instead of loader - causes waterfalls and loading states
- Not validating search params - allows invalid state from URL manipulation
- Using generic error boundaries - lose context about what failed
- Forgetting pendingComponent - users see nothing during load
- Hardcoding route paths in navigate - use route.id for type safety

```typescript
// Bad: hardcoded path, no type checking
navigate({ to: '/users/123/posts' });

// Good: type-safe navigation
navigate({
  to: '/users/$userId/posts',
  params: { userId: '123' },
});
```

</anti_patterns>

<success_criteria>

This workflow is complete when:

- [ ] Route defined with correct path and params
- [ ] Search params validated with Zod schema
- [ ] Loader fetches all required data
- [ ] Page component uses typed hooks
- [ ] Navigation is type-safe
- [ ] Error and pending components defined
- [ ] Page loads data correctly
- [ ] Search params persist in URL

</success_criteria>

<cross_references>

- **typescript-dev skill** - For Zod schema patterns
- **debugging skill** - If loader data isn't flowing correctly

</cross_references>
