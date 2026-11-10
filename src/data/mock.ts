import type { Activity, AppNotification, Customer, Deal, Lead, Task, User } from '@/types';

const d = (days: number, hour = 10) => {
  const t = new Date();
  t.setDate(t.getDate() + days);
  t.setHours(hour, 0, 0, 0);
  return t.toISOString();
};

/** Accounts that can sign in. */
export const users: User[] = [
  { id: 'u1', name: 'Arjun Rao', email: 'rep@crm.com', password: 'Password1', role: 'sales_rep', phone: '+91 98765 43210', department: 'Sales', title: 'Senior Sales Executive', location: 'Hyderabad, IN', bio: 'Closing mid-market SaaS deals across South Asia.' },
  { id: 'u2', name: 'Vamsi Krishna', email: 'employee@crm.com', password: 'Password1', role: 'employee', phone: '+91 91234 56780', department: 'Customer Success', title: 'Account Coordinator', location: 'Hyderabad, IN', bio: 'Keeps customer accounts healthy and renewals on track.' },
  { id: 'u3', name: 'Vamsi Krishna', email: 'manager@crm.com', password: 'Password1', role: 'manager', phone: '+91 99887 76655', department: 'Sales', title: 'Regional Sales Manager', location: 'Hyderabad, IN', bio: 'Leads the regional sales team and quarterly targets.' },
];

/** Sales team shown on the leaderboard (managers see their data too). */
export const salesTeam = [
  { id: 'u1', name: 'Arjun Rao', title: 'Senior Sales Executive', target: 250000 },
  { id: 'u3', name: 'Vamsi Krishna', title: 'Regional Sales Manager', target: 300000 },
  { id: 'u4', name: 'Neha Sharma', title: 'Account Executive', target: 220000 },
  { id: 'u5', name: 'Rahul Verma', title: 'Account Executive', target: 200000 },
  { id: 'u6', name: 'Kiran Reddy', title: 'Sales Development Rep', target: 150000 },
];

export const seedCustomers: Customer[] = [
  { id: 'c1', name: 'Daniel Brooks', company: 'Northwind Traders', email: 'daniel@northwind.com', phone: '+1 415 555 0132', location: 'San Francisco, US', status: 'active', since: d(-420), ownerId: 'u1' },
  { id: 'c2', name: 'Priya Menon', company: 'Lumina Health', email: 'priya@luminahealth.in', phone: '+91 98450 11223', location: 'Chennai, IN', status: 'active', since: d(-310), ownerId: 'u1' },
  { id: 'c3', name: 'Lucas Meyer', company: 'Berg & Sohn GmbH', email: 'lucas@bergsohn.de', phone: '+49 30 5550 192', location: 'Berlin, DE', status: 'active', since: d(-205), ownerId: 'u1' },
  { id: 'c4', name: 'Aisha Rahman', company: 'Crescent Logistics', email: 'aisha@crescent.ae', phone: '+971 4 555 0189', location: 'Dubai, AE', status: 'inactive', since: d(-640), ownerId: 'u1' },
  { id: 'c8', name: 'Ishaan Kapoor', company: 'Pixel Forge Studios', email: 'ishaan@pixelforge.in', phone: '+91 98100 33445', location: 'Delhi, IN', status: 'active', since: d(-120), ownerId: 'u1' },
  { id: 'c9', name: 'Sophie Laurent', company: 'Maison Verte', email: 'sophie@maisonverte.fr', phone: '+33 1 5555 0102', location: 'Paris, FR', status: 'active', since: d(-75), ownerId: 'u1' },
  { id: 'c5', name: 'Tom Hughes', company: 'Brightpath Education', email: 'tom@brightpath.co.uk', phone: '+44 20 7946 0958', location: 'London, UK', status: 'active', since: d(-150), ownerId: 'u2' },
  { id: 'c6', name: 'Meera Iyer', company: 'GreenLeaf Foods', email: 'meera@greenleaf.in', phone: '+91 90000 45612', location: 'Pune, IN', status: 'active', since: d(-95), ownerId: 'u2' },
  { id: 'c10', name: 'Zara Ahmed', company: 'Oasis Hospitality', email: 'zara@oasishotels.ae', phone: '+971 2 555 0177', location: 'Abu Dhabi, AE', status: 'active', since: d(-40), ownerId: 'u2' },
  { id: 'c7', name: 'Carlos Ruiz', company: 'Solaris Energy', email: 'carlos@solaris.es', phone: '+34 91 555 0144', location: 'Madrid, ES', status: 'active', since: d(-60), ownerId: 'u3' },
  { id: 'c11', name: 'Yuki Tanaka', company: 'Kaze Robotics', email: 'yuki@kaze.jp', phone: '+81 3 5555 0166', location: 'Tokyo, JP', status: 'active', since: d(-200), ownerId: 'u3' },
  { id: 'c12', name: 'Amara Okafor', company: 'Baobab Fintech', email: 'amara@baobab.ng', phone: '+234 1 555 0121', location: 'Lagos, NG', status: 'inactive', since: d(-330), ownerId: 'u4' },
];

const L = (id: string, name: string, company: string, source: string, status: Lead['status'], value: number, ownerId: string, created: number, notes: string, followUps: Lead['followUps'] = []): Lead => ({
  id, name, company, email: `${name.split(' ')[0].toLowerCase()}@${company.split(' ')[0].toLowerCase()}.com`, phone: `+1 555 ${String(1000 + Number(id.slice(1)) * 37).slice(0, 4)}`, source, status, value, ownerId, createdAt: d(created), notes, followUps,
});

export const seedLeads: Lead[] = [
  L('l1', 'Emily Carter', 'Orbit Systems', 'Website', 'new', 18000, 'u1', -1, 'Requested a demo through the pricing page.', [{ id: 'f1', date: d(1, 11), note: 'Schedule discovery call', done: false }]),
  L('l2', 'Rohan Gupta', 'Zenith Retail', 'Referral', 'contacted', 42000, 'u1', -4, 'Referred by Northwind. Interested in multi-store rollout.', [{ id: 'f2', date: d(0, 15), note: 'Send pricing sheet', done: false }, { id: 'f3', date: d(-2, 10), note: 'Intro call completed', done: true }]),
  L('l3', 'Hannah Schmidt', 'Alpen Mobility', 'LinkedIn', 'qualified', 67000, 'u1', -9, 'Budget confirmed for Q1. Needs security review.', [{ id: 'f4', date: d(2, 14), note: 'Security questionnaire walkthrough', done: false }]),
  L('l4', 'Vikram Shah', 'Kite Analytics', 'Event', 'proposal', 95000, 'u1', -15, 'Proposal sent. Waiting on procurement.', [{ id: 'f5', date: d(-1, 16), note: 'Chase proposal feedback', done: false }]),
  L('l5', 'Grace Lee', 'Harbor Finance', 'Cold outreach', 'won', 54000, 'u1', -30, 'Annual contract signed.'),
  L('l6', 'Omar Siddiqui', 'Delta Freight', 'Website', 'lost', 23000, 'u1', -26, 'Went with an in-house tool.'),
  L('l10', 'Layla Hassan', 'Nile Commerce', 'Partner', 'new', 29000, 'u1', -2, 'Inbound via partner portal.', [{ id: 'f8', date: d(1, 15), note: 'Intro email + deck', done: false }]),
  L('l11', 'Diego Alvarez', 'Sol Mobility', 'LinkedIn', 'contacted', 38000, 'u1', -6, 'Asked for integration docs.', [{ id: 'f9', date: d(3, 10), note: 'Share API documentation', done: false }]),
  L('l12', 'Chloe Martin', 'Bluebird Travel', 'Event', 'qualified', 52000, 'u1', -11, 'Champion identified in ops team.', [{ id: 'f10', date: d(4, 12), note: 'Stakeholder workshop', done: false }]),
  L('l13', 'Sanjay Nair', 'Coral Pharma', 'Referral', 'won', 76000, 'u1', -45, 'Closed after pilot.'),
  L('l7', 'Nina Petrova', 'Volga Media', 'Referral', 'contacted', 31000, 'u2', -5, 'Needs onboarding scope.', [{ id: 'f6', date: d(1, 9), note: 'Share onboarding plan', done: false }]),
  L('l8', 'James Wilson', 'Redwood Builders', 'Event', 'new', 15000, 'u2', -2, ''),
  L('l14', 'Aarav Mehta', 'Spark Edu', 'Website', 'qualified', 24000, 'u2', -8, 'Renewal + upsell opportunity.', [{ id: 'f11', date: d(2, 11), note: 'Upsell call', done: false }]),
  L('l9', 'Fatima Noor', 'Sahara Telecom', 'LinkedIn', 'qualified', 120000, 'u3', -12, 'Enterprise pilot in progress.', [{ id: 'f7', date: d(3, 11), note: 'Pilot review', done: false }]),
  L('l15', 'Hiro Sato', 'Kaze Robotics', 'Partner', 'proposal', 88000, 'u3', -17, 'Expansion proposal under review.', [{ id: 'f12', date: d(5, 14), note: 'Contract redlines', done: false }]),
  L('l16', 'Olivia Brown', 'Lakeside Realty', 'Website', 'won', 41000, 'u4', -20, 'Signed last month.'),
  L('l17', 'Ethan Clark', 'Summit Outdoors', 'Cold outreach', 'contacted', 33000, 'u5', -7, 'Warm response to sequence.'),
  L('l18', 'Mia Rossi', 'Verona Fashion', 'Event', 'proposal', 47000, 'u6', -10, 'Awaiting legal review.'),
];

const D = (id: string, title: string, customerId: string, value: number, stage: Deal['stage'], probability: number, close: number, ownerId: string, created: number): Deal => ({ id, title, customerId, value, stage, probability, closeDate: d(close), ownerId, createdAt: d(created) });

export const seedDeals: Deal[] = [
  D('d1', 'Northwind Platform Renewal', 'c1', 48000, 'negotiation', 75, 12, 'u1', -30),
  D('d2', 'Lumina Health Analytics Add-on', 'c2', 26000, 'proposal', 55, 20, 'u1', -18),
  D('d3', 'Berg & Sohn Expansion', 'c3', 72000, 'qualification', 35, 35, 'u1', -10),
  D('d4', 'Crescent Fleet Module', 'c4', 33000, 'prospecting', 15, 50, 'u1', -6),
  D('d12', 'Pixel Forge Design Suite', 'c8', 29000, 'proposal', 55, 16, 'u1', -9),
  D('d13', 'Maison Verte Retail Portal', 'c9', 44000, 'qualification', 35, 28, 'u1', -7),
  D('d14', 'Northwind Analytics Pack', 'c1', 19000, 'prospecting', 15, 45, 'u1', -3),
  D('d5', 'Harbor Finance Annual Plan', 'c1', 54000, 'won', 100, -8, 'u1', -40),
  D('d6', 'Northwind Training Package', 'c1', 12000, 'won', 100, -40, 'u1', -70),
  D('d7', 'Lumina Pilot', 'c2', 18000, 'won', 100, -70, 'u1', -100),
  D('d15', 'Coral Pharma Rollout', 'c3', 76000, 'won', 100, -22, 'u1', -60),
  D('d16', 'Berg Support Plus', 'c3', 15000, 'won', 100, -95, 'u1', -120),
  D('d8', 'Delta Freight Evaluation', 'c4', 23000, 'lost', 0, -15, 'u1', -45),
  D('d9', 'Brightpath Campus License', 'c5', 39000, 'proposal', 50, 18, 'u2', -14),
  D('d10', 'GreenLeaf Supply Portal', 'c6', 21000, 'prospecting', 20, 40, 'u2', -4),
  D('d17', 'Oasis Guest App', 'c10', 34000, 'negotiation', 70, 14, 'u2', -20),
  D('d18', 'Brightpath Renewal 2025', 'c5', 16000, 'won', 100, -12, 'u2', -50),
  D('d11', 'Solaris Energy Rollout', 'c7', 110000, 'negotiation', 70, 25, 'u3', -22),
  D('d19', 'Kaze Robotics Expansion', 'c11', 88000, 'proposal', 55, 21, 'u3', -17),
  D('d20', 'Solaris Phase 1', 'c7', 64000, 'won', 100, -30, 'u3', -75),
  D('d21', 'Kaze Pilot', 'c11', 52000, 'won', 100, -58, 'u3', -90),
  D('d22', 'Baobab Payments Suite', 'c12', 58000, 'won', 100, -18, 'u4', -48),
  D('d23', 'Baobab Add-on', 'c12', 27000, 'proposal', 50, 24, 'u4', -11),
  D('d24', 'Summit Outdoors POS', 'c1', 31000, 'qualification', 35, 33, 'u5', -9),
  D('d25', 'Verona CRM Rollout', 'c9', 47000, 'negotiation', 70, 15, 'u6', -13),
];

const T = (id: string, title: string, description: string, priority: Task['priority'], status: Task['status'], due: number, ownerId: string, created: number): Task => ({ id, title, description, priority, status, dueDate: d(due), ownerId, createdAt: d(created), completedAt: status === 'done' ? d(due) : undefined });

export const seedTasks: Task[] = [
  T('t1', 'Send revised quote to Northwind', 'Include the volume discount tier discussed on Friday.', 'high', 'todo', 0, 'u1', -3),
  T('t2', 'Prepare demo for Orbit Systems', 'Tailor the demo to their onboarding workflow.', 'medium', 'in_progress', 2, 'u1', -1),
  T('t3', 'Update CRM notes after Kite call', '', 'low', 'todo', -1, 'u1', -4),
  T('t4', 'Renewal reminder for Lumina Health', 'Contract expires next month.', 'high', 'todo', 5, 'u1', -2),
  T('t9', 'Draft proposal for Pixel Forge', 'Three-tier pricing with annual discount.', 'high', 'in_progress', 1, 'u1', -2),
  T('t10', 'Book legal review for Kite contract', '', 'medium', 'todo', 3, 'u1', -1),
  T('t11', 'Send webinar invite to qualified leads', 'Segment: qualified and proposal stages.', 'low', 'todo', 6, 'u1', 0),
  T('t5', 'Book quarterly review with Berg & Sohn', '', 'medium', 'done', -3, 'u1', -9),
  T('t6', 'Share case study with Zenith Retail', '', 'low', 'done', -6, 'u1', -12),
  T('t12', 'Reconcile Q3 commissions', '', 'medium', 'done', -9, 'u1', -14),
  T('t7', 'Onboarding checklist for Brightpath', 'Confirm admin accounts.', 'medium', 'in_progress', 1, 'u2', -2),
  T('t13', 'Collect NPS feedback from GreenLeaf', '', 'low', 'todo', 4, 'u2', -1),
  T('t14', 'Prepare renewal pack for Oasis', 'Include usage report.', 'high', 'todo', 2, 'u2', -2),
  T('t8', 'Review team pipeline forecast', 'Prepare for Monday sync.', 'high', 'todo', 1, 'u3', -1),
  T('t15', 'Approve discount request from Neha', '', 'medium', 'todo', 0, 'u3', -1),
  T('t16', 'One-on-ones with sales reps', '', 'low', 'in_progress', 3, 'u3', -2),
];

const A = (id: string, type: Activity['type'], subject: string, notes: string, day: number, hour: number, duration: number, customerId: string, ownerId: string): Activity => ({ id, type, subject, notes, date: d(day, hour), duration, customerId, ownerId });

export const seedActivities: Activity[] = [
  A('a1', 'call', 'Renewal discussion', 'Daniel confirmed budget. Wants a 3-year option.', -1, 11, 25, 'c1', 'u1'),
  A('a2', 'meeting', 'Quarterly business review', 'Reviewed adoption metrics. Expansion into EU team possible.', -3, 15, 60, 'c3', 'u1'),
  A('a3', 'email', 'Sent analytics add-on proposal', 'Attached pricing and implementation timeline.', -2, 9, 10, 'c2', 'u1'),
  A('a4', 'interaction', 'Support escalation resolved', 'Priya thanked the team for quick turnaround.', -5, 14, 15, 'c2', 'u1'),
  A('a5', 'follow_up', 'Check in after contract expiry', 'No response yet. Try again next week.', -7, 10, 5, 'c4', 'u1'),
  A('a8', 'call', 'Discovery call with Pixel Forge', 'Pain points: manual reporting, slow handoffs.', -4, 12, 35, 'c8', 'u1'),
  A('a9', 'email', 'Shared case study', 'Retail case study sent to Sophie.', -6, 16, 8, 'c9', 'u1'),
  A('a10', 'meeting', 'Product walkthrough for Northwind', 'Live demo of analytics pack. Confirm attendees.', 1, 15, 45, 'c1', 'u1'),
  A('a11', 'meeting', 'Pricing review with Lumina Health', 'Bring updated quote.', 3, 11, 30, 'c2', 'u1'),
  A('a12', 'call', 'Check-in with Maison Verte', 'Scope clarification call.', 2, 17, 20, 'c9', 'u1'),
  A('a6', 'call', 'Onboarding kickoff', 'Agreed on a two-week rollout.', -2, 16, 30, 'c5', 'u2'),
  A('a13', 'meeting', 'Renewal planning with Oasis', 'Agenda: usage, roadmap, pricing.', 2, 13, 40, 'c10', 'u2'),
  A('a7', 'meeting', 'Executive alignment', 'Presented rollout plan to leadership.', -4, 13, 45, 'c7', 'u3'),
  A('a14', 'meeting', 'Weekly pipeline sync', 'Review forecast with the team.', 1, 10, 60, 'c7', 'u3'),
  A('a15', 'call', 'Kaze Robotics contract call', 'Walk through redlines.', 4, 14, 30, 'c11', 'u3'),
];

export const seedNotifications: AppNotification[] = [
  { id: 'n1', type: 'lead', title: 'New lead assigned', message: 'Emily Carter from Orbit Systems was assigned to you.', createdAt: d(0, 8), read: false, ownerId: 'u1' },
  { id: 'n2', type: 'task', title: 'Task due today', message: 'Send revised quote to Northwind is due today.', createdAt: d(0, 7), read: false, ownerId: 'u1' },
  { id: 'n3', type: 'meeting', title: 'Meeting tomorrow', message: 'Product walkthrough for Northwind at 3:00 PM.', createdAt: d(0, 6), read: false, ownerId: 'u1' },
  { id: 'n4', type: 'update', title: 'Deal moved to Negotiation', message: 'Northwind Platform Renewal advanced a stage.', createdAt: d(-2, 12), read: true, ownerId: 'u1' },
  { id: 'n5', type: 'update', title: 'Quarter target updated', message: 'Your Q4 target is now $250,000.', createdAt: d(-6, 9), read: true, ownerId: 'u1' },
  { id: 'n8', type: 'lead', title: 'New lead assigned', message: 'Layla Hassan from Nile Commerce was assigned to you.', createdAt: d(-1, 9), read: true, ownerId: 'u1' },
  { id: 'n6', type: 'lead', title: 'New lead assigned', message: 'James Wilson from Redwood Builders was assigned to you.', createdAt: d(-2, 9), read: false, ownerId: 'u2' },
  { id: 'n9', type: 'meeting', title: 'Meeting in 2 days', message: 'Renewal planning with Oasis at 1:00 PM.', createdAt: d(0, 8), read: false, ownerId: 'u2' },
  { id: 'n7', type: 'task', title: 'Task due tomorrow', message: 'Review team pipeline forecast is due tomorrow.', createdAt: d(0, 7), read: false, ownerId: 'u3' },
  { id: 'n10', type: 'update', title: 'Team hit 82% of quarterly target', message: 'Great momentum. Keep the pipeline moving.', createdAt: d(-1, 18), read: false, ownerId: 'u3' },
];
