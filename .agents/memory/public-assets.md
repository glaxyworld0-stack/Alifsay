---
name: Public assets path for alifsay
description: Where to put static image files so they are accessible at runtime via URL paths.
---

## Rule
Product images and other static assets referenced as URL paths (e.g. `/assets/products/product-1.jpg`) must be placed in `artifacts/alifsay/public/assets/products/`, not `src/assets/`.

**Why:** Vite only serves `public/` contents at root-relative paths. Files under `src/assets/` must be imported via JS to be bundled — they are not served at their filesystem path.

**How to apply:** When the design subagent generates images to `src/assets/products/`, copy them to `public/assets/products/` before testing. In production builds, Vite copies `public/` verbatim into `dist/`.
