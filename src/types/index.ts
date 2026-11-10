export type Role = 'manager' | 'sales_rep' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  department: string;
  title: string;
  location: string;
  bio: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export interface FollowUp { id: string; date: string; note: string; done: boolean }
export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  value: number;
  ownerId: string;
  createdAt: string;
  notes: string;
  followUps: FollowUp[];
}

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
export interface Deal {
  id: string;
  title: string;
  customerId: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  ownerId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
  since: string;
  ownerId: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  ownerId: string;
  createdAt: string;
  completedAt?: string;
}

export type ActivityType = 'call' | 'meeting' | 'email' | 'interaction' | 'follow_up';
export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  notes: string;
  date: string;
  duration: number;
  customerId: string;
  ownerId: string;
}

export type NotificationType = 'lead' | 'task' | 'meeting' | 'update';
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  ownerId: string;
}

export type Permission =
  | 'dashboard' | 'leads' | 'pipeline' | 'customers' | 'tasks'
  | 'activities' | 'reports' | 'notifications' | 'profile' | 'team_view'
  | 'calendar' | 'goals' | 'help';
