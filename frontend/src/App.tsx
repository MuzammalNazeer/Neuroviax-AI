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
import CashFlowPrediction from './pages/CashFlowPrediction';
import AnomalyDetection from './pages/AnomalyDetection';
import CustomerSegmentation from './pages/CustomerSegmentation';
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
import AIAssistantsPage from './pages/AIAssistantsPage';
import ABOPLoopPage from './pages/ABOPLoopPage';
import DifferentiatorPage from './pages/DifferentiatorPage';
import PricingPage from './pages/PricingPage';
import FAQPage from './pages/FAQPage';
import SuperAdminRoute from './components/SuperAdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminAuth from './pages/AdminAuth';
import AIChatboardPage from './pages/AIChatboardPage';
import ArchitecturePage from './pages/ArchitecturePage';

const App: React.FC = () => {
  // If running on dedicated admin port (5175), serve the AI Decision Cockpit & Admin Auth directly
  const isDedicatedAdminPort = window.location.port === '5175';

  if (isDedicatedAdminPort) {
    return (
      <Routes>
        <Route path="/login" element={<AdminAuth />} />
        <Route path="/signup" element={<AdminAuth />} />
        <Route path="/register" element={<AdminAuth />} />
        <Route path="/auth" element={<AdminAuth />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Standalone Admin Cockpit & Auth routes */}
      <Route
        path="/admin"
        element={
          <SuperAdminRoute>
            <AdminDashboard />
          </SuperAdminRoute>
        }
      />
      <Route path="/admin/login" element={<AdminAuth />} />
      <Route path="/admin/signup" element={<AdminAuth />} />

      {/* Public website separated routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/assistants" element={<AIAssistantsPage />} />
      <Route path="/ai-assistants-overview" element={<AIAssistantsPage />} />
      <Route path="/abop-loop" element={<ABOPLoopPage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="/system-architecture" element={<ArchitecturePage />} />
      <Route path="/differentiator" element={<DifferentiatorPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/chatboard" element={<AIChatboardPage />} />
      <Route path="/copilot" element={<AIChatboardPage />} />
      <Route path="/ai-chatboard" element={<AIChatboardPage />} />
      <Route path="/subscription/plans" element={<PricingPage />} />
      <Route path="/subscription/success" element={<CheckoutSuccess />} />
      <Route path="/subscription/cancel" element={<CheckoutCancel />} />

      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected ERP app routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/subscription" element={<SubscriptionManagement />} />
        <Route path="/subscription/management" element={<SubscriptionManagement />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/demand-forecasting" element={<DemandForecasting />} />
        <Route path="/cash-flow-prediction" element={<CashFlowPrediction />} />
        <Route path="/anomaly-detection" element={<AnomalyDetection />} />
        <Route path="/customer-segmentation" element={<CustomerSegmentation />} />
        <Route path="/ai-assistants" element={<AIAssistants />} />
        <Route path="/team" element={<Team />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
