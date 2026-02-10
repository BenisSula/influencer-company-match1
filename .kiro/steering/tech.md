# Technology Stack

## Build System

- **npm** or **yarn** for package management
- **Electron Builder** for desktop app packaging
- **Webpack** or **Vite** for bundling

## Languages & Frameworks

### Frontend (Desktop App)
- **Electron**: Cross-platform desktop framework
- **React**: UI component library
- **TypeScript**: Strict typing throughout

### Backend (API)
- **Node.js**: Runtime environment
- **NestJS**: Preferred backend framework (modular, scalable)
- **REST** or **GraphQL**: API architecture
- **WebSockets**: Real-time messaging (Socket.io or native WS)

### Database & Caching
- **PostgreSQL**: Primary relational database
- **Redis**: Caching layer for matching & search optimization

## Key Dependencies

- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **TypeORM** or **Prisma**: Database ORM
- **class-validator**: Input validation
- **Socket.io**: Real-time communication

## Architectural Patterns

- **Repository Pattern**: Database abstraction
- **Service Layer**: Business logic separation
- **Dependency Injection**: NestJS built-in DI
- **Modular Architecture**: Feature-based modules

## Common Commands

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Development
```bash
# Backend API
npm run start:dev

# Frontend (Electron)
npm run electron:dev

# Full stack
npm run dev
```

### Build
```bash
# Backend
npm run build

# Electron app
npm run electron:build

# Production build
npm run build:prod
```

### Test
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database
```bash
# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate

# Seed database
npm run seed
```

### Lint & Format
```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

## Security Requirements

- Secure IPC in Electron (disable nodeIntegration)
- Input validation on all endpoints
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Secure environment variables (.env files, never committed)
- JWT token expiration and refresh strategy
