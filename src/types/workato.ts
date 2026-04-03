export interface Recipe {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  copy_count: number;
  trigger_application: string;
  action_applications: string[];
  applications: string[];
  description: string;
  project_id: number;
  folder_id: number;
  running: boolean;
  job_succeeded_count: number;
  job_failed_count: number;
  lifetime_task_count: number;
  last_run_at: string | null;
  stopped_at: string | null;
  version_no: number;
  stop_cause: string | null;
  config: RecipeConfig[];
  code: string;
  webhook_url?: string;
  tags?: Tag[];
}

export interface RecipeConfig {
  keyword: string;
  name: string;
  provider: string;
  skip_validation: boolean;
  account_id: number | null;
}

export interface RecipeListResponse {
  items: Recipe[];
}

export interface Job {
  id: string;
  completed_at: string | null;
  started_at: string;
  title: string;
  is_poll_error: boolean;
  error: string | null;
  error_parts?: {
    message: string;
    error_type: string;
    error_id: string;
  };
  is_error: boolean;
  status: 'succeeded' | 'failed' | 'pending';
  calling_recipe_id: number | null;
  calling_job_id: string | null;
  recipe_id: number;
  master_job_id: string;
}

export interface JobListResponse {
  job_succeeded_count: number;
  job_failed_count: number;
  job_count: number;
  items: Job[];
}

export interface Connection {
  application: string;
  id: number;
  name: string;
  description: string | null;
  authorized_at: string | null;
  authorization_status: string;
  authorization_error: string | null;
  created_at: string;
  updated_at: string;
  external_id: string | null;
  folder_id: number;
  connection_lost_at: string | null;
  connection_lost_reason: string | null;
  parent_id: number | null;
  project_id: number;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  project_id: number;
  is_project?: boolean;
}

export interface Tag {
  handle: string;
  title: string;
  description?: string;
  color?: string;
}

export interface RecipeCodeNode {
  number: number;
  provider: string;
  name: string;
  as?: string;
  keyword: string;
  input?: Record<string, unknown>;
  block?: RecipeCodeNode[];
  extended_input_schema?: unknown[];
  extended_output_schema?: unknown[];
  uuid?: string;
}
