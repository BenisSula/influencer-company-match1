# Coding Standards

## TypeScript Standards

### Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Definitions
- Use `interface` for object shapes
- Use `type` for unions, intersections, primitives
- Use `enum` for fixed sets of values
- Avoid `any` - use `unknown` if type is truly unknown

### Naming Conventions
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `User` or `IUser`)
- **Types**: PascalCase (e.g., `MatchScore`)
- **Enums**: PascalCase for enum, UPPER_CASE for values
- **Variables/Functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

### Example
```typescript
enum UserRole {
  INFLUENCER = 'INFLUENCER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

type MatchScore = number; // 0-100

const MAX_MATCHES_PER_PAGE = 50;
```

## Code Organization

### Imports Order
1. External libraries (React, NestJS, etc.)
2. Internal modules (features, services)
3. Relative imports (./components, ../utils)
4. Types/Interfaces
5. Styles

```typescript
import React, { useState } from 'react';
import { useQuery } from 'react-query';

import { MatchingService } from '@/services/matching';
import { useAuth } from '@/hooks/useAuth';

import { MatchCard } from './MatchCard';
import { FilterPanel } from '../filters/FilterPanel';

import type { Match, MatchFilters } from '@/types/matching.types';

import styles from './MatchingPage.module.css';
```

### File Structure
- One component/class per file
- Co-locate related files (component + styles + tests)
- Max 300 lines per file (split if larger)

## React Standards

### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Types
interface Props {
  userId: string;
  onUpdate: (data: User) => void;
}

// 3. Component
export const UserProfile: React.FC<Props> = ({ userId, onUpdate }) => {
  // 4. Hooks
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, [userId]);
  
  // 6. Handlers
  const handleSubmit = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Component Best Practices
- Use functional components with hooks
- Keep components small and focused
- Extract complex logic into custom hooks
- Use TypeScript for props
- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback`

### Conditional Rendering
```typescript
// Good
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// Avoid
{isLoading ? <Spinner /> : null}
```

## NestJS Standards

### Controller Structure
```typescript
@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}
  
  @Get()
  @Roles(UserRole.INFLUENCER, UserRole.COMPANY)
  async getMatches(
    @Query() filters: MatchFiltersDto,
    @CurrentUser() user: User
  ): Promise<MatchResponseDto[]> {
    return this.matchingService.findMatches(user.id, filters);
  }
}
```

### Service Structure
```typescript
@Injectable()
export class MatchingService {
  constructor(
    private readonly matchingRepository: MatchingRepository,
    private readonly cacheService: CacheService
  ) {}
  
  async findMatches(userId: string, filters: MatchFilters): Promise<Match[]> {
    // Business logic here
  }
}
```

### DTOs with Validation
```typescript
import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateInfluencerProfileDto {
  @IsString()
  niche: string;
  
  @IsNumber()
  @Min(0)
  @Max(10000000)
  audienceSize: number;
  
  @IsOptional()
  @IsString()
  location?: string;
}
```

## Error Handling

### Backend
```typescript
// Use NestJS exceptions
throw new NotFoundException(`User with ID ${id} not found`);
throw new BadRequestException('Invalid input data');
throw new UnauthorizedException('Invalid credentials');

// Custom exceptions
export class MatchingException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
```

### Frontend
```typescript
try {
  const data = await matchingService.getMatches(filters);
  setMatches(data);
} catch (error) {
  if (error.response?.status === 404) {
    showToast('No matches found', 'info');
  } else {
    showToast('Failed to load matches', 'error');
    console.error('Matching error:', error);
  }
}
```

## Comments & Documentation

### When to Comment
- Complex algorithms (matching score calculation)
- Non-obvious business logic
- Workarounds or hacks (with explanation)
- Public API methods

### JSDoc for Functions
```typescript
/**
 * Calculates compatibility score between influencer and company
 * @param influencer - Influencer profile data
 * @param company - Company profile data
 * @returns Compatibility score (0-100) and tier label
 */
function calculateMatch(
  influencer: InfluencerProfile,
  company: CompanyProfile
): MatchResult {
  // Implementation
}
```

### Avoid Obvious Comments
```typescript
// Bad
const userId = user.id; // Get user ID

// Good (self-documenting code)
const userId = user.id;
```

## Performance Best Practices

### Database Queries
- Use select to fetch only needed columns
- Use pagination for large datasets
- Avoid N+1 queries (use eager loading)
- Index frequently queried columns

### React Performance
- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for functions passed as props
- Lazy load routes and heavy components

### API Optimization
- Implement caching (Redis)
- Use compression (gzip)
- Batch requests when possible
- Implement rate limiting

## Security Best Practices

### Input Validation
- Validate all user inputs on backend
- Use DTOs with class-validator
- Sanitize inputs to prevent XSS
- Use parameterized queries (ORM)

### Authentication
- Hash passwords with bcrypt (salt rounds: 10-12)
- Use secure JWT tokens
- Implement token refresh mechanism
- Store tokens securely (httpOnly cookies or secure storage)

### Environment Variables
```typescript
// Never commit .env files
// Use .env.example as template

// Access via config service
@Injectable()
export class ConfigService {
  get jwtSecret(): string {
    return process.env.JWT_SECRET;
  }
}
```

## Git Commit Standards

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting changes
- `test`: Adding tests
- `docs`: Documentation
- `chore`: Maintenance tasks

### Examples
```
feat(matching): implement weighted scoring algorithm
fix(auth): resolve JWT token expiration issue
refactor(profiles): extract profile validation logic
```