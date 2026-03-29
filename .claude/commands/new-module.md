Create a new NestJS module for the feature: $ARGUMENTS

Follow the architecture rules in CLAUDE.md exactly. Create these files:

**`services/api/src/modules/$ARGUMENTS/$ARGUMENTS.module.ts`**
- @Module decorator registering controller, service, and imports (DatabaseModule, BullModule if queue needed)

**`services/api/src/modules/$ARGUMENTS/$ARGUMENTS.controller.ts`**
- @Controller('$ARGUMENTS') with @UseGuards(SupabaseAuthGuard)
- HTTP handlers only — zero business logic
- Inject the service via constructor DI
- Standard CRUD endpoints: GET list, GET :id, POST, PATCH :id, DELETE :id

**`services/api/src/modules/$ARGUMENTS/$ARGUMENTS.service.ts`**
- All business logic lives here
- Inject PrismaService via constructor DI
- Use `select` on all Prisma queries — never return full models
- Wrap multi-table operations in Prisma transactions

**`services/api/src/modules/$ARGUMENTS/dto/create-$ARGUMENTS.dto.ts`**
- class-validator decorators for all fields
- Match fields to the Prisma schema model

**`services/api/src/modules/$ARGUMENTS/dto/update-$ARGUMENTS.dto.ts`**
- Extend create DTO with PartialType

**`services/api/src/modules/$ARGUMENTS/entities/$ARGUMENTS.entity.ts`**
- Maps Prisma model to API response shape
- Exclude sensitive fields (passwords, internal flags)

After creating files:
1. Import and add the module to `services/api/src/app.module.ts`
2. Run `tsc --noEmit` in services/api to verify zero type errors
