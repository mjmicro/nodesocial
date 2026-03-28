#!/bin/bash
# TruthLayer — Project scaffolding script
# Run this to create the initial project structure

echo "Creating TruthLayer project structure..."

mkdir -p truthlayer/{apps/{mobile,web},services/{api,reputation,verification,missions},packages/{shared,ui},infrastructure/{terraform,k8s,docker},docs,scripts}

# Mobile app (React Native + Expo)
mkdir -p truthlayer/apps/mobile/{src/{screens/{neighborhood,feed,missions,profile,onboarding,auth},components/{common,mission,reputation,gamification,verification},hooks,services,store,navigation,utils,types},assets}

# Web app (Next.js)
mkdir -p truthlayer/apps/web/{src/{app,components,hooks,services,store,utils,types},public}

# API service (Node.js + GraphQL)
mkdir -p truthlayer/services/api/{src/{graphql/{schema,resolvers,middleware},routes,models,services,utils,types},tests}

# Reputation service (Python + FastAPI)
mkdir -p truthlayer/services/reputation/{src/{api,engine,models,events,workers,utils},tests,migrations}

# Verification service (Python — image analysis, fraud detection)
mkdir -p truthlayer/services/verification/{src/{api,pipeline,models/{ai_detection,manipulation,relevance,reverse_search},workers,utils},tests,models}

# Missions service
mkdir -p truthlayer/services/missions/{src/{api,lifecycle,matching,templates,verification,utils},tests}

# Shared packages
mkdir -p truthlayer/packages/shared/{src/{types,constants,utils,validators}}
mkdir -p truthlayer/packages/ui/{src/{components,styles,icons}}

# Infrastructure
mkdir -p truthlayer/infrastructure/docker
mkdir -p truthlayer/infrastructure/terraform/{modules,environments/{dev,staging,prod}}
mkdir -p truthlayer/infrastructure/k8s/{base,overlays/{dev,prod}}

# Documentation
mkdir -p truthlayer/docs/{architecture,api,product,onboarding}

echo "Project structure created!"
echo ""
echo "Next steps:"
echo "  1. cd truthlayer"
echo "  2. Copy CLAUDE.md to the project root"
echo "  3. Copy reputation_engine.py to services/reputation/src/engine/"
echo "  4. Initialize each service:"
echo "     - apps/mobile: npx create-expo-app@latest ."
echo "     - apps/web: npx create-next-app@latest ."  
echo "     - services/api: npm init && npm install apollo-server graphql"
echo "     - services/reputation: pip install fastapi uvicorn sqlalchemy"
echo "     - services/verification: pip install fastapi pillow torch torchvision"
echo "  5. Start Claude Code and reference CLAUDE.md for full context"
