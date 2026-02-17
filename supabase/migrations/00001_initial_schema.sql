-- ============================================================================
-- ProductivityOS — Initial Database Schema
-- Migration: 00001_initial_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ORGANIZATIONS & USERS
-- ============================================================================

-- Profiles (linked 1:1 with auth.users)
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name     text,
  avatar_url    text,
  current_organization_id uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Organizations
CREATE TABLE public.organizations (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text NOT NULL,
  slug                    text NOT NULL UNIQUE,
  logo_url                text,
  plan                    text NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Add FK from profiles.current_organization_id -> organizations after orgs table exists
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_current_organization_id_fkey
  FOREIGN KEY (current_organization_id) REFERENCES public.organizations (id) ON DELETE SET NULL;

-- Organization members (join table)
CREATE TABLE public.organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- ============================================================================
-- 2. TASKS & PROJECTS
-- ============================================================================

-- Projects
CREATE TABLE public.projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  color           text NOT NULL DEFAULT '#6366f1',
  status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'archived')),
  created_by      uuid NOT NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Project members
CREATE TABLE public.project_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member',
  UNIQUE (project_id, user_id)
);

-- Tasks
CREATE TABLE public.tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  status          text NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority        text NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id     uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  reporter_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  due_date        timestamptz,
  position        float8 NOT NULL DEFAULT 0,
  labels          text[] NOT NULL DEFAULT '{}',
  estimated_hours float4,
  parent_task_id  uuid REFERENCES public.tasks (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Task comments
CREATE TABLE public.task_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Activity log
CREATE TABLE public.activity_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  entity_type     text NOT NULL,
  entity_id       uuid NOT NULL,
  action          text NOT NULL,
  actor_id        uuid NOT NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. CHAT
-- ============================================================================

-- Channels
CREATE TABLE public.channels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  type            text NOT NULL DEFAULT 'public'
                    CHECK (type IN ('public', 'private', 'direct')),
  created_by      uuid NOT NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Channel members
CREATE TABLE public.channel_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  uuid NOT NULL REFERENCES public.channels (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  notifications text NOT NULL DEFAULT 'all'
                  CHECK (notifications IN ('all', 'mentions', 'none')),
  UNIQUE (channel_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id        uuid NOT NULL REFERENCES public.channels (id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content           text NOT NULL,
  attachments       jsonb NOT NULL DEFAULT '[]',
  parent_message_id uuid REFERENCES public.messages (id) ON DELETE SET NULL,
  is_edited         boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Reactions
CREATE TABLE public.reactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid NOT NULL REFERENCES public.messages (id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  emoji       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

-- ============================================================================
-- 4. DOCUMENTS
-- ============================================================================

-- Folders
CREATE TABLE public.folders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name              text NOT NULL,
  parent_folder_id  uuid REFERENCES public.folders (id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  title           text NOT NULL,
  content         jsonb NOT NULL DEFAULT '{}',
  folder_id       uuid REFERENCES public.folders (id) ON DELETE SET NULL,
  created_by      uuid NOT NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  updated_by      uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  tags            text[] NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Document versions
CREATE TABLE public.document_versions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  content       jsonb NOT NULL,
  created_by    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. REPORTS & ANALYTICS
-- ============================================================================

-- Dashboards
CREATE TABLE public.dashboards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name            text NOT NULL,
  layout          jsonb NOT NULL DEFAULT '[]',
  created_by      uuid NOT NULL REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Dashboard widgets
CREATE TABLE public.dashboard_widgets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id  uuid NOT NULL REFERENCES public.dashboards (id) ON DELETE CASCADE,
  type          text NOT NULL,
  config        jsonb NOT NULL DEFAULT '{}',
  position      jsonb NOT NULL DEFAULT '{}'
);

-- KPIs
CREATE TABLE public.kpis (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  target_value      float8 NOT NULL,
  current_value     float8 NOT NULL DEFAULT 0,
  unit              text NOT NULL,
  category          text NOT NULL,
  tracking_period   text NOT NULL DEFAULT 'monthly',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- KPI entries
CREATE TABLE public.kpi_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id      uuid NOT NULL REFERENCES public.kpis (id) ON DELETE CASCADE,
  value       float8 NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  notes       text
);

-- AI insights
CREATE TABLE public.ai_insights (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  type                  text NOT NULL,
  content               jsonb NOT NULL,
  generated_at          timestamptz NOT NULL DEFAULT now(),
  related_entity_type   text,
  related_entity_id     uuid
);

-- ============================================================================
-- 6. INDEXES
-- ============================================================================

CREATE INDEX idx_tasks_project_id      ON public.tasks (project_id);
CREATE INDEX idx_tasks_assignee_id     ON public.tasks (assignee_id);
CREATE INDEX idx_tasks_organization_id ON public.tasks (organization_id);
CREATE INDEX idx_messages_channel_id   ON public.messages (channel_id);
CREATE INDEX idx_documents_org_id      ON public.documents (organization_id);
CREATE INDEX idx_activity_log_org_id   ON public.activity_log (organization_id);
CREATE INDEX idx_kpi_entries_kpi_id    ON public.kpi_entries (kpi_id);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) — Organization-based tenant isolation
-- ============================================================================

-- Helper: inline sub-select used in every policy
-- SELECT organization_id FROM organization_members WHERE user_id = auth.uid()

-- ---- profiles ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their orgs" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT om.user_id FROM public.organization_members om
      WHERE om.organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ---- organizations ----
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.organizations FOR ALL USING (
  id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- organization_members ----
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.organization_members FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- projects ----
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.projects FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- project_members (derive org from parent project) ----
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.project_members FOR ALL USING (
  project_id IN (
    SELECT id FROM public.projects
    WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- tasks ----
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.tasks FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- task_comments (derive org from parent task) ----
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.task_comments FOR ALL USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- activity_log ----
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.activity_log FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- channels ----
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.channels FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- channel_members (derive org from parent channel) ----
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.channel_members FOR ALL USING (
  channel_id IN (
    SELECT id FROM public.channels
    WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- messages (derive org from parent channel) ----
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.messages FOR ALL USING (
  channel_id IN (
    SELECT id FROM public.channels
    WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- reactions (derive org from message -> channel) ----
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.reactions FOR ALL USING (
  message_id IN (
    SELECT m.id FROM public.messages m
    JOIN public.channels c ON c.id = m.channel_id
    WHERE c.organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- folders ----
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.folders FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- documents ----
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.documents FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- document_versions (derive org from parent document) ----
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.document_versions FOR ALL USING (
  document_id IN (
    SELECT id FROM public.documents
    WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- dashboards ----
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.dashboards FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- dashboard_widgets (derive org from parent dashboard) ----
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.dashboard_widgets FOR ALL USING (
  dashboard_id IN (
    SELECT id FROM public.dashboards
    WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- kpis ----
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.kpis FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ---- kpi_entries (derive org from parent kpi) ----
ALTER TABLE public.kpi_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.kpi_entries FOR ALL USING (
  kpi_id IN (
    SELECT id FROM public.kpis
    WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  )
);

-- ---- ai_insights ----
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON public.ai_insights FOR ALL USING (
  organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- ============================================================================
-- 8. TRIGGER FUNCTIONS
-- ============================================================================

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to every table that has the column
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dashboards
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.kpis
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
