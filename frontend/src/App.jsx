/**
 * AgroConnect - App Router & Layout
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

import Navbar          from './components/Navbar'
import ProtectedRoute  from './components/ProtectedRoute'

import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerMarketplace from './pages/BuyerMarketplace'
import ProductDetails  from './pages/ProductDetails'
import AITools         from './pages/AITools'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/"            element={<Home />} />
              <Route path="/login"       element={<Login />} />
              <Route path="/register"    element={<Register />} />
              <Route path="/marketplace" element={<BuyerMarketplace />} />
              <Route path="/products/:id" element={<ProductDetails />} />

              {/* Farmer-only */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['FARMER']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />

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
