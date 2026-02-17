-- ============================================================================
-- ProductivityOS — Seed Data
-- ============================================================================
-- This file populates the database with a demo organization, sample users,
-- projects, tasks, channels, messages, documents, dashboards, and KPIs.
--
-- NOTE: Because profiles are normally created via the auth.users trigger,
-- we insert directly into profiles here for seeding purposes.
-- ============================================================================

-- ============================================================================
-- 1. DEMO USERS (profiles)
-- ============================================================================

INSERT INTO public.profiles (id, full_name, avatar_url) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Alice Johnson',  'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'Bob Martinez',   'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
  ('a1b2c3d4-0001-4000-8000-000000000003', 'Carol Chen',     'https://api.dicebear.com/7.x/avataaars/svg?seed=carol'),
  ('a1b2c3d4-0001-4000-8000-000000000004', 'David Park',     'https://api.dicebear.com/7.x/avataaars/svg?seed=david'),
  ('a1b2c3d4-0001-4000-8000-000000000005', 'Eva Rossi',      'https://api.dicebear.com/7.x/avataaars/svg?seed=eva');

-- ============================================================================
-- 2. DEMO ORGANIZATION
-- ============================================================================

INSERT INTO public.organizations (id, name, slug, plan) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'Acme Corp', 'acme-corp', 'pro');

-- Point profiles to their current org
UPDATE public.profiles
  SET current_organization_id = 'b2c3d4e5-0001-4000-8000-000000000001'
  WHERE id IN (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000003',
    'a1b2c3d4-0001-4000-8000-000000000004',
    'a1b2c3d4-0001-4000-8000-000000000005'
  );

-- ============================================================================
-- 3. ORGANIZATION MEMBERS
-- ============================================================================

INSERT INTO public.organization_members (organization_id, user_id, role) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'owner'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000002', 'admin'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000003', 'member'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000004', 'member'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000005', 'guest');

-- ============================================================================
-- 4. PROJECTS
-- ============================================================================

INSERT INTO public.projects (id, organization_id, name, description, color, status, created_by) VALUES
  (
    'c3d4e5f6-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Website Redesign',
    'Complete overhaul of the company marketing website with new branding.',
    '#6366f1',
    'active',
    'a1b2c3d4-0001-4000-8000-000000000001'
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000002',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Mobile App v2',
    'Second major release of the mobile application with offline support.',
    '#f59e0b',
    'active',
    'a1b2c3d4-0001-4000-8000-000000000002'
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000003',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Q1 Marketing Campaign',
    'Multi-channel marketing push for the first quarter.',
    '#10b981',
    'active',
    'a1b2c3d4-0001-4000-8000-000000000003'
  );

-- Project members
INSERT INTO public.project_members (project_id, user_id, role) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'admin'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000002', 'member'),
  ('c3d4e5f6-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000003', 'member'),
  ('c3d4e5f6-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000002', 'admin'),
  ('c3d4e5f6-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000004', 'member'),
  ('c3d4e5f6-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000003', 'admin'),
  ('c3d4e5f6-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000005', 'member');

-- ============================================================================
-- 5. TASKS
-- ============================================================================

INSERT INTO public.tasks (id, project_id, organization_id, title, description, status, priority, assignee_id, reporter_id, due_date, position, labels, estimated_hours) VALUES
  -- Website Redesign tasks
  (
    'd4e5f6a7-0001-4000-8000-000000000001',
    'c3d4e5f6-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Design new homepage wireframes',
    'Create low-fidelity wireframes for the new homepage layout.',
    'done',
    'high',
    'a1b2c3d4-0001-4000-8000-000000000003',
    'a1b2c3d4-0001-4000-8000-000000000001',
    now() + interval '7 days',
    1000,
    ARRAY['design', 'homepage'],
    8
  ),
  (
    'd4e5f6a7-0001-4000-8000-000000000002',
    'c3d4e5f6-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Implement responsive navigation',
    'Build the new responsive navbar component using Tailwind CSS.',
    'in_progress',
    'high',
    'a1b2c3d4-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000001',
    now() + interval '10 days',
    2000,
    ARRAY['frontend', 'navigation'],
    12
  ),
  (
    'd4e5f6a7-0001-4000-8000-000000000003',
    'c3d4e5f6-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Set up CI/CD pipeline',
    'Configure GitHub Actions for automated testing and deployment.',
    'todo',
    'medium',
    'a1b2c3d4-0001-4000-8000-000000000004',
    'a1b2c3d4-0001-4000-8000-000000000002',
    now() + interval '14 days',
    3000,
    ARRAY['devops'],
    6
  ),
  (
    'd4e5f6a7-0001-4000-8000-000000000004',
    'c3d4e5f6-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Write SEO meta tags',
    'Add proper meta tags and Open Graph data to all pages.',
    'todo',
    'low',
    NULL,
    'a1b2c3d4-0001-4000-8000-000000000001',
    now() + interval '21 days',
    4000,
    ARRAY['seo', 'content'],
    3
  ),
  -- Mobile App v2 tasks
  (
    'd4e5f6a7-0001-4000-8000-000000000005',
    'c3d4e5f6-0001-4000-8000-000000000002',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Implement offline data sync',
    'Use SQLite and a sync queue to allow offline task creation.',
    'in_progress',
    'urgent',
    'a1b2c3d4-0001-4000-8000-000000000004',
    'a1b2c3d4-0001-4000-8000-000000000002',
    now() + interval '5 days',
    1000,
    ARRAY['mobile', 'offline', 'backend'],
    20
  ),
  (
    'd4e5f6a7-0001-4000-8000-000000000006',
    'c3d4e5f6-0001-4000-8000-000000000002',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Push notification service',
    'Integrate Firebase Cloud Messaging for real-time push notifications.',
    'todo',
    'high',
    'a1b2c3d4-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000002',
    now() + interval '12 days',
    2000,
    ARRAY['mobile', 'notifications'],
    10
  ),
  -- Q1 Marketing tasks
  (
    'd4e5f6a7-0001-4000-8000-000000000007',
    'c3d4e5f6-0001-4000-8000-000000000003',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Draft blog post series',
    'Write 4 blog posts about productivity tips for remote teams.',
    'in_review',
    'medium',
    'a1b2c3d4-0001-4000-8000-000000000005',
    'a1b2c3d4-0001-4000-8000-000000000003',
    now() + interval '3 days',
    1000,
    ARRAY['content', 'blog'],
    16
  ),
  (
    'd4e5f6a7-0001-4000-8000-000000000008',
    'c3d4e5f6-0001-4000-8000-000000000003',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Design social media assets',
    'Create branded visuals for LinkedIn, Twitter, and Instagram.',
    'todo',
    'medium',
    'a1b2c3d4-0001-4000-8000-000000000003',
    'a1b2c3d4-0001-4000-8000-000000000003',
    now() + interval '8 days',
    2000,
    ARRAY['design', 'social'],
    10
  );

-- A sub-task example
INSERT INTO public.tasks (id, project_id, organization_id, title, status, priority, assignee_id, reporter_id, position, parent_task_id) VALUES
  (
    'd4e5f6a7-0001-4000-8000-000000000009',
    'c3d4e5f6-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Mobile nav hamburger menu animation',
    'todo',
    'medium',
    'a1b2c3d4-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000001',
    2100,
    'd4e5f6a7-0001-4000-8000-000000000002'
  );

-- ============================================================================
-- 6. TASK COMMENTS
-- ============================================================================

INSERT INTO public.task_comments (task_id, user_id, content) VALUES
  ('d4e5f6a7-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Let''s make sure this works on tablets too. Check iPad breakpoints.'),
  ('d4e5f6a7-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000002', 'Good point. I''ll add a 1024px breakpoint as well.'),
  ('d4e5f6a7-0001-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000002', 'This is the most critical feature for v2. Prioritising accordingly.'),
  ('d4e5f6a7-0001-4000-8000-000000000007', 'a1b2c3d4-0001-4000-8000-000000000003', 'Draft is ready for review. Please check the tone and accuracy.');

-- ============================================================================
-- 7. CHANNELS
-- ============================================================================

INSERT INTO public.channels (id, organization_id, name, description, type, created_by) VALUES
  (
    'e5f6a7b8-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'general',
    'Company-wide announcements and general discussion.',
    'public',
    'a1b2c3d4-0001-4000-8000-000000000001'
  ),
  (
    'e5f6a7b8-0001-4000-8000-000000000002',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'engineering',
    'Technical discussions, code reviews, and architecture decisions.',
    'public',
    'a1b2c3d4-0001-4000-8000-000000000002'
  ),
  (
    'e5f6a7b8-0001-4000-8000-000000000003',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'design',
    'Design reviews, asset sharing, and UI/UX discussion.',
    'public',
    'a1b2c3d4-0001-4000-8000-000000000003'
  ),
  (
    'e5f6a7b8-0001-4000-8000-000000000004',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'leadership',
    'Private channel for org leadership.',
    'private',
    'a1b2c3d4-0001-4000-8000-000000000001'
  );

-- Channel members
INSERT INTO public.channel_members (channel_id, user_id) VALUES
  -- general: everyone
  ('e5f6a7b8-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('e5f6a7b8-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000002'),
  ('e5f6a7b8-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000003'),
  ('e5f6a7b8-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000004'),
  ('e5f6a7b8-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000005'),
  -- engineering
  ('e5f6a7b8-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('e5f6a7b8-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000002'),
  ('e5f6a7b8-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000004'),
  -- design
  ('e5f6a7b8-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000003'),
  ('e5f6a7b8-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000005'),
  -- leadership (private)
  ('e5f6a7b8-0001-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('e5f6a7b8-0001-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000002');

-- ============================================================================
-- 8. MESSAGES
-- ============================================================================

INSERT INTO public.messages (id, channel_id, user_id, content) VALUES
  (
    'f6a7b8c9-0001-4000-8000-000000000001',
    'e5f6a7b8-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Welcome to ProductivityOS! This is our general channel for company-wide updates.'
  ),
  (
    'f6a7b8c9-0001-4000-8000-000000000002',
    'e5f6a7b8-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000002',
    'Excited to be here! Looking forward to shipping great things together.'
  ),
  (
    'f6a7b8c9-0001-4000-8000-000000000003',
    'e5f6a7b8-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000002',
    'Just pushed the new auth module. Please pull latest and run migrations.'
  ),
  (
    'f6a7b8c9-0001-4000-8000-000000000004',
    'e5f6a7b8-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000004',
    'On it. Any breaking changes to the API routes?'
  ),
  -- threaded reply
  (
    'f6a7b8c9-0001-4000-8000-000000000005',
    'e5f6a7b8-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000002',
    'Nope, fully backward-compatible. Just new endpoints added.',
    'f6a7b8c9-0001-4000-8000-000000000004'
  ),
  (
    'f6a7b8c9-0001-4000-8000-000000000006',
    'e5f6a7b8-0001-4000-8000-000000000003',
    'a1b2c3d4-0001-4000-8000-000000000003',
    'Uploaded the new brand assets to the shared drive. Check the #design folder.'
  );

-- Fix the threaded reply (need explicit column for parent_message_id)
UPDATE public.messages
  SET parent_message_id = 'f6a7b8c9-0001-4000-8000-000000000004'
  WHERE id = 'f6a7b8c9-0001-4000-8000-000000000005';

-- ============================================================================
-- 9. REACTIONS
-- ============================================================================

INSERT INTO public.reactions (message_id, user_id, emoji) VALUES
  ('f6a7b8c9-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000002', '👋'),
  ('f6a7b8c9-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000003', '🎉'),
  ('f6a7b8c9-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000004', '👍'),
  ('f6a7b8c9-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001', '🚀');

-- ============================================================================
-- 10. FOLDERS & DOCUMENTS
-- ============================================================================

INSERT INTO public.folders (id, organization_id, name, parent_folder_id) VALUES
  ('a7b8c9d0-0001-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', 'Engineering', NULL),
  ('a7b8c9d0-0001-4000-8000-000000000002', 'b2c3d4e5-0001-4000-8000-000000000001', 'Design', NULL),
  ('a7b8c9d0-0001-4000-8000-000000000003', 'b2c3d4e5-0001-4000-8000-000000000001', 'Architecture Decisions', 'a7b8c9d0-0001-4000-8000-000000000001');

INSERT INTO public.documents (id, organization_id, title, content, folder_id, created_by, tags) VALUES
  (
    'b8c9d0e1-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'API Design Guidelines',
    '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "API Design Guidelines"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "This document outlines our REST API conventions."}]}]}',
    'a7b8c9d0-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000002',
    ARRAY['engineering', 'api', 'guidelines']
  ),
  (
    'b8c9d0e1-0001-4000-8000-000000000002',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Brand Identity Spec',
    '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "Brand Identity"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Primary color: #6366f1. Font: Inter."}]}]}',
    'a7b8c9d0-0001-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000003',
    ARRAY['design', 'brand']
  ),
  (
    'b8c9d0e1-0001-4000-8000-000000000003',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'ADR-001: Use Supabase for Backend',
    '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "ADR-001"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "We will use Supabase as our backend platform for auth, database, and real-time."}]}]}',
    'a7b8c9d0-0001-4000-8000-000000000003',
    'a1b2c3d4-0001-4000-8000-000000000001',
    ARRAY['engineering', 'adr', 'architecture']
  );

-- ============================================================================
-- 11. DASHBOARDS & WIDGETS
-- ============================================================================

INSERT INTO public.dashboards (id, organization_id, name, layout, created_by) VALUES
  (
    'c9d0e1f2-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Engineering Overview',
    '[{"i": "w1", "x": 0, "y": 0, "w": 6, "h": 4}, {"i": "w2", "x": 6, "y": 0, "w": 6, "h": 4}]',
    'a1b2c3d4-0001-4000-8000-000000000001'
  );

INSERT INTO public.dashboard_widgets (id, dashboard_id, type, config, position) VALUES
  (
    'd0e1f2a3-0001-4000-8000-000000000001',
    'c9d0e1f2-0001-4000-8000-000000000001',
    'task_status_breakdown',
    '{"project_id": "c3d4e5f6-0001-4000-8000-000000000001", "chart_type": "pie"}',
    '{"x": 0, "y": 0, "w": 6, "h": 4}'
  ),
  (
    'd0e1f2a3-0001-4000-8000-000000000002',
    'c9d0e1f2-0001-4000-8000-000000000001',
    'tasks_by_assignee',
    '{"project_id": "c3d4e5f6-0001-4000-8000-000000000001", "chart_type": "bar"}',
    '{"x": 6, "y": 0, "w": 6, "h": 4}'
  );

-- ============================================================================
-- 12. KPIs & ENTRIES
-- ============================================================================

INSERT INTO public.kpis (id, organization_id, name, description, target_value, current_value, unit, category, tracking_period) VALUES
  (
    'e1f2a3b4-0001-4000-8000-000000000001',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Sprint Velocity',
    'Average story points completed per sprint.',
    40,
    34,
    'points',
    'Engineering',
    'weekly'
  ),
  (
    'e1f2a3b4-0001-4000-8000-000000000002',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Customer Satisfaction',
    'Average CSAT score from support tickets.',
    4.5,
    4.2,
    'score',
    'Support',
    'monthly'
  ),
  (
    'e1f2a3b4-0001-4000-8000-000000000003',
    'b2c3d4e5-0001-4000-8000-000000000001',
    'Monthly Active Users',
    'Number of unique users active in the past 30 days.',
    10000,
    7850,
    'users',
    'Product',
    'monthly'
  );

INSERT INTO public.kpi_entries (kpi_id, value, recorded_at, notes) VALUES
  ('e1f2a3b4-0001-4000-8000-000000000001', 28, now() - interval '21 days', 'Sprint 1 — ramp-up phase'),
  ('e1f2a3b4-0001-4000-8000-000000000001', 32, now() - interval '14 days', 'Sprint 2 — improving'),
  ('e1f2a3b4-0001-4000-8000-000000000001', 34, now() - interval '7 days',  'Sprint 3 — on track'),
  ('e1f2a3b4-0001-4000-8000-000000000002', 4.0, now() - interval '30 days', 'January score'),
  ('e1f2a3b4-0001-4000-8000-000000000002', 4.2, now(), 'February score — slight improvement'),
  ('e1f2a3b4-0001-4000-8000-000000000003', 6200, now() - interval '30 days', 'January MAU'),
  ('e1f2a3b4-0001-4000-8000-000000000003', 7850, now(), 'February MAU — strong growth');

-- ============================================================================
-- 13. AI INSIGHTS (sample)
-- ============================================================================

INSERT INTO public.ai_insights (organization_id, type, content, related_entity_type, related_entity_id) VALUES
  (
    'b2c3d4e5-0001-4000-8000-000000000001',
    'productivity_trend',
    '{"title": "Sprint velocity is trending upward", "summary": "Your team completed 21% more story points this sprint compared to three sprints ago. The Website Redesign project is the largest contributor.", "recommendation": "Consider increasing sprint commitments by 10% next cycle."}',
    'project',
    'c3d4e5f6-0001-4000-8000-000000000001'
  ),
  (
    'b2c3d4e5-0001-4000-8000-000000000001',
    'bottleneck_alert',
    '{"title": "Review bottleneck detected", "summary": "3 tasks have been in the in_review status for more than 5 days in the Q1 Marketing Campaign project.", "recommendation": "Assign dedicated reviewers or schedule a review session."}',
    'project',
    'c3d4e5f6-0001-4000-8000-000000000003'
  );

-- ============================================================================
-- 14. ACTIVITY LOG (sample entries)
-- ============================================================================

INSERT INTO public.activity_log (organization_id, entity_type, entity_id, action, actor_id, metadata) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'project', 'c3d4e5f6-0001-4000-8000-000000000001', 'created', 'a1b2c3d4-0001-4000-8000-000000000001', '{"project_name": "Website Redesign"}'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'task',    'd4e5f6a7-0001-4000-8000-000000000001', 'status_changed', 'a1b2c3d4-0001-4000-8000-000000000003', '{"from": "in_progress", "to": "done"}'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'task',    'd4e5f6a7-0001-4000-8000-000000000005', 'assigned', 'a1b2c3d4-0001-4000-8000-000000000002', '{"assignee": "David Park"}'),
  ('b2c3d4e5-0001-4000-8000-000000000001', 'document','b8c9d0e1-0001-4000-8000-000000000001', 'created', 'a1b2c3d4-0001-4000-8000-000000000002', '{"title": "API Design Guidelines"}');
