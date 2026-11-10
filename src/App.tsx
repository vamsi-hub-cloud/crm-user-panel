import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { PublicOnly, RequireAuth, RequirePending, RequirePermission, RequireResetVerified } from '@/components/layout/Guards';
import { useAppSelector } from '@/hooks/redux';
import Toaster from '@/components/ui/Toaster';
import Activities from '@/pages/Activities';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyOtp from '@/pages/auth/VerifyOtp';
import Calendar from '@/pages/Calendar';
import Goals from '@/pages/Goals';
import Help from '@/pages/Help';
import Team from '@/pages/Team';
import Customers from '@/pages/customers/Customers';
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/leads/Leads';
import Notifications from '@/pages/Notifications';
import Pipeline from '@/pages/Pipeline';
import Profile from '@/pages/Profile';
import Reports from '@/pages/Reports';
import Tasks from '@/pages/Tasks';
import type { Permission } from '@/types';

const guard = (perm: Permission, el: JSX.Element) => <RequirePermission perm={perm}>{el}</RequirePermission>;

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
        <Route path="/verify-otp" element={<VerifyOtpRoute />} />
        <Route path="/reset-password" element={<RequireResetVerified><ResetPassword /></RequireResetVerified>} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={guard('dashboard', <Dashboard />)} />
            <Route path="/leads" element={guard('leads', <Leads />)} />
            <Route path="/pipeline" element={guard('pipeline', <Pipeline />)} />
            <Route path="/customers" element={guard('customers', <Customers />)} />
            <Route path="/tasks" element={guard('tasks', <Tasks />)} />
            <Route path="/activities" element={guard('activities', <Activities />)} />
            <Route path="/reports" element={guard('reports', <Reports />)} />
            <Route path="/notifications" element={guard('notifications', <Notifications />)} />
            <Route path="/calendar" element={guard('calendar', <Calendar />)} />
            <Route path="/goals" element={guard('goals', <Goals />)} />
            <Route path="/team" element={guard('team_view', <Team />)} />
            <Route path="/help" element={guard('help', <Help />)} />
            <Route path="/profile" element={guard('profile', <Profile />)} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

/** OTP works for both the sign-in and the password-reset flow. */
function VerifyOtpRoute() {
  const purpose = useAppSelector((s) => s.auth.pending?.purpose) ?? 'login';
  return <RequirePending purpose={purpose}><VerifyOtp /></RequirePending>;
}
