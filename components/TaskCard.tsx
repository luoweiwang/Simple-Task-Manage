
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { CalendarIcon, TrashIcon, CheckIcon, ShareIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleDone: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onToggleDone }) => {
  const [copied, setCopied] = useState(false);

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.URGENT: return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case TaskPriority.HIGH: return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case TaskPriority.MEDIUM: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case TaskPriority.LOW: return 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (s: TaskStatus) => {
    switch(s) {
      case TaskStatus.DONE: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case TaskStatus.IN_PROGRESS: return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400';
      case TaskStatus.BLOCKED: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const handleShareTask = () => {
    const text = `📌 CÔNG VIỆC: ${task.title}\n📊 Trạng thái: ${task.status}\n🔥 Ưu tiên: ${task.priority}\n⏰ Hạn: ${new Date(task.endTime).toLocaleString('vi-VN')}\n📝 Mô tả: ${task.description || 'Không có'}\n\nĐược quản lý bởi SmartTask Flow.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = task.status === TaskStatus.DONE;

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative ${isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleShareTask}
            title="Chia sẻ nội dung task"
            className={`p-1.5 rounded-lg transition-colors ${copied ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
          >
            {copied ? <CheckIcon /> : <ShareIcon />}
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <h3 className={`text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 leading-tight ${isCompleted ? 'line-through text-gray-500 dark:text-gray-600' : ''}`}>
        {task.title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
        {task.description || "Không có mô tả."}
      </p>

      <div className="space-y-2 pt-3 border-t border-gray-50 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <CalendarIcon />
          <span>Bắt đầu: {new Date(task.startTime).toLocaleString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <CalendarIcon />
          <span>Kết thúc: {new Date(task.endTime).toLocaleString('vi-VN')}</span>
        </div>
      </div>

      <button 
        onClick={() => onToggleDone(task.id)}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
          isCompleted 
          ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700' 
          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800/50'
        }`}
      >
        <CheckIcon />
        {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
      </button>
    </div>
  );
};

export default TaskCard;
