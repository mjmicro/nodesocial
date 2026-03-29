Scaffold a complete full-stack feature for: $ARGUMENTS

Execute in this exact order:

**Step 1 — Shared validators** (`packages/shared/src/validators/$ARGUMENTS.ts`)
- Zod schemas: `Create$ArgumentsSchema`, `Update$ArgumentsSchema`, `$ArgumentsResponseSchema`
- Inferred TypeScript types: `type Create$Arguments = z.infer<typeof Create$ArgumentsSchema>`
- Export from `packages/shared/src/validators/index.ts`

**Step 2 — Backend module** (`services/api/src/modules/$ARGUMENTS/`)
- `$ARGUMENTS.module.ts` — registers controller, service, SupabaseAuthGuard
- `$ARGUMENTS.controller.ts` — HTTP handlers only, validates bodies with `ZodValidationPipe`
- `$ARGUMENTS.service.ts` — all business logic; inject `DatabaseService`; if Supabase admin needed inject `@Inject(SUPABASE_CLIENT)`
- `dto/create-$ARGUMENTS.dto.ts` — thin re-export: `export type { Create$ArgumentsInput as Create$ArgumentsDto } from '@truthlayer/shared'`
- `dto/update-$ARGUMENTS.dto.ts` — same pattern
- `entities/$ARGUMENTS.mapper.ts` — mapper function (see `users/utils/profile.mapper.ts` as reference)

**Step 3 — API client** (`packages/api-client/src/`)
- Add read hooks to `queries/index.ts`
- Add write hooks to `mutations/index.ts`
- `body` passed as plain object to `apiRequest` — no `JSON.stringify` needed
- Re-export new hooks from `hooks/index.ts`

**Step 4 — App screens** (`apps/app/src/`)
- `app/(tabs)/$ARGUMENTS/index.tsx` — list screen
- `app/(tabs)/$ARGUMENTS/[id].tsx` — detail screen
- `components/$ARGUMENTS/` — sub-components as needed, NativeWind styled
- Import `API_URL` from `@truthlayer/api-client` if doing raw fetch

**Step 5 — Wire up**
- Add module to `services/api/src/app.module.ts`
- Add tab route to `apps/app/src/app/(tabs)/_layout.tsx` if primary tab

After all files:
1. Run `turbo run type-check` from monorepo root — must pass with zero errors
2. List any Prisma schema changes needed — do NOT modify schema automatically, ask first
