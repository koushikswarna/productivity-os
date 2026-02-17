// ============================================================================
// ProductivityOS — TypeScript Types
// Generated from the Supabase database schema (00001_initial_schema.sql)
// ============================================================================

// ---------------------------------------------------------------------------
// Enum / Union Types
// ---------------------------------------------------------------------------

export type Plan = 'free' | 'pro' | 'business' | 'enterprise';

export type Role = 'owner' | 'admin' | 'member' | 'guest';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ChannelType = 'public' | 'private' | 'direct';

export type ProjectStatus = 'active' | 'archived';

export type NotificationPreference = 'all' | 'mentions' | 'none';

// ---------------------------------------------------------------------------
// 1. Organizations & Users
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
}

// ---------------------------------------------------------------------------
// 2. Tasks & Projects
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
}

export interface Task {
  id: string;
  project_id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id: string;
  due_date: string | null;
  position: number;
  labels: string[];
  estimated_hours: number | null;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// 3. Chat
// ---------------------------------------------------------------------------

export interface Channel {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  type: ChannelType;
  created_by: string;
  created_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  last_read_at: string;
  notifications: NotificationPreference;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  attachments: unknown[];
  parent_message_id: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// 4. Documents
// ---------------------------------------------------------------------------

export interface Folder {
  id: string;
  organization_id: string;
  name: string;
  parent_folder_id: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  title: string;
  content: Record<string, unknown>;
  folder_id: string | null;
  created_by: string;
  updated_by: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// 5. Reports & Analytics
// ---------------------------------------------------------------------------

export interface Dashboard {
  id: string;
  organization_id: string;
  name: string;
  layout: unknown[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  type: string;
  config: Record<string, unknown>;
  position: Record<string, unknown>;
}

export interface Kpi {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  tracking_period: string;
  created_at: string;
  updated_at: string;
}

export interface KpiEntry {
  id: string;
  kpi_id: string;
  value: number;
  recorded_at: string;
  notes: string | null;
}

export interface AiInsight {
  id: string;
  organization_id: string;
  type: string;
  content: Record<string, unknown>;
  generated_at: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
}

// ---------------------------------------------------------------------------
// 6. Composite / Utility Types
// ---------------------------------------------------------------------------

/** Task with its assignee and reporter profiles resolved. */
export type TaskWithAssignee = Task & {
  assignee: Profile | null;
  reporter: Profile;
};

/** Task with assignee, reporter, and nested comments. */
export type TaskWithDetails = Task & {
  assignee: Profile | null;
  reporter: Profile;
  comments: TaskCommentWithUser[];
  subtasks: Task[];
};

/** Task comment with the commenting user's profile. */
export type TaskCommentWithUser = TaskComment & {
  user: Profile;
};

/** Message with the sender's profile and all reactions. */
export type MessageWithUser = Message & {
  user: Profile;
  reactions: Reaction[];
};

/** Message with user, reactions, and threaded replies. */
export type MessageWithThread = MessageWithUser & {
  replies: MessageWithUser[];
};

/** Document with the author's profile resolved. */
export type DocumentWithAuthor = Document & {
  created_by_profile: Profile;
};

/** Document with author, folder, and version history. */
export type DocumentWithDetails = DocumentWithAuthor & {
  folder: Folder | null;
  versions: DocumentVersion[];
};

/** Channel with its members and their profiles. */
export type ChannelWithMembers = Channel & {
  members: (ChannelMember & { profile: Profile })[];
};

/** Project with its members and their profiles. */
export type ProjectWithMembers = Project & {
  members: (ProjectMember & { profile: Profile })[];
};

/** Organization with the current user's membership info. */
export type OrganizationWithRole = Organization & {
  current_user_role: Role;
};

/** Dashboard with all its widgets resolved. */
export type DashboardWithWidgets = Dashboard & {
  widgets: DashboardWidget[];
};

/** KPI with its historical entries. */
export type KpiWithEntries = Kpi & {
  entries: KpiEntry[];
};

/** Activity log entry with the actor's profile. */
export type ActivityLogWithActor = ActivityLog & {
  actor: Profile;
};

// ---------------------------------------------------------------------------
// 7. Form / Input Types (for create & update operations)
// ---------------------------------------------------------------------------

export type CreateOrganization = Pick<Organization, 'name' | 'slug'> &
  Partial<Pick<Organization, 'logo_url' | 'plan'>>;

export type UpdateOrganization = Partial<
  Pick<Organization, 'name' | 'slug' | 'logo_url' | 'plan'>
>;

export type CreateProject = Pick<Project, 'name' | 'organization_id'> &
  Partial<Pick<Project, 'description' | 'color' | 'status'>>;

export type UpdateProject = Partial<
  Pick<Project, 'name' | 'description' | 'color' | 'status'>
>;

export type CreateTask = Pick<Task, 'title' | 'project_id' | 'organization_id'> &
  Partial<
    Pick<
      Task,
      | 'description'
      | 'status'
      | 'priority'
      | 'assignee_id'
      | 'due_date'
      | 'labels'
      | 'estimated_hours'
      | 'parent_task_id'
      | 'position'
    >
  >;

export type UpdateTask = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'status'
    | 'priority'
    | 'assignee_id'
    | 'due_date'
    | 'labels'
    | 'estimated_hours'
    | 'position'
  >
>;

export type CreateMessage = Pick<Message, 'channel_id' | 'content'> &
  Partial<Pick<Message, 'attachments' | 'parent_message_id'>>;

export type UpdateMessage = Pick<Message, 'content'>;

export type CreateDocument = Pick<Document, 'title' | 'organization_id'> &
  Partial<Pick<Document, 'content' | 'folder_id' | 'tags'>>;

export type UpdateDocument = Partial<
  Pick<Document, 'title' | 'content' | 'folder_id' | 'tags'>
>;

export type CreateChannel = Pick<Channel, 'name' | 'organization_id'> &
  Partial<Pick<Channel, 'description' | 'type'>>;

export type CreateKpi = Pick<
  Kpi,
  'name' | 'organization_id' | 'target_value' | 'unit' | 'category'
> &
  Partial<Pick<Kpi, 'description' | 'current_value' | 'tracking_period'>>;

export type UpdateKpi = Partial<
  Pick<Kpi, 'name' | 'description' | 'target_value' | 'current_value' | 'unit' | 'category' | 'tracking_period'>
>;

export type CreateDashboard = Pick<Dashboard, 'name' | 'organization_id'> &
  Partial<Pick<Dashboard, 'layout'>>;

export type UpdateDashboard = Partial<Pick<Dashboard, 'name' | 'layout'>>;

// Convenience aliases for common naming conventions
export type KPI = Kpi;
export type KPIEntry = KpiEntry;
export type AIInsight = AiInsight;
