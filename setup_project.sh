#!/bin/bash
# TruthLayer — Project scaffolding script (Turborepo)
# Stack: Expo Universal | NestJS + Fastify | Prisma | Supabase | BullMQ | Upstash | Typesense | Cloudflare R2

set -e
echo "Creating TruthLayer Turborepo structure..."

ROOT="truthlayer"

# ── Turborepo root ────────────────────────────────────────────────────────────
mkdir -p $ROOT
touch $ROOT/turbo.json
touch $ROOT/package.json
touch $ROOT/.env.example
touch $ROOT/.gitignore

# ── apps/app — Expo Universal (web + iOS + Android) ──────────────────────────
mkdir -p $ROOT/apps/app/src/{app,components/{common,mission,neighborhood,reputation,gamification,verification,auth},hooks,store,utils,types,constants,assets/{images,fonts,icons}}

# ── services/api — NestJS + Fastify adapter ───────────────────────────────────
mkdir -p $ROOT/services/api/src/{modules/{auth,users,missions,neighborhoods,reports,reputation,search,notifications,b2b}/{controllers,services,dto,entities},common/{guards,interceptors,filters,decorators,pipes},config,database,queue/{jobs,processors},utils,types}
mkdir -p $ROOT/services/api/test

# ── services/reputation — Python FastAPI ─────────────────────────────────────
mkdir -p $ROOT/services/reputation/{src/{api,engine,models,events,workers,utils},tests,migrations}

# ── packages/database — Prisma schema + migrations ───────────────────────────
mkdir -p $ROOT/packages/database/{prisma/migrations,src}
touch $ROOT/packages/database/prisma/schema.prisma

# ── packages/shared — Zod schemas, TS types, validators ──────────────────────
mkdir -p $ROOT/packages/shared/src/{types,validators,constants,utils}

# ── packages/api-client — typed API client for Expo ──────────────────────────
mkdir -p $ROOT/packages/api-client/src/{hooks,queries,mutations,utils}

# ── docs ──────────────────────────────────────────────────────────────────────
mkdir -p $ROOT/docs/{architecture,api,product}

echo ""
echo "✓ TruthLayer project structure created at ./$ROOT"
echo ""
echo "Next steps:"
echo ""
echo "  1. cd $ROOT"
echo ""
echo "  2. Initialize Turborepo:"
echo "     npx create-turbo@latest --skip-install (to get turbo.json + root package.json)"
echo "     Or manually: npm install turbo --save-dev"
echo ""
echo "  3. Initialize Expo app:"
echo "     cd apps/app && npx create-expo-app@latest . --template blank-typescript"
echo "     npx expo install expo-router nativewind tailwindcss"
echo "     npx expo install expo-camera expo-location expo-image-picker"
echo ""
echo "  4. Initialize NestJS API:"
echo "     cd services/api && npx @nestjs/cli new . --package-manager npm --skip-git"
echo "     npm install @nestjs/platform-fastify"
echo "     npm install @nestjs/jwt @nestjs/passport passport passport-jwt"
echo "     npm install bullmq @nestjs/bullmq ioredis"
echo "     npm install @supabase/supabase-js"
echo ""
echo "  5. Initialize Prisma:"
echo "     cd packages/database"
echo "     npm install prisma @prisma/client"
echo "     npx prisma init --datasource-provider postgresql"
echo ""
echo "  6. Initialize shared package:"
echo "     cd packages/shared && npm install zod typescript"
echo ""
echo "  7. Move reputation engine:"
echo "     cp ../reputation_engine.py services/reputation/src/engine/"
echo "     cd services/reputation && pip install fastapi uvicorn sqlalchemy redis celery"
echo ""
echo "  8. Add to root package.json workspaces:"
echo "     apps/*, packages/*, services/api"
echo ""
echo "  9. Configure .env.example with:"
echo "     DATABASE_URL (Supabase PostgreSQL)"
echo "     SUPABASE_URL + SUPABASE_ANON_KEY + SUPABASE_SERVICE_KEY"
echo "     UPSTASH_REDIS_URL + UPSTASH_REDIS_TOKEN"
echo "     CLOUDFLARE_R2_BUCKET + R2_ACCESS_KEY + R2_SECRET_KEY"
echo "     TYPESENSE_HOST + TYPESENSE_API_KEY"
echo "     JWT_SECRET"
echo ""
echo "  10. Start Claude Code and reference .claude/CLAUDE.md for full context"
