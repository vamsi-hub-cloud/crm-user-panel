import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { uid } from '@/utils/format';

export interface Toast { id: string; kind: 'success' | 'error' | 'info'; message: string }
interface UiState { toasts: Toast[]; sidebarOpen: boolean }

const slice = createSlice({
  name: 'ui',
  initialState: { toasts: [], sidebarOpen: false } as UiState,
  reducers: {
    pushToast: {
      reducer(s, a: PayloadAction<Toast>) { s.toasts.push(a.payload); },
      prepare(kind: Toast['kind'], message: string) { return { payload: { id: uid('toast'), kind, message } }; },
    },
    dismissToast(s, a: PayloadAction<string>) { s.toasts = s.toasts.filter((t) => t.id !== a.payload); },
    setSidebar(s, a: PayloadAction<boolean>) { s.sidebarOpen = a.payload; },
  },
});

export const { pushToast, dismissToast, setSidebar } = slice.actions;
export default slice.reducer;
