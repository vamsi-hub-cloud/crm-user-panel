import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import ui from './uiSlice';
import { activities, customers, deals, leads, notifications, tasks } from './entities';

export const store = configureStore({
  reducer: {
    auth,
    ui,
    leads: leads.slice.reducer,
    deals: deals.slice.reducer,
    customers: customers.slice.reducer,
    tasks: tasks.slice.reducer,
    activities: activities.slice.reducer,
    notifications: notifications.slice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
