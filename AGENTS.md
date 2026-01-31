# Agent Guidelines for Giftify Frontend

## Quick Reference

| Category | Rule |
|----------|------|
| Export | Named export only (except pages) |
| Props | Use `interface`, not `type` |
| Import order | React → External → Internal → Types |
| Components | shadcn/ui first → Custom if needed |
| State | Server: React Query / Client: Zustand |
| Tests | 80% coverage target, hooks + logic + E2E |

---

## Critical Rules

### DO NOT Modify (Read-Only)
These files require **human approval** before any changes:

```
.env*                          # Environment variables
src/lib/auth/                  # Auth utilities
src/features/auth/             # Auth features
src/features/payment/          # Payment logic
```

If changes are needed, **describe the changes and ask the user to make them manually**.

### Always Follow
1. **Check existing patterns first** - Look at similar code before writing new code
2. **Use shadcn/ui components** - Check `src/components/ui/` before creating custom components
3. **Maintain feature folder structure** - `features/[domain]/{api,components,hooks}/`
4. **TypeScript is mandatory** - All code must have proper type definitions

---

## Before You Code

### 1. Understand the Feature Structure

```
features/[domain]/
├── api/           # API call functions
├── components/    # Domain-specific components
└── hooks/         # React Query hooks (useXxx.ts)
```

### 2. Check Existing Patterns

Before creating new code, examine similar implementations:

```bash
# For hooks
src/features/product/hooks/useProducts.ts

# For API functions
src/lib/api/products.ts

# For React Query keys
src/lib/query/keys.ts
```

### 3. Component Location Decision

| Type | Location |
|------|----------|
| shadcn/ui base | `src/components/ui/` |
| Shared/reusable | `src/components/common/` |
| Layout related | `src/components/layout/` |
| Domain specific | `src/features/[domain]/components/` |

---

## Code Patterns

### React Query Hook Pattern

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getData } from '@/lib/api/[domain]';
import type { DataType } from '@/types/[domain]';

export function useData(params?: QueryParams) {
  return useQuery({
    queryKey: queryKeys.data(params),
    queryFn: () => getData(params),
  });
}
```

### Component Pattern

```typescript
import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  onAction?: () => void;
}

export function Card({ title, children, onAction }: CardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
}
```

### Import Order

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

// 3. Internal modules (@ alias)
import { Button } from '@/components/ui/button';
import { useProducts } from '@/features/product/hooks';
import { formatPrice } from '@/lib/utils';

// 4. Types (type-only imports)
import type { Product } from '@/types/product';
```

---

## Testing

### Required Test Coverage

| Category | Priority | Test Type |
|----------|----------|-----------|
| React Query hooks | **HIGH** | Unit |
| Business logic/utils | **HIGH** | Unit |
| Form validation | **HIGH** | Unit |
| Critical user flows | **HIGH** | E2E |
| UI components | Medium | Integration |

### Test File Location

```
src/features/[domain]/hooks/__tests__/useProducts.test.ts
src/lib/utils/__tests__/formatPrice.test.ts
```

### Test Pattern

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProducts', () => {
  it('fetches products successfully', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

---

## Design System

### Visual Reference
- **UI/Visual**: [29cm](https://www.29cm.co.kr/) web/mobile
- **UX/Interaction**: Toss Design System

### Responsive Design
- Support both web and mobile (29cm style)
- Mobile-first approach

### Component Priority
1. Check `src/components/ui/` (shadcn/ui) first
2. Create custom only if shadcn/ui doesn't have it
3. Custom components go to `src/components/common/` or feature-specific folder

---

## API Integration

### Current State
- Using environment variables for API URL
- MSW for mocking during development

### React Query Key Convention

```typescript
// src/lib/query/keys.ts
export const queryKeys = {
  products: (params?: ProductQueryParams) => ['products', params] as const,
  productDetail: (id: string) => ['products', id] as const,
  // ...
};
```

### API Function Pattern

```typescript
// src/lib/api/products.ts
import { fetchClient } from './client';
import type { Product, ProductQueryParams } from '@/types/product';

export async function getProducts(params?: ProductQueryParams) {
  const response = await fetchClient.get<ProductListResponse>('/products', { params });
  return response.data;
}
```

---

## Git Workflow

### Agent Git Management
The agent is responsible for:
- **Creating commits**: Write commit messages and execute commits after completing work
- **Remote merging**: Create PRs and manage remote repository merging
- Perform Git operations autonomously when requested by the user

### Branch Strategy
- **GitHub Flow**: `main` + `feature/*` branches

### Commit Message Format

```
<Type>: <Subject> (max 50 chars)

<Body> (optional)

Resolves #123 (optional)
```

**Types**:
- `Feat:` - New feature
- `Fix:` - Bug fix
- `Docs:` - Documentation
- `Style:` - Formatting (no code change)
- `Refactor:` - Refactoring
- `Test:` - Test code
- `Chore:` - Build/config changes
- `Design:` - UI design changes
- `!HOTFIX:` - Urgent bug fix
- `!BREAKING CHANGE:` - API changes

---

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
npm test         # Run tests
```

---

## Checklist Before Submitting Code

- [ ] Followed existing code patterns
- [ ] Used shadcn/ui components where applicable
- [ ] Added proper TypeScript types
- [ ] Wrote tests for hooks and business logic
- [ ] Import order is correct
- [ ] No modifications to restricted files (.env, auth, payment)
- [ ] Feature folder structure maintained
