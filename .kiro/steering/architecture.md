# Architecture Guidelines

## Core Principles

### SOLID Principles
- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Many specific interfaces over one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Extract common logic into reusable functions/services
- Use shared types between backend and frontend
- Create reusable UI components
- Centralize configuration

### Separation of Concerns
- **Backend**: Controllers → Services → Repositories → Database
- **Frontend**: Components → Hooks → Services → API
- Keep business logic out of UI components
- Keep UI logic out of services

## Backend Architecture (NestJS)

### Module Structure
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService]
})
```

### Repository Pattern
```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}
  
  async findById(id: string): Promise<User> {
    return this.userRepo.findOne({ where: { id } });
  }
}
```

### Service Layer
- Contains business logic
- Uses repositories for data access
- Returns DTOs, not entities
- Handles errors and validation

### DTOs (Data Transfer Objects)
- Use class-validator for validation
- Separate DTOs for create/update/response
- Transform entities to DTOs before returning

## Frontend Architecture (React)

### Component Hierarchy
```
Page Component (route-level)
  ├── Feature Component (business logic)
  │   ├── Container Component (data fetching)
  │   │   └── Presentational Component (pure UI)
  │   └── Presentational Component
  └── Shared Component
```

### Custom Hooks Pattern
- Extract reusable logic from components
- Prefix with `use` (e.g., `useAuth`, `useMatching`)
- Keep hooks focused and single-purpose

### State Management
- **Local State**: useState for component-specific state
- **Global State**: Redux/Zustand for app-wide state (auth, user profile)
- **Server State**: React Query for API data caching

### API Service Layer
```typescript
class MatchingService {
  async getMatches(filters: MatchFilters): Promise<Match[]> {
    return apiClient.get('/matches', { params: filters });
  }
}
```

## Matching Algorithm Architecture

### Weighted Scoring System
```typescript
interface MatchWeights {
  nicheCompatibility: number;      // 30%
  locationCompatibility: number;   // 15%
  budgetAlignment: number;         // 20%
  platformOverlap: number;         // 15%
  audienceSizeMatch: number;       // 10%
  engagementTierMatch: number;     // 10%
}
```

### Scoring Rules
- Each factor returns a score 0-100
- Apply weights to calculate final score
- Cache results in Redis for performance
- Deterministic: same inputs = same output

### Performance Optimization
- Index database columns used in matching
- Use Redis for frequently accessed matches
- Paginate results (20-50 per page)
- Background job for bulk matching calculations

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Backend validates and generates JWT
3. Frontend stores token securely
4. Token included in all API requests
5. Backend validates token on protected routes

### Role-Based Access Control (RBAC)
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY, UserRole.ADMIN)
@Get('analytics')
getAnalytics() { }
```

### Data Validation
- Validate all inputs on backend (class-validator)
- Sanitize user inputs to prevent injection
- Use parameterized queries (ORM handles this)
- Rate limit API endpoints

## Database Design

### Normalization
- Follow 3NF (Third Normal Form)
- Avoid data duplication
- Use foreign keys for relationships

### Indexing Strategy
- Index columns used in WHERE clauses
- Index foreign keys
- Composite indexes for multi-column queries
- Monitor query performance

### Relationships
- User → Profile (1:1)
- User → Messages (1:Many)
- Influencer ↔ Company (Many:Many through Matches)

## Error Handling

### Backend
- Use NestJS exception filters
- Return consistent error format
- Log errors with context
- Don't expose internal errors to client

### Frontend
- Global error boundary for React
- Toast notifications for user-facing errors
- Retry logic for network failures
- Graceful degradation

## Testing Strategy

### Backend
- Unit tests for services (business logic)
- Integration tests for repositories
- E2E tests for API endpoints
- Mock external dependencies

### Frontend
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for features
- E2E tests with Playwright/Cypress

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (no session storage)
- Use Redis for shared cache
- Load balancer for multiple instances
- Database connection pooling

### Performance
- Lazy load components
- Debounce search inputs
- Virtual scrolling for long lists
- Image optimization and lazy loading

### Monitoring
- Log important events
- Track API response times
- Monitor database query performance
- Set up alerts for errors