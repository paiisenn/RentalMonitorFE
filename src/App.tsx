/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useRealtimeSync } from './store/useRealtimeSync';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import TenantDashboard from './pages/tenant/Dashboard';
import TenantRoom from './pages/tenant/Room';
import TenantDevices from './pages/tenant/Devices';
import TenantBills from './pages/tenant/Bills';
import TenantNotifications from './pages/tenant/Notifications';
import TenantSupport from './pages/tenant/Support';

import OwnerDashboard from './pages/owner/Dashboard';
import OwnerRooms from './pages/owner/Rooms';
import OwnerTenants from './pages/owner/Tenants';
import OwnerDevices from './pages/owner/Devices';
import OwnerBills from './pages/owner/Bills';
import OwnerNotifications from './pages/owner/Notifications';

import AdminDashboard from './pages/admin/Dashboard';
import AdminOwners from './pages/admin/Owners';
import AdminAlerts from './pages/admin/Alerts';
import AdminBills from './pages/admin/Bills';

import Settings from './pages/Settings';

import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingScreen } from './components/ui/Loading';

export default function App() {
  const { checkAuth, isInitialLoading } = useAuthStore();
  useRealtimeSync();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <React.Suspense fallback={<LoadingScreen />}>
            <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Tenant Routes */}
        <Route element={<ProtectedRoute allowedRole="tenant" />}>
          <Route path="/tenant" element={<Layout />}>
            <Route index element={<TenantDashboard />} />
            <Route path="room" element={<TenantRoom />} />
            <Route path="devices" element={<TenantDevices />} />
            <Route path="bills" element={<TenantBills />} />
            <Route path="notifications" element={<TenantNotifications />} />
            <Route path="support" element={<TenantSupport />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Owner Routes */}
        <Route element={<ProtectedRoute allowedRole="owner" />}>
          <Route path="/owner" element={<Layout />}>
            <Route index element={<OwnerDashboard />} />
            <Route path="rooms" element={<OwnerRooms />} />
            <Route path="tenants" element={<OwnerTenants />} />
            <Route path="devices" element={<OwnerDevices />} />
            <Route path="bills" element={<OwnerBills />} />
            <Route path="notifications" element={<OwnerNotifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="owners" element={<AdminOwners />} />
            <Route path="rooms" element={<OwnerRooms />} />
            <Route path="devices" element={<OwnerDevices />} />
            <Route path="alerts" element={<AdminAlerts />} />
            <Route path="bills" element={<AdminBills />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
          </React.Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
