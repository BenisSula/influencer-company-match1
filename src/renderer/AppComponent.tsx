import { lazy, Suspense, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { FeatureGuard } from './components/FeatureGuard/FeatureGuard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ChatbotWidget } from './components/ChatbotWidget/ChatbotWidget';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { SettingsSocketProvider } from './components/SettingsSocketProvider/SettingsSocketProvider';
import { registerServiceWorker } from './utils/pwa';
import { applyBranding, loadCachedBranding, getCurrentTenantId } from './utils/applyBranding';
import adminBrandingService from './services/admin-branding.service';
import { setNavigateHandler } from './services/api-client';
import { setAdminNavigateHandler } from './services/admin-api-client';
import './styles/global.css';
import './styles/mobile.css';
import './AppComponent.css';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Eager load critical routes (auth pages and landing)
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing/Landing';

// Admin routes (lazy load to reduce initial bundle)
import { AdminProtectedRoute } from './components/AdminProtectedRoute/AdminProtectedRoute';
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminBranding = lazy(() => import('./pages/admin/AdminBranding'));
const AdminFeatureFlags = lazy(() => import('./pages/admin/AdminFeatureFlags'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTenants = lazy(() => import('./pages/admin/AdminTenants'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminModeration = lazy(() => import('./pages/admin/AdminModeration'));
const AdminSystemSettings = lazy(() => import('./pages/admin/AdminSystemSettings'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));

// Lazy load non-critical routes for better performance
const Matches = lazy(() => import('./pages/Matches').then(m => ({ default: m.Matches })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit').then(m => ({ default: m.ProfileEdit })));
const ProfileView = lazy(() => import('./pages/ProfileView').then(m => ({ default: m.ProfileView })));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup').then(m => ({ default: m.ProfileSetup })));
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const Connections = lazy(() => import('./pages/Connections').then(m => ({ default: m.Connections })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Feed = lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const SavedItems = lazy(() => import('./pages/SavedItems').then(m => ({ default: m.SavedItems })));
const Campaigns = lazy(() => import('./pages/Campaigns').then(m => ({ default: m.Campaigns })));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign').then(m => ({ default: m.CreateCampaign })));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail').then(m => ({ default: m.CampaignDetail })));
const MatchHistory = lazy(() => import('./pages/MatchHistory'));
const MatchComparison = lazy(() => import('./components/MatchComparison/MatchComparison').then(m => ({ default: m.MatchComparison })));
const PaymentCheckout = lazy(() => import('./pages/PaymentCheckout').then(m => ({ default: m.PaymentCheckout })));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const OnboardingCompany = lazy(() => import('./pages/OnboardingCompany').then(m => ({ default: m.OnboardingCompany })));
const OnboardingInfluencer = lazy(() => import('./pages/OnboardingInfluencer').then(m => ({ default: m.OnboardingInfluencer })));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <LoadingSpinner fullScreen text="Loading..." />
);

// Chatbot visibility wrapper
const ChatbotWrapper = () => {
  const location = useLocation();
  
  // Hide chatbot on specific routes
  const hideChatbot = [
    '/admin',
    '/messages', // Avoid conflict with messaging page
  ].some(path => location.pathname.startsWith(path));

  if (hideChatbot) return null;
  
  return <ChatbotWidget />;
};

// Navigation setup component - sets up handlers for API clients
const NavigationSetter = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set up navigation handlers for API clients
    // This enables SPA navigation instead of full page reloads
    setNavigateHandler((path: string) => {
      navigate(path, { replace: true });
    });
    setAdminNavigateHandler((path: string) => {
      navigate(path, { replace: true });
    });
    
    console.log('[App] Navigation handlers set up');
  }, [navigate]);
  
  return null;
};

export default function App() {
  // Register service worker for PWA
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
  }, []);

  // Load and apply tenant-specific branding
  useEffect(() => {
    // First, apply cached branding immediately (prevents flash of unstyled content)
    const cached = loadCachedBranding();
    
    // Then fetch fresh branding from API
    const loadBranding = async () => {
      try {
        const tenantId = getCurrentTenantId();
        console.log('Loading branding for tenant:', tenantId);
        
        const branding = await adminBrandingService.getBranding();
        if (branding) {
          // Only apply if different from cached to avoid unnecessary DOM updates
          if (JSON.stringify(branding) !== JSON.stringify(cached)) {
            applyBranding(branding);
            console.log('Fresh branding applied');
          }
        }
      } catch (error) {
        console.log('Using default branding (API not available or not authenticated)');
      }
    };
    
    loadBranding();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsSocketProvider>
          <AuthProvider>
            <ToastProvider>
              <ConnectionProvider>
                <NotificationProvider>
                  <ComparisonProvider>
                    <BrowserRouter>
                      <NavigationSetter />
                      <Routes>
                    {/* Public landing page */}
                    <Route path="/" element={<Landing />} />
                    
                    {/* Public auth routes - Show as modal over landing page */}
                    <Route path="/login" element={<Landing initialAuthMode="login" />} />
                    <Route path="/register" element={<Landing initialAuthMode="register" />} />

                    {/* Admin routes - Lazy loaded to reduce initial bundle */}
                    <Route 
                      path="/admin/login" 
                      element={
                        <Suspense fallback={<PageLoader />}>
                          <AdminLogin />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="/admin/dashboard" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminDashboard />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/users" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminUsers />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/tenants" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminTenants />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/payments" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminPayments />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/analytics" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminAnalytics />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/moderation" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminModeration />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/settings" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminSystemSettings />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/branding" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminBranding />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/features" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminFeatureFlags />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/reviews" 
                      element={
                        <AdminProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <AdminReviews />
                          </Suspense>
                        </AdminProtectedRoute>
                      } 
                    />

                  {/* Profile setup (optional - users can access anytime) */}
                  <Route
                    path="/profile-setup"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                          <ProfileSetup />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes - Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Dashboard />
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  {/* Legacy /app route - redirect to /dashboard */}
                  <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <Feed />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <FeatureGuard 
                            feature="SAVED_ITEMS_ENABLED" 
                            featureName="Saved Items"
                            redirectTo="/feed"
                            redirectText="View Feed"
                          >
                            <Suspense fallback={<PageLoader />}>
                              <SavedItems />
                            </Suspense>
                          </FeatureGuard>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <Matches />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches/compare"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <MatchComparison />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches/history"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <FeatureGuard 
                            feature="MATCH_HISTORY_ENABLED" 
                            featureName="Match History & Analytics"
                            redirectTo="/matches"
                            redirectText="View Matches"
                          >
                            <Suspense fallback={<PageLoader />}>
                              <MatchHistory />
                            </Suspense>
                          </FeatureGuard>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <Profile />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/edit"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <ProfileEdit />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/:id"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <ProfileView />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <Messages />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/connections"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <Connections />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Suspense fallback={<PageLoader />}>
                            <Settings />
                          </Suspense>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <FeatureGuard 
                            feature="CAMPAIGNS_ENABLED" 
                            featureName="Campaigns"
                            redirectTo="/matches"
                            redirectText="Discover Matches"
                          >
                            <Suspense fallback={<PageLoader />}>
                              <Campaigns />
                            </Suspense>
                          </FeatureGuard>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns/create"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <FeatureGuard 
                            feature="CAMPAIGNS_ENABLED" 
                            featureName="Create Campaign"
                            redirectTo="/matches"
                            redirectText="Discover Matches"
                          >
                            <Suspense fallback={<PageLoader />}>
                              <CreateCampaign />
                            </Suspense>
                          </FeatureGuard>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns/:id"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <FeatureGuard 
                            feature="CAMPAIGNS_ENABLED" 
                            featureName="Campaign Details"
                            redirectTo="/matches"
                            redirectText="Discover Matches"
                          >
                            <Suspense fallback={<PageLoader />}>
                              <CampaignDetail />
                            </Suspense>
                          </FeatureGuard>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Payment routes */}
                  <Route
                    path="/payments/checkout/:collaborationId"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                          <PaymentCheckout />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payments/success"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                          <PaymentSuccess />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Onboarding routes */}
                  <Route
                    path="/onboarding/company"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                          <OnboardingCompany />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/influencer"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoader />}>
                          <OnboardingInfluencer />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/refresh"
                    element={
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '100vh',
                        flexDirection: 'column',
                        gap: '20px'
                      }}>
                        <h2>Onboarding Refresh</h2>
                        <p>Please complete your onboarding setup.</p>
                        <button onClick={() => window.location.href = '/onboarding/influencer'}>
                          Continue Setup
                        </button>
                      </div>
                    }
                  />
                  <Route
                    path="/onboarding/complete"
                    element={
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '100vh',
                        flexDirection: 'column',
                        gap: '20px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '48px', color: '#4caf50' }}>✓</div>
                        <h2>Onboarding Complete!</h2>
                        <p>Your payout account has been successfully set up.</p>
                        <button 
                          onClick={() => window.location.href = '/dashboard'}
                          style={{
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          Go to Dashboard
                        </button>
                      </div>
                    }
                  />

                  {/* Catch all - redirect to landing page */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* AI Chatbot Widget - Shows on all pages except admin and messages */}
                <ChatbotWrapper />
              </BrowserRouter>
            </ComparisonProvider>
          </NotificationProvider>
        </ConnectionProvider>
      </ToastProvider>
    </AuthProvider>
    </SettingsSocketProvider>
  </QueryClientProvider>
</ErrorBoundary>
);
}
