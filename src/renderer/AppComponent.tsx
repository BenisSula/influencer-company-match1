import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Matches } from './pages/Matches';
import { Profile } from './pages/Profile';
import { ProfileView } from './pages/ProfileView';
import { Messages } from './pages/Messages';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import './styles/global.css';
import './AppComponent.css';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ConnectionProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Matches />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Profile />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProfileView />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Messages />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </ConnectionProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
