# Frontend Architecture Documentation

## Technology Stack

### Core Technologies
- **React 18.2** - UI library with concurrent features
- **TypeScript 5.3** - Type-safe JavaScript
- **Vite 5.0** - Build tool and dev server
- **React Router 7.13** - Client-side routing

### State Management
- **React Query (TanStack Query) 5.90** - Server state management
- **Zustand 4.4** - Client state management
- **React Context API** - Global state for auth, notifications, etc.

### UI & Styling
- **CSS Modules** - Component-scoped styling
- **Lucide React** - Icon library
- **React Icons** - Additional icons
- **Custom CSS** - No UI framework, custom design system

### Data Visualization
- **Recharts 3.7** - Chart library
- **Chart.js 4.5** - Alternative charting
- **React-Chartjs-2** - React wrapper for Chart.js

### Forms & Validation
- **React Hook Form** (via custom hooks) - Form management
- **Custom validators** - Input validation

### Real-time Communication
- **Socket.io Client 4.8** - WebSocket client
- **Custom hooks** - WebSocket state management

### Payment Processing
- **Stripe.js 8.7** - Stripe SDK
- **@stripe/react-stripe-js 5.6** - React Stripe components

### File Handling
- **React Dropzone 15.0** - File upload
- **Sharp** (backend) - Image processing

### PDF Generation
- **@react-pdf/renderer 4.3** - PDF generation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **TypeScript** - Type checking

---

## Project Structure

```
src/renderer/
├── components/          # Reusable UI components
│   ├── Admin*/         # Admin-specific components
│   ├── Auth*/          # Authentication components
│   ├── Landing/        # Landing page components
│   ├── Match*/         # Matching-related components
│   ├── Message*/       # Messaging components
│   ├── Payment*/       # Payment components
│   └── ...             # Other shared components
│
├── pages/              # Page components (routes)
│   ├── admin/          # Admin dashboard pages
│   ├── Landing/        # Landing page
│   └── *.tsx           # Main app pages
│
├── layouts/            # Layout components
│   └── AppLayout/      # Main app layout with sidebar
│
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   ├── NotificationContext.tsx
│   ├── ConnectionContext.tsx
│   ├── ComparisonContext.tsx
│   └── ...
│
├── hooks/              # Custom React hooks
│   ├── admin/          # Admin-specific hooks
│   ├── useAuth.ts
│   ├── useMatches.ts
│   └── ...
│
├── services/           # API client services
│   ├── api-client.ts           # Main API client
│   ├── admin-api-client.ts     # Admin API client
│   ├── auth.service.ts
│   ├── matching.service.ts
│   └── ...
│
├── utils/              # Utility functions
│   ├── animations.ts
│   ├── apiCache.ts
│   ├── imageOptimization.ts
│   └── ...
│
├── types/              # TypeScript type definitions
│   ├── profile.types.ts
│   ├── campaign.types.ts
│   └── ...
│
├── config/             # Configuration files
│   ├── features.ts     # Feature flags
│   └── icons.ts        # Icon mappings
│
├── data/               # Static data
│   └── landing/        # Landing page data
│
├── styles/             # Global styles
│   ├── global.css
│   ├── mobile.css
│   └── admin-common.css
│
└── AppComponent.tsx    # Root app component
```

---

## Architecture Patterns

### Component Architecture

**Atomic Design Principles:**
- **Atoms:** Basic UI elements (Button, Input, Avatar)
- **Molecules:** Simple component groups (SearchBar, Card)
- **Organisms:** Complex components (Header, Sidebar, MatchCard)
- **Templates:** Page layouts (AppLayout)
- **Pages:** Complete pages (Dashboard, Matches)

**Component Structure:**
```typescript
// Component file structure
ComponentName/
├── ComponentName.tsx      # Component logic
├── ComponentName.css      # Component styles
└── index.ts              # Re-export (optional)
```

### State Management Strategy

**Server State (React Query):**
- API data fetching and caching
- Automatic background refetching
- Optimistic updates
- Cache invalidation

```typescript
// Example: Fetching matches
const { data, isLoading, error } = useQuery({
  queryKey: ['matches', filters],
  queryFn: () => matchingService.getMatches(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Client State (Context + Hooks):**
- Authentication state
- UI state (modals, sidebars)
- Notification state
- Comparison state

```typescript
// Example: Auth context
const { user, login, logout, isAuthenticated } = useAuth();
```

**Local State (useState):**
- Form inputs
- Component-specific UI state
- Temporary data

---

## Routing Architecture

### Route Structure

**Public Routes:**
- `/` - Landing page
- `/login` - Login modal over landing
- `/register` - Register modal over landing

**Protected Routes:**
- `/dashboard` - User dashboard
- `/matches` - Browse matches
- `/profile/:id` - View profile
- `/messages` - Messaging
- `/connections` - Manage connections
- `/campaigns` - Campaign management
- `/settings` - User settings

**Admin Routes:**
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/*` - Admin pages

### Route Protection

**ProtectedRoute Component:**
```typescript
<ProtectedRoute>
  <AppLayout>
    <Dashboard />
  </AppLayout>
</ProtectedRoute>
```

**AdminProtectedRoute Component:**
```typescript
<AdminProtectedRoute>
  <AdminDashboard />
</AdminProtectedRoute>
```

**Feature Guards:**
```typescript
<FeatureGuard 
  feature="CAMPAIGNS_ENABLED"
  featureName="Campaigns"
  redirectTo="/matches"
>
  <Campaigns />
</FeatureGuard>
```

### Lazy Loading

All non-critical routes are lazy-loaded:
```typescript
const Matches = lazy(() => 
  import('./pages/Matches').then(m => ({ default: m.Matches }))
);
```

---

## API Integration

### API Client Architecture

**Base API Client** (`api-client.ts`):
- Axios-based HTTP client
- Request/response interceptors
- Authentication token injection
- Error handling
- Retry logic

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Service Layer Pattern:**
Each feature has a dedicated service:
```typescript
// matching.service.ts
export const matchingService = {
  getMatches: (filters) => 
    apiClient.get('/api/matching/matches', { params: filters }),
  
  getMatchById: (id) => 
    apiClient.get(`/api/matching/matches/${id}`),
  
  sendCollaborationRequest: (data) => 
    apiClient.post('/api/matching/requests', data),
};
```

### React Query Integration

**Query Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Custom Hooks:**
```typescript
// useMatches.ts
export const useMatches = (filters) => {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () => matchingService.getMatches(filters),
  });
};

// useSendCollaborationRequest.ts
export const useSendCollaborationRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: matchingService.sendCollaborationRequest,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
};
```

---

## Real-Time Features

### WebSocket Integration

**Socket.io Client Setup:**
```typescript
import io from 'socket.io-client';

const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem('token'),
  },
  transports: ['websocket'],
});
```

**Custom Hooks for WebSocket:**
```typescript
// useMessaging.ts
export const useMessaging = () => {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    socket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      socket.off('message:new');
    };
  }, []);
  
  const sendMessage = (data) => {
    socket.emit('message:send', data);
  };
  
  return { messages, sendMessage };
};
```

**Real-Time Features:**
- Messaging (instant message delivery)
- Notifications (real-time alerts)
- Live user counter (landing page)
- Activity feed (landing page)
- Settings updates (admin dashboard)

---

## Form Handling

### Form Pattern

**Custom Form Hook:**
```typescript
const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { values, errors, isSubmitting, handleChange, handleSubmit };
};
```

### Validation

**Client-Side Validation:**
```typescript
// validators.ts
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[!@#$%^&*]/.test(password);
};
```

---

## Performance Optimization

### Code Splitting

**Route-Based Splitting:**
```typescript
// Automatic code splitting by route
const Matches = lazy(() => import('./pages/Matches'));
```

**Manual Chunks (Vite Config):**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes('/pages/admin/')) return 'admin';
        if (id.includes('/pages/Landing/')) return 'landing';
        if (id.includes('node_modules/react')) return 'vendor-react';
      },
    },
  },
},
```

**Bundle Sizes:**
- Main bundle: ~1.1 MB (341 KB gzipped)
- Admin chunk: 81 KB
- Landing chunk: 116 KB
- Vendor chunks: Separated by library

### Image Optimization

**Lazy Loading:**
```typescript
// useLazyImage.ts
export const useLazyImage = (src) => {
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setImageSrc(src);
        observer.disconnect();
      }
    });
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return [imageSrc, imgRef];
};
```

**Image Optimization Utility:**
```typescript
// imageOptimization.ts
export const optimizeImage = (url, width) => {
  // Add query params for server-side optimization
  return `${url}?w=${width}&q=80&fm=webp`;
};
```

### Caching Strategy

**API Response Caching:**
- React Query automatic caching
- 5-minute stale time for most queries
- Background refetching
- Cache invalidation on mutations

**Asset Caching:**
- Service Worker for PWA
- Static asset caching
- Cache-first strategy for images

**LocalStorage Caching:**
- Branding configuration
- User preferences
- Search history

---

## Error Handling

### Error Boundary

```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// Error handling in services
try {
  const response = await apiClient.get('/api/data');
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error
    throw new Error(error.response.data.message);
  } else if (error.request) {
    // No response received
    throw new Error('Network error. Please check your connection.');
  } else {
    // Request setup error
    throw new Error('An unexpected error occurred.');
  }
}
```

---

## Testing Strategy

### Unit Testing (Vitest)

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Integration Testing

```typescript
// API integration test
describe('Matching Service', () => {
  it('fetches matches with filters', async () => {
    const filters = { niche: 'tech', minScore: 70 };
    const matches = await matchingService.getMatches(filters);
    expect(matches).toHaveLength(10);
    expect(matches[0]).toHaveProperty('compatibilityScore');
  });
});
```

---

## Build & Deployment

### Build Configuration

**Development:**
```bash
npm run dev
# Vite dev server on http://localhost:5173
```

**Production Build:**
```bash
npm run build
# Output: dist/renderer/
```

**Build Optimizations:**
- Tree shaking
- Minification
- Code splitting
- Asset optimization
- Source maps (production)

### Environment Variables

```env
# .env.local
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SOCKET_URL=http://localhost:3000
```

### Deployment Targets

**Recommended Platforms:**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- DigitalOcean App Platform

**Configuration Files:**
- `public/vercel.json` - Vercel config
- `public/_redirects` - Netlify redirects
- `public/.htaccess` - Apache config

---

## Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Automatic token refresh (planned)
- Token expiration handling
- Secure logout

### XSS Prevention
- React's built-in XSS protection
- Sanitize user input
- Content Security Policy headers

### CSRF Protection
- CSRF tokens for state-changing operations
- SameSite cookie attributes

### Data Validation
- Client-side validation
- Server-side validation (primary)
- Type checking with TypeScript

---

## Accessibility

### ARIA Labels
```typescript
<button aria-label="Send message">
  <SendIcon />
</button>
```

### Keyboard Navigation
- Tab order management
- Keyboard shortcuts
- Focus management

### Screen Reader Support
- Semantic HTML
- ARIA attributes
- Alt text for images

---

## Related Documentation
- [Backend Architecture](./05-BACKEND-API.md)
- [Database Schema](./06-DATABASE-SCHEMA.md)
- [Matching Pages](./03-MATCHING-PAGES.md)
- [Admin Dashboard](./02-ADMIN-DASHBOARD.md)
