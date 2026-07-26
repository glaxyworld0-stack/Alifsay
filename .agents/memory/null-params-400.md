---
name: Null query params cause 400s
description: Passing null values to generated API hooks serializes as the string "null", breaking Zod coercion on the server.
---

## Rule
Never pass `null` values for optional number/boolean query params to generated API hooks. Omit the key instead.

**Why:** The generated URL builder serializes `{ categoryId: null }` as `?categoryId=null`. On the server, `zod.coerce.number()` on `"null"` produces `NaN`, which fails validation and returns 400.

**How to apply:**
```ts
// WRONG
useListProducts({ categoryId: null });

// CORRECT
useListProducts({ ...(categoryId != null ? { categoryId } : {}) });
```

Apply this pattern anywhere an optional numeric or boolean filter is derived from state that can be null/undefined.
