
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { SparklesIcon, ImageIcon, XIcon } from './Icons';
import { getSmartTaskAdvice } from '../services/geminiService';
import { databaseService } from '../services/databaseService';
import { supabase } from '../services/supabaseClient';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editTask?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, editTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setStatus(editTask.status);
      setPriority(editTask.priority);
      setStartTime(editTask.startTime);
      setEndTime(editTask.endTime);
      setSubTasks(editTask.subTasks || []);
      setImageUrl(editTask.image_url);
    } else {
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
      const now = new Date();
      setStartTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      setEndTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000 + 3600000).toISOString().slice(0, 16));
      setSubTasks([]);
      setImageUrl(undefined);
    }
  }, [editTask, isOpen]);

  const handleAiAssist = async () => {
    if (!title) return;
    setIsAiLoading(true);
    const advice = await getSmartTaskAdvice(title, description);
    if (advice) {
      setPriority(advice.suggestedPriority);
      setSubTasks(advice.suggestedSubTasks);
      setDescription(prev => prev + (prev ? "\n\n" : "") + "--- AI Tips ---\n" + advice.tips);
    }
    setIsAiLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Vui lòng đăng nhập lại để thực hiện tải ảnh.");
        return;
      }

      const url = await databaseService.uploadImage(file, session.user.id);
      setImageUrl(url);
    } catch (err: any) {
      alert(`Lỗi khi tải ảnh: ${err.message || "Vui lòng kiểm tra RLS Policy trên Supabase"}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XIcon />
          </button>
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tiêu đề</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập tên công việc..."
                />
                <button
                  onClick={handleAiAssist}
                  disabled={!title || isAiLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  <SparklesIcon />
                  {isAiLoading ? 'Đang phân tích...' : 'AI Gợi ý'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Mô tả chi tiết công việc..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Đính kèm ảnh tham khảo</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 aspect-video">
                  <img src={imageUrl} alt="Tham khảo" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImageUrl(undefined)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                  >
                    <XIcon />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all"
                >
                  <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-full">
                    <ImageIcon />
                  </div>
                  <span className="text-sm font-medium">{isUploading ? 'Đang tải ảnh...' : 'Bấm để tải ảnh lên'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-4 py-2 outline-none"
                >
                  {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mức độ ưu tiên</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-4 py-2 outline-none"
                >
                  {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bắt đầu</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-4 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kết thúc</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-lg px-4 py-2 outline-none"
                />
              </div>
            </div>

            {subTasks.length > 0 && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <label className="block text-sm font-bold text-blue-800 dark:text-blue-400 mb-2">Các bước thực hiện (AI gợi ý)</label>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  {subTasks.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-gray-600 dark:text-gray-400 font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave({ title, description, status, priority, startTime, endTime, subTasks, image_url: imageUrl })}
            disabled={!title || isUploading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-200 dark:shadow-none disabled:bg-blue-300 dark:disabled:bg-blue-900"
          >
            {isUploading ? 'Đang xử lý...' : 'Lưu công việc'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
