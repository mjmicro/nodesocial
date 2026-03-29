Create a new BullMQ job and processor for: $ARGUMENTS

Follow the queue pattern in CLAUDE.md exactly.

**`packages/shared/src/constants/index.ts`**
- Add the queue name to the QUEUES constant: `$ARGUMENTS: '$ARGUMENTS'`

**`services/api/src/queue/jobs/$ARGUMENTS.job.ts`**
- Re-export queue name from `@truthlayer/shared`
- Export a typed payload interface: `interface $ArgumentsJobPayload { ... }`
- No `any` in payload — fully typed

**`services/api/src/queue/processors/$ARGUMENTS.processor.ts`**
- @Processor(QUEUES.$ARGUMENTS) decorator
- @Process() handler method
- Inject required services via constructor DI
- Job MUST be idempotent — safe to retry on failure
- Default options: `attempts: 3`, `backoff: { type: 'exponential', delay: 2000 }`
- Structured logs: job start, success, failure

After creating files:
1. Register the processor in the relevant feature module's @Module providers array
2. Add `BullModule.registerQueue({ name: QUEUES.$ARGUMENTS })` to the module imports
3. Run `tsc --noEmit` in services/api to verify zero type errors
