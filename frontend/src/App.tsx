import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Recommendations from './pages/Recommendations';
import DemandForecasting from './pages/DemandForecasting';
import AIAssistants from './pages/AIAssistants';
import Team from './pages/Team';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Integrations from './pages/Integrations';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionManagement from './pages/SubscriptionManagement';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import About from './pages/About';
import Contact from './pages/Contact';
import SuperAdminRoute from './components/SuperAdminRoute';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/subscription/plans" element={<SubscriptionPlans />} />
      <Route path="/subscription/success" element={<CheckoutSuccess />} />
      <Route path="/subscription/cancel" element={<CheckoutCancel />} />

      {/* Protected app routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="subscription" element={<SubscriptionManagement />} />
        <Route path="subscription/management" element={<SubscriptionManagement />} />
        <Route path="subscription/plans" element={<SubscriptionPlans />} />
        <Route path="subscription/success" element={<CheckoutSuccess />} />
        <Route path="subscription/cancel" element={<CheckoutCancel />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="demand-forecasting" element={<DemandForecasting />} />
        <Route path="ai-assistants" element={<AIAssistants />} />
        <Route path="team" element={<Team />} />
        <Route
          path="admin"
          element={
            <SuperAdminRoute>
              <AdminDashboard />
            </SuperAdminRoute>
          }
        />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
