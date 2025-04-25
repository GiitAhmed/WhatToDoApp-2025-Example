export interface Activity {
  id: number;
  title: string;
  description: string;
  url?: string;
  status: 'pending' | 'in_progress' | 'completed';
  start_date: string | null;
  end_date: string | null;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  activity_id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewActivity {
  title: string;
  description: string;
  url?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  start_date: string | null;
  end_date: string | null;
} 