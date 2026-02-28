# Redis Client Error - Investigation & Implementation Plan

**Date**: February 23, 2026  
**Status**: 🔴 Redis Connection Failing  
**Priority**: Medium (Non-blocking for development)

---

## 🔍 Problem Analysis

### Current Error
```
Redis Client Error AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:6379
    Error: connect ECONNREFUSED 127.0.0.1:6379
  ]
}
```

### Root Cause
The backend application is trying to connect to Redis on port 6379, but:
1. **Redis server is not installed** on the Windows machine
2. **Two services are attempting Redis connections**:
   - `CacheService` (in `backend/src/cache/cache.service.ts`)
   - `BullModule` (job queue in `backend/src/app.module.ts`)

### Impact Assessment
- ✅ **Backend API**: Running successfully (port 3000)
- ✅ **Frontend**: Running successfully (port 5173)
- ⚠️ **Caching**: Disabled (falls back to no cache)
- ⚠️ **Job Queue**: May have issues with background tasks
- 📊 **Performance**: Slightly degraded without caching

---

## 📋 Current Redis Usage

### 1. Cache Service (`backend/src/cache/cache.service.ts`)
```typescript
constructor() {
  this.client = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  });
  this.client.on('error', (err) => console.error('Redis Client Error', err));
  this.client.connect();
}
```

**Used By**:
- Landing page statistics caching
- Platform metrics caching
- Match result caching (planned)
- User profile caching (planned)

### 2. Bull Queue (`backend/src/app.module.ts`)
```typescript
BullModule.forRoot({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
}),
```

**Used By**:
- Background job processing
- Email queue (planned)
- Notification queue (planned)
- Analytics processing (planned)

---

## 🎯 Implementation Options

### Option 1: Install Redis Server (Recommended for Production)

**Pros**:
- Full caching capabilities
- Background job processing
- Better performance
- Production-ready

**Cons**:
- Requires Redis installation
- Additional service to manage
- More complex setup

**When to Use**: Production deployment, performance testing, full feature testing

---

### Option 2: Make Redis Optional (Recommended for Development)

**Pros**:
- No additional dependencies
- Simpler development setup
- Application still works without Redis
- Graceful degradation

**Cons**:
- No caching benefits
- Background jobs may not work
- Performance not optimized

**When to Use**: Local development, quick testing, minimal setup

---

### Option 3: Use In-Memory Cache Alternative

**Pros**:
- No external dependencies
- Works immediately
- Good for development

**Cons**:
- Cache not shared across instances
- Lost on restart
- Not suitable for production

**When to Use**: Development only, single-instance deployments

---

## 🚀 Recommended Implementation Plan

### Phase 1: Make Redis Optional (Immediate Fix)

**Goal**: Stop error messages and make Redis optional for development

#### Step 1.1: Update Cache Service
**File**: `backend/src/cache/cache.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(CacheService.name);
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    // Only attempt Redis connection if explicitly enabled
    const redisEnabled = process.env.REDIS_ENABLED === 'true';
    
    if (!redisEnabled) {
      this.logger.warn('Redis is disabled. Caching features will not be available.');
      return;
    }

    try {
      this.client = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        password: process.env.REDIS_PASSWORD || undefined,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              this.logger.error('Redis connection failed after 3 retries. Disabling Redis.');
              return false; // Stop retrying
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.logger.log('Redis client ready');
      });

      this.client.on('end', () => {
        this.logger.warn('Redis client connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error.message);
      this.client = null;
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error.message);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error.message);
    }
  }

  async flush(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.flushAll();
    } catch (error) {
      this.logger.error('Cache flush error:', error.message);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        this.logger.error('Error disconnecting Redis:', error.message);
      }
    }
  }

  isRedisAvailable(): boolean {
    return this.isConnected;
  }
}
```

#### Step 1.2: Update App Module (Bull Queue)
**File**: `backend/src/app.module.ts`

```typescript
// Add conditional Bull module import
const bullModuleConfig = process.env.REDIS_ENABLED === 'true'
  ? BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false,
      },
    })
  : null;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [stripeConfig],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ...(bullModuleConfig ? [bullModuleConfig] : []),
    CacheModule,
    // ... rest of modules
  ],
})
export class AppModule {}
```

#### Step 1.3: Update Environment Variables
**File**: `backend/.env`

```env
# Redis Configuration
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**File**: `.env.example`

```env
# Redis Configuration (Optional - set to true if Redis is installed)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

### Phase 2: Install Redis (Optional - For Production Features)

#### Option A: Windows Installation

**Method 1: Using WSL2 (Recommended)**
```bash
# Install WSL2 if not already installed
wsl --install

# Inside WSL2
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test connection
redis-cli ping
```

**Method 2: Using Docker**
```bash
# Pull Redis image
docker pull redis:7-alpine

# Run Redis container
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Test connection
docker exec -it redis redis-cli ping
```

**Method 3: Using Memurai (Windows Native)**
```bash
# Download from: https://www.memurai.com/
# Install and run as Windows service
```

#### Option B: Cloud Redis (Production)

**Redis Cloud** (Recommended for production):
1. Sign up at https://redis.com/try-free/
2. Create free database
3. Get connection string
4. Update `.env`:
```env
REDIS_ENABLED=true
REDIS_HOST=your-redis-host.redis.cloud
REDIS_PORT=12345
REDIS_PASSWORD=your-password
```

---

### Phase 3: Testing & Verification

#### Test 1: Without Redis
```bash
# Set in .env
REDIS_ENABLED=false

# Restart backend
cd backend
npm run start:dev

# Expected: No Redis errors, application works
```

#### Test 2: With Redis
```bash
# Start Redis (if installed)
docker run -d -p 6379:6379 redis:7-alpine

# Set in .env
REDIS_ENABLED=true

# Restart backend
npm run start:dev

# Expected: "Redis client connected successfully"
```

#### Test 3: Cache Functionality
```bash
# Test caching endpoint
curl http://localhost:3000/api/landing/statistics

# Check logs for cache hit/miss
```

---

## 📊 Implementation Priority

### Immediate (Do Now)
1. ✅ **Make Redis optional** - Stop error messages
2. ✅ **Update environment variables** - Add REDIS_ENABLED flag
3. ✅ **Graceful degradation** - Application works without Redis

### Short-term (This Week)
4. ⏳ **Install Redis locally** - For testing caching features
5. ⏳ **Test cache functionality** - Verify performance improvements
6. ⏳ **Document Redis setup** - For team members

### Long-term (Production)
7. 📋 **Cloud Redis setup** - For production deployment
8. 📋 **Cache strategy optimization** - TTL, invalidation
9. 📋 **Monitoring & alerts** - Redis health checks

---

## 🔧 Quick Fix Commands

### Stop Redis Errors Immediately
```bash
# Navigate to backend
cd influencer-company-match1/backend

# Create/update .env file
echo REDIS_ENABLED=false >> .env

# Restart backend (will be done in next step)
```

---

## 📝 Files to Modify

1. ✏️ `backend/src/cache/cache.service.ts` - Make Redis optional
2. ✏️ `backend/src/app.module.ts` - Conditional Bull module
3. ✏️ `backend/.env` - Add REDIS_ENABLED=false
4. ✏️ `.env.example` - Document Redis configuration
5. 📄 `README.md` - Add Redis setup instructions (optional)

---

## ✅ Success Criteria

### Phase 1 Complete When:
- ✅ No Redis error messages in console
- ✅ Backend starts successfully
- ✅ Application works without Redis
- ✅ Graceful fallback for caching

### Phase 2 Complete When:
- ✅ Redis installed and running
- ✅ Backend connects to Redis successfully
- ✅ Cache operations working
- ✅ Performance improvements measurable

---

## 🎯 Recommendation

**For Development**: Implement Phase 1 immediately (make Redis optional)
- Stops error messages
- Application works perfectly
- No additional setup required
- Can add Redis later when needed

**For Production**: Implement Phase 1 + Phase 2
- Full caching capabilities
- Better performance
- Background job processing
- Scalable architecture

---

## 📚 Additional Resources

- Redis Windows Installation: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
- Redis Docker: https://hub.docker.com/_/redis
- NestJS Caching: https://docs.nestjs.com/techniques/caching
- Bull Queue: https://docs.nestjs.com/techniques/queues

---

## 🚦 Next Steps

1. **Immediate**: Apply Phase 1 changes to make Redis optional
2. **Test**: Restart backend and verify no errors
3. **Decide**: Choose whether to install Redis now or later
4. **Document**: Update team documentation with Redis setup

**Estimated Time**: 
- Phase 1: 15 minutes
- Phase 2: 30 minutes (if installing Redis)
- Testing: 10 minutes

**Ready to implement Phase 1?** 🚀
