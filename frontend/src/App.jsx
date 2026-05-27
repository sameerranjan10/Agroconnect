/**
 * AgroConnect - App Router & Layout
 */
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

import Navbar          from './components/Navbar'
import ProtectedRoute  from './components/ProtectedRoute'

import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'
import FarmerDashboardOld from './pages/FarmerDashboard' // Old version fallback
import BuyerMarketplace from './pages/BuyerMarketplace'
import ProductDetails  from './pages/ProductDetails'
import AITools         from './pages/AITools'

// New Role-based Dashboards
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import BuyerDashboard  from './pages/buyer/BuyerDashboard'

// Component to hide navbar on dashboard routes
function AppLayout() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/farmer/dashboard') || location.pathname.includes('/buyer/dashboard');

  return (
    <div className={`min-h-screen flex flex-col ${isDashboardRoute ? 'bg-stone-50 dark:bg-dashboard-bg transition-colors duration-300' : ''}`}>
      {!isDashboardRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/marketplace" element={<BuyerMarketplace />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* New Role-based Dashboards */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute roles={['FARMER']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute roles={['BUYER']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Legacy route redirects */}
          <Route path="/dashboard" element={<Navigate to="/farmer/dashboard" replace />} />
          
          {/* Any authenticated user */}
          <Route
            path="/ai-tools"
            element={
              <ProtectedRoute>
                <AITools />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <span className="text-6xl mb-4">🌾</span>
              <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Page not found</h2>
              <p className="text-stone-400 mb-6">This field hasn't been planted yet.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#292524',
              border: '1px solid #f0d9ad',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#2d9b5a', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
