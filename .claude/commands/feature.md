Scaffold a complete full-stack feature for: $ARGUMENTS

Execute in this exact order:

**Step 1 — Shared types** (`packages/shared/src/`)
- `validators/$ARGUMENTS.schema.ts` — Zod schemas: Create$ArgumentsSchema, Update$ArgumentsSchema, $ArgumentsResponseSchema
- `types/$ARGUMENTS.types.ts` — TypeScript types inferred from Zod: `type Create$Arguments = z.infer<typeof Create$ArgumentsSchema>`
- Export both from `validators/index.ts` and `types/index.ts`

**Step 2 — Backend module** (`services/api/src/modules/$ARGUMENTS/`)
- `$ARGUMENTS.module.ts`
- `$ARGUMENTS.controller.ts` — HTTP handlers only, no business logic
- `$ARGUMENTS.service.ts` — all business logic, Prisma queries with select
- `dto/create-$ARGUMENTS.dto.ts`
- `dto/update-$ARGUMENTS.dto.ts`
- `entities/$ARGUMENTS.entity.ts`

**Step 3 — API client** (`packages/api-client/src/`)
- `hooks/use-$ARGUMENTS.ts` — useQuery for reads, useMutation for writes
- Import types from `@truthlayer/shared`
- Export from `hooks/index.ts`

**Step 4 — App screens** (`apps/app/src/`)
- `app/(tabs)/$ARGUMENTS/index.tsx` — list screen
- `app/(tabs)/$ARGUMENTS/[id].tsx` — detail screen
- `components/$ARGUMENTS/` — sub-components as needed, NativeWind styled

**Step 5 — Wire up**
- Add module to `services/api/src/app.module.ts`
- Add tab route to `apps/app/src/app/(tabs)/_layout.tsx` if primary tab

After all files:
1. Run `turbo run type-check` from monorepo root — must pass with zero errors
2. List any Prisma schema changes needed — do NOT modify schema automatically, ask first
