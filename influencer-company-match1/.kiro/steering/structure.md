# Project Structure

## Directory Organization

```
project-root/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── profiles/       # Profile management (influencer/company)
│   │   ├── matching/       # Matching engine & algorithm
│   │   ├── messaging/      # Real-time messaging
│   │   ├── collaboration/  # Collaboration tracking
│   │   ├── common/         # Shared utilities, guards, decorators
│   │   ├── config/         # Configuration management
│   │   └── database/       # Database migrations, seeds
│   ├── test/               # E2E tests
│   └── package.json
├── frontend/               # Electron + React app
│   ├── src/
│   │   ├── main/          # Electron main process
│   │   ├── renderer/      # React renderer process
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── pages/         # Page-level components
│   │   │   ├── features/      # Feature modules (auth, matching, etc.)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API client services
│   │   │   ├── store/         # State management (Redux/Zustand)
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Helper functions
│   │   └── shared/        # Shared between main/renderer
│   └── package.json
├── shared/                 # Shared types/constants between backend/frontend
│   └── types/
└── docs/                   # Documentation
```

## Conventions

### File Naming

- **Components**: PascalCase (e.g., `MatchingCard.tsx`, `UserProfile.tsx`)
- **Services/Utilities**: camelCase (e.g., `matchingService.ts`, `apiClient.ts`)
- **Modules (NestJS)**: kebab-case (e.g., `user-profile.module.ts`)
- **Types/Interfaces**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)
- **Tests**: Same name as file with `.spec.ts` or `.test.ts` suffix

### Code Organization

#### Backend (NestJS)
- **Module-based**: Each feature is a self-contained module
- **Repository Pattern**: Database logic in repositories
- **Service Layer**: Business logic in services
- **DTOs**: Data Transfer Objects for validation
- **Entities**: Database models

#### Frontend (React)
- **Feature-based**: Group by feature, not by type
- **Component Composition**: Small, reusable components
- **Custom Hooks**: Extract reusable logic
- **Centralized State**: Use Redux/Zustand for global state
- **API Services**: Separate API calls from components

### TypeScript Standards

- **Strict mode enabled**: No implicit any
- **Interfaces over types**: For object shapes
- **Enums**: For fixed sets of values (UserRole, MatchingTier)
- **Generics**: For reusable type-safe functions

## Key Directories

### `/backend/src/auth`
JWT authentication, role-based guards, password hashing

### `/backend/src/matching`
Weighted matching algorithm, compatibility scoring, filtering logic

### `/backend/src/profiles`
Influencer and Company profile management, separate schemas

### `/backend/src/messaging`
WebSocket gateway, conversation storage, real-time events

### `/frontend/src/renderer/features`
Feature modules mirroring backend (auth, matching, messaging, profiles)

### `/frontend/src/renderer/components`
Reusable UI components (buttons, cards, modals, forms)

### `/shared/types`
Shared TypeScript types between backend and frontend (User, Profile, Match, etc.)

## Design System

### Colors
- Primary: Deep Indigo `#1F2A44`
- Secondary: Electric Blue `#2563EB`
- Accent: Teal `#14B8A6`
- Neutral Light: `#F8FAFC`
- Neutral Dark: `#0F172A`

### Typography
- Font Family: Inter or Poppins
- Professional, clean, SaaS-grade aesthetic
