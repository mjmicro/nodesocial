Create a new Expo screen for: $ARGUMENTS

The first argument is the screen component name, the second is the Expo Router file path.

**`apps/app/src/app/<route-path>.tsx`**
- Expo Router file-based route
- NativeWind (Tailwind) for ALL styling — no StyleSheet.create ever
- Use React Query hook from `@truthlayer/api-client` for data fetching
- Import `API_URL` from `@truthlayer/api-client` if doing raw fetch (never use process.env directly)
- Include: loading skeleton state, error state, empty state
- Follow the 3-tap rule — every core action reachable in 3 taps

**`apps/app/src/components/<ScreenName>/`** (if screen needs sub-components)
- Split into focused components, max ~100 lines each
- All styled with NativeWind

**`packages/api-client/src/queries/index.ts`** — add read hooks here
**`packages/api-client/src/mutations/index.ts`** — add write hooks here
- Typed with Zod schema from `@truthlayer/shared`
- `body` is passed as a plain object to `apiRequest` — it auto-serializes to JSON
- Export new hooks from `packages/api-client/src/hooks/index.ts`

After creating files:
1. Check _layout.tsx if tab navigation needs updating
2. Verify imports from `@truthlayer/shared` and `@truthlayer/api-client` resolve
3. Run `tsc --noEmit` in apps/app to verify zero type errors
