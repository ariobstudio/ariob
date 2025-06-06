import React from 'react';
import { Route, Routes } from 'react-router';

import { DashboardPage } from '@/pages/DashboardPage';
import { HomePage } from '@/pages/HomePage';
import { OnboardingPage } from '@/pages/OnboardingPage';

import { NotFound } from './NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginScreen } from '@/components/LoginScreen';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<HomePage />} />

      {/* Onboarding Page - Public */}
      <Route
        path="/onboarding"
        element={
          <PublicRoute>
            <OnboardingPage />
          </PublicRoute>
        }
      />
      {/* Login Page - Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginScreen />
          </PublicRoute>
        }
      />

      {/* Dashboard - Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
