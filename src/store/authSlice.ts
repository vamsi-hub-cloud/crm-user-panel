import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { request } from '@/services/api';
import { users } from '@/data/mock';
import type { User } from '@/types';

export type PublicUser = Omit<User, 'password'>;
export const DEMO_OTP = '123456';

const PASSWORD_KEY = 'crm_user_v2_passwords';
const SESSION_KEY = 'crm_user_v2_session';

const passwords = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(PASSWORD_KEY) ?? '{}'); } catch { return {}; }
};
const profileOverrides = (): Record<string, Partial<PublicUser>> => {
  try { return JSON.parse(localStorage.getItem('crm_user_v2_profiles') ?? '{}'); } catch { return {}; }
};
const strip = (u: User): PublicUser => {
  const { password: _p, ...rest } = u;
  return { ...rest, ...(profileOverrides()[u.id] ?? {}) };
};
const findByEmail = (email: string) => users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
const currentPassword = (u: User) => passwords()[u.id] ?? u.password;

interface AuthState {
  user: PublicUser | null;
  /** Set after correct credentials, cleared once OTP is verified. */
  pending: { email: string; purpose: 'login' | 'reset' } | null;
  resetVerified: boolean;
  loading: boolean;
  error: string | null;
}

const restore = (): PublicUser | null => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
};

const initialState: AuthState = { user: restore(), pending: null, resetVerified: false, loading: false, error: null };

export const login = createAsyncThunk('auth/login', async (p: { email: string; password: string }) =>
  request(() => {
    const u = findByEmail(p.email);
    if (!u || currentPassword(u) !== p.password) throw new Error('Incorrect email or password');
    return { email: u.email };
  }, 700),
);

export const forgotPassword = createAsyncThunk('auth/forgot', async (email: string) =>
  request(() => {
    if (!findByEmail(email)) throw new Error('No account found with this email');
    return { email: email.trim() };
  }, 700),
);

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (p: { code: string }, { getState }) => {
  const { auth } = getState() as { auth: AuthState };
  return request(() => {
    if (p.code !== DEMO_OTP) throw new Error('That code is not correct. Try again');
    if (!auth.pending) throw new Error('Your session expired. Start again');
    const u = findByEmail(auth.pending.email);
    if (!u) throw new Error('Account not found');
    return { purpose: auth.pending.purpose, user: strip(u) };
  }, 600);
});

export const resetPassword = createAsyncThunk('auth/reset', async (p: { password: string }, { getState }) => {
  const { auth } = getState() as { auth: AuthState };
  return request(() => {
    if (!auth.pending || !auth.resetVerified) throw new Error('Verify your code before setting a new password');
    const u = findByEmail(auth.pending.email);
    if (!u) throw new Error('Account not found');
    localStorage.setItem(PASSWORD_KEY, JSON.stringify({ ...passwords(), [u.id]: p.password }));
    return true;
  }, 700);
});

export const changePassword = createAsyncThunk('auth/changePassword', async (p: { current: string; next: string }, { getState }) => {
  const { auth } = getState() as { auth: AuthState };
  return request(() => {
    const u = users.find((x) => x.id === auth.user?.id);
    if (!u) throw new Error('Not signed in');
    if (currentPassword(u) !== p.current) throw new Error('Current password is incorrect');
    localStorage.setItem(PASSWORD_KEY, JSON.stringify({ ...passwords(), [u.id]: p.next }));
    return true;
  }, 600);
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (p: Partial<PublicUser>, { getState }) => {
  const { auth } = getState() as { auth: AuthState };
  return request(() => {
    if (!auth.user) throw new Error('Not signed in');
    const all = profileOverrides();
    const merged = { ...(all[auth.user.id] ?? {}), ...p };
    localStorage.setItem('crm_user_v2_profiles', JSON.stringify({ ...all, [auth.user.id]: merged }));
    const next = { ...auth.user, ...p };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    return next;
  }, 500);
});

const msg = (a: { error: { message?: string } }) => a.error.message ?? 'Something went wrong';

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null; state.pending = null; state.resetVerified = false;
      localStorage.removeItem(SESSION_KEY);
    },
    clearAuthError(state) { state.error = null; },
    cancelPending(state) { state.pending = null; state.resetVerified = false; },
    setPending(state, a: PayloadAction<AuthState['pending']>) { state.pending = a.payload; },
  },
  extraReducers: (b) => {
    const start = (s: AuthState) => { s.loading = true; s.error = null; };
    const fail = (s: AuthState, a: { error: { message?: string } }) => { s.loading = false; s.error = msg(a); };

    b.addCase(login.pending, start);
    b.addCase(login.fulfilled, (s, a) => { s.loading = false; s.pending = { email: a.payload.email, purpose: 'login' }; });
    b.addCase(login.rejected, fail);

    b.addCase(forgotPassword.pending, start);
    b.addCase(forgotPassword.fulfilled, (s, a) => { s.loading = false; s.pending = { email: a.payload.email, purpose: 'reset' }; s.resetVerified = false; });
    b.addCase(forgotPassword.rejected, fail);

    b.addCase(verifyOtp.pending, start);
    b.addCase(verifyOtp.fulfilled, (s, a) => {
      s.loading = false;
      if (a.payload.purpose === 'login') {
        s.user = a.payload.user; s.pending = null;
        localStorage.setItem(SESSION_KEY, JSON.stringify(a.payload.user));
      } else {
        s.resetVerified = true;
      }
    });
    b.addCase(verifyOtp.rejected, fail);

    b.addCase(resetPassword.pending, start);
    b.addCase(resetPassword.fulfilled, (s) => { s.loading = false; s.pending = null; s.resetVerified = false; });
    b.addCase(resetPassword.rejected, fail);

    b.addCase(changePassword.pending, start);
    b.addCase(changePassword.fulfilled, (s) => { s.loading = false; });
    b.addCase(changePassword.rejected, fail);

    b.addCase(updateProfile.pending, start);
    b.addCase(updateProfile.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; });
    b.addCase(updateProfile.rejected, fail);
  },
});

export const { logout, clearAuthError, cancelPending, setPending } = slice.actions;
export default slice.reducer;
