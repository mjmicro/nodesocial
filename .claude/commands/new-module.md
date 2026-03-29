Create a new NestJS module for the feature: $ARGUMENTS

Follow the architecture rules in CLAUDE.md exactly. Create these files:

**`services/api/src/modules/$ARGUMENTS/$ARGUMENTS.module.ts`**
- @Module decorator registering controller, service, SupabaseAuthGuard
- Import BullModule.registerQueue if this module enqueues jobs

**`services/api/src/modules/$ARGUMENTS/$ARGUMENTS.controller.ts`**
- @Controller('$ARGUMENTS') with @UseGuards(SupabaseAuthGuard)
- HTTP handlers only — zero business logic
- Inject service via constructor DI
- Validate request bodies with `new ZodValidationPipe(XSchema)` from `@truthlayer/shared`

**`services/api/src/modules/$ARGUMENTS/$ARGUMENTS.service.ts`**
- All business logic lives here
- Inject `DatabaseService` (not PrismaService) via constructor DI
- If Supabase admin calls needed: `@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient`
- Use `select` on all Prisma queries — never return full models
- Wrap multi-table operations in Prisma transactions

**`services/api/src/modules/$ARGUMENTS/dto/`**
- DTOs are thin re-exports from `@truthlayer/shared`:
  ```ts
  export type { CreateXInput as CreateXDto } from '@truthlayer/shared'
  ```
- Zod schemas and TypeScript types live in `packages/shared/src/validators/$ARGUMENTS.ts`

**`services/api/src/modules/$ARGUMENTS/entities/$ARGUMENTS.entity.ts`** (if needed)
- Maps Prisma model to API response shape via a mapper function
- Follow the pattern in `services/api/src/modules/users/utils/profile.mapper.ts`

After creating files:
1. Import and add the module to `services/api/src/app.module.ts`
2. Run `tsc --noEmit` in services/api to verify zero type errors
