---
inclusion: fileMatch
fileMatchPattern: "**/auth/**,**/guards/**,**/*.guard.ts"
---

# Security Guidelines

This steering file is automatically included when working with authentication and security code.

## Authentication

### Password Security

#### Hashing
```typescript
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Rules**:
- NEVER store plain text passwords
- Use bcrypt with 10-12 salt rounds
- Hash passwords before storing in database
- Use timing-safe comparison (bcrypt.compare)

#### Password Requirements
```typescript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validatePassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}
```

**Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Tokens

#### Token Generation
```typescript
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  
  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m'
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d'
    });
    
    return { accessToken, refreshToken };
  }
}
```

**Token Rules**:
- Access tokens: 15 minutes expiration
- Refresh tokens: 7 days expiration
- Include minimal data in payload (no sensitive info)
- Sign with strong secret (min 32 characters)
- Implement token refresh mechanism

#### Token Validation
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
  
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

### Role-Based Access Control (RBAC)

#### Roles Guard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}
```

#### Usage
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    // Only admins can access
  }
  
  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.COMPANY)
  getAnalytics() {
    // Admins and companies can access
  }
}
```

## Input Validation

### DTO Validation
```typescript
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength,
  Matches,
  IsOptional
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, {
    message: 'Password too weak'
  })
  password: string;
  
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
```

### Sanitization
```typescript
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  content: string;
}
```

**Validation Rules**:
- Validate ALL user inputs on backend
- Use class-validator decorators
- Sanitize HTML content
- Validate file uploads (type, size)
- Reject unexpected fields

## SQL Injection Prevention

### Use ORM (TypeORM/Prisma)
```typescript
// GOOD - Parameterized query via ORM
const user = await userRepository.findOne({
  where: { email: userEmail }
});

// BAD - String concatenation (vulnerable)
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

**Rules**:
- ALWAYS use ORM query builders
- NEVER concatenate user input into SQL
- Use parameterized queries
- Validate input types

## XSS Prevention

### Content Security Policy
```typescript
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  }
}));
```

### Output Encoding
```typescript
// React automatically escapes content
<div>{userContent}</div> // Safe

// Dangerous - avoid dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} /> // Unsafe
```

## CSRF Protection

### CSRF Tokens
```typescript
import * as csurf from 'csurf';

app.use(csurf({ cookie: true }));

// Include CSRF token in forms
<input type="hidden" name="_csrf" value={csrfToken} />
```

## Rate Limiting

### API Rate Limiting
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // 10 requests per minute
    }),
  ],
})
export class AppModule {}

// Apply to specific routes
@UseGuards(ThrottlerGuard)
@Post('login')
async login() {}
```

### Custom Rate Limiting
```typescript
@Injectable()
export class LoginRateLimiter {
  private attempts = new Map<string, number>();
  
  async checkAttempts(email: string): Promise<void> {
    const attempts = this.attempts.get(email) || 0;
    
    if (attempts >= 5) {
      throw new TooManyRequestsException(
        'Too many login attempts. Try again in 15 minutes.'
      );
    }
    
    this.attempts.set(email, attempts + 1);
    
    // Reset after 15 minutes
    setTimeout(() => {
      this.attempts.delete(email);
    }, 15 * 60 * 1000);
  }
}
```

## Secure Headers

### Helmet Configuration
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: true,
  xssFilter: true,
}));
```

## Environment Variables

### Secure Storage
```typescript
// .env (NEVER commit this file)
JWT_SECRET=your-super-secret-key-min-32-chars
DB_PASSWORD=your-database-password
API_KEY=your-api-key

// .env.example (commit this as template)
JWT_SECRET=
DB_PASSWORD=
API_KEY=
```

### Access via Config Service
```typescript
@Injectable()
export class ConfigService {
  get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }
    return secret;
  }
}
```

**Rules**:
- NEVER commit .env files
- Use .env.example as template
- Validate required env vars on startup
- Use strong secrets (min 32 chars)
- Rotate secrets regularly

## Electron Security

### Secure IPC
```typescript
// main.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false, // CRITICAL
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### Preload Script
```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data: any) => {
    const validChannels = ['login', 'logout', 'getProfile'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
```

**Electron Rules**:
- NEVER enable nodeIntegration
- ALWAYS use contextIsolation
- Whitelist IPC channels
- Validate all IPC messages
- Use Content Security Policy

## Logging & Monitoring

### Secure Logging
```typescript
@Injectable()
export class Logger {
  log(message: string, context?: any) {
    // NEVER log sensitive data
    const sanitized = this.sanitizeContext(context);
    console.log(message, sanitized);
  }
  
  private sanitizeContext(context: any): any {
    const sensitive = ['password', 'token', 'secret', 'apiKey'];
    const sanitized = { ...context };
    
    sensitive.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

**Logging Rules**:
- NEVER log passwords, tokens, or secrets
- Redact sensitive data
- Log authentication attempts
- Log authorization failures
- Monitor for suspicious patterns

## Security Checklist

### Before Deployment
- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens have expiration
- [ ] RBAC guards applied to protected routes
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Secure headers configured (Helmet)
- [ ] CSRF protection enabled
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] Electron nodeIntegration disabled
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention (sanitization)
- [ ] Logging sanitized
- [ ] Error messages don't expose internals