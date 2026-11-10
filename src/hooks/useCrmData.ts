import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { activities, customers, deals, leads, notifications, tasks } from '@/store/entities';
import { can } from '@/utils/permissions';


/** Loads every CRM collection once and scopes it to the signed-in user (managers see the whole team). */
export function useCrmData() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const state = useAppSelector((s) => s);

  const load = useCallback(() => {
    dispatch(leads.thunks.fetchAll());
    dispatch(deals.thunks.fetchAll());
    dispatch(customers.thunks.fetchAll());
    dispatch(tasks.thunks.fetchAll());
    dispatch(activities.thunks.fetchAll());
    dispatch(notifications.thunks.fetchAll());
  }, [dispatch]);

  useEffect(() => {
    const anyIdle = [state.leads, state.deals, state.customers, state.tasks, state.activities, state.notifications].some((s) => s.status === 'idle');
    if (anyIdle) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const team = can(user.role, 'team_view');
  const mine = <T extends { ownerId: string }>(items: T[]) => (team ? items : items.filter((i) => i.ownerId === user.id));

  const statuses = [state.leads, state.deals, state.customers, state.tasks, state.activities, state.notifications].map((s) => s.status);
  const loading = statuses.some((s) => s === 'idle' || s === 'loading');
  const failed = statuses.find((s) => s === 'failed');
  const error = [state.leads, state.deals, state.customers, state.tasks, state.activities, state.notifications].find((s) => s.error)?.error ?? null;

  return useMemo(() => ({
    user,
    team,
    loading,
    failed: !!failed,
    error,
    reload: load,
    leads: mine(state.leads.items),
    deals: mine(state.deals.items),
    customers: mine(state.customers.items),
    tasks: mine(state.tasks.items),
    activities: mine(state.activities.items),
    notifications: state.notifications.items.filter((n) => n.ownerId === user.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state.leads, state.deals, state.customers, state.tasks, state.activities, state.notifications, user, loading]);
}
