import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRole?: 'admin' | 'owner' | 'tenant';
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isInitialLoading } = useAuthStore();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Initializing Security Layer...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to their own dashboard if they try to access another role's area
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return <Outlet />;
}
