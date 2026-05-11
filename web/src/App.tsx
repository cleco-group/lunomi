import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { IndustryProvider } from './contexts/IndustryContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';
import Customer from './pages/Customer';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AdminTools from './pages/AdminTools';
import Booking from './pages/Booking';
import Invoice from './pages/Invoice';
import Loyalty from './pages/Loyalty';
import Product from './pages/Product';
import Tables from './pages/Tables';
import Outlet from './pages/Outlet';
import Supplier from './pages/Supplier';
import Expense from './pages/Expense';
import Purchase from './pages/Purchase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}>
        <div className="text-white/60 text-sm animate-pulse">Memuat...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <SupabaseAuthProvider>
      <IndustryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
            <Route path="/kitchen" element={<ProtectedRoute><Kitchen /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/product" element={<ProtectedRoute><Product /></ProtectedRoute>} />
            <Route path="/customer" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
            <Route path="/loyalty" element={<ProtectedRoute><Loyalty /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
            <Route path="/outlet" element={<ProtectedRoute><Outlet /></ProtectedRoute>} />
            <Route path="/supplier" element={<ProtectedRoute><Supplier /></ProtectedRoute>} />
            <Route path="/expense" element={<ProtectedRoute><Expense /></ProtectedRoute>} />
            <Route path="/purchase" element={<ProtectedRoute><Purchase /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminTools /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: 'rgba(15,23,42,.95)', color: '#fff', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(12px)' } }} />
      </IndustryProvider>
    </SupabaseAuthProvider>
  );
}

export default App;
