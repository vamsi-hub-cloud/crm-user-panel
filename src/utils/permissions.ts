import type { Permission, Role } from '@/types';

export const rolePermissions: Record<Role, Permission[]> = {
  manager: ['dashboard', 'leads', 'pipeline', 'customers', 'tasks', 'activities', 'reports', 'notifications', 'profile', 'team_view', 'calendar', 'goals', 'help'],
  sales_rep: ['dashboard', 'leads', 'pipeline', 'customers', 'tasks', 'activities', 'reports', 'notifications', 'profile', 'calendar', 'goals', 'help'],
  employee: ['dashboard', 'leads', 'customers', 'tasks', 'activities', 'notifications', 'profile', 'calendar', 'goals', 'help'],
};

export const can = (role: Role | undefined, p: Permission) => !!role && rolePermissions[role].includes(p);

export const roleLabel: Record<Role, string> = {
  manager: 'Sales Manager',
  sales_rep: 'Sales Representative',
  employee: 'Employee',
};
