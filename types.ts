
export enum TaskStatus {
  TODO = 'Chưa làm',
  IN_PROGRESS = 'Đang làm',
  DONE = 'Hoàn thành',
  BLOCKED = 'Đang kẹt'
}

export enum TaskPriority {
  LOW = 'Thấp',
  MEDIUM = 'Trung bình',
  HIGH = 'Cao',
  URGENT = 'Khẩn cấp'
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
  createdAt: number;
  subTasks: string[];
  image_url?: string;
}

export interface AISuggestion {
  suggestedPriority: TaskPriority;
  suggestedSubTasks: string[];
  tips: string;
}
