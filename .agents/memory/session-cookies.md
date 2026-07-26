---
name: Session cookies in Replit preview
description: How to ensure session cookies flow correctly through the Replit proxy iframe for cart/wishlist.
---

## Rule
The `customFetch` call in `lib/api-client-react/src/custom-fetch.ts` must include `credentials: "include"` to send the `alifsay-session` cookie cross-origin through the Replit preview proxy.

**Why:** The preview pane is a proxied iframe. Without `credentials: "include"`, the browser drops cookies on cross-origin fetch requests, breaking session-based cart and wishlist state. The API server also needs `credentials: true` on its CORS config (already set in `artifacts/api-server/src/app.ts`).

**How to apply:** Line to ensure exists in custom-fetch.ts:
```ts
const response = await fetch(input, { ...init, method, headers, credentials: "include" });
```
