import { createEntitySlice } from './createEntitySlice';
import { seedActivities, seedCustomers, seedDeals, seedLeads, seedNotifications, seedTasks } from '@/data/mock';
import type { Activity, AppNotification, Customer, Deal, Lead, Task } from '@/types';

export const leads = createEntitySlice<Lead>('leads', 'l', seedLeads);
export const deals = createEntitySlice<Deal>('deals', 'd', seedDeals);
export const customers = createEntitySlice<Customer>('customers', 'c', seedCustomers);
export const tasks = createEntitySlice<Task>('tasks', 't', seedTasks);
export const activities = createEntitySlice<Activity>('activities', 'a', seedActivities);
export const notifications = createEntitySlice<AppNotification>('notifications', 'n', seedNotifications);
