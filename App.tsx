import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from './types';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import AuthForm from './components/AuthForm';
import { PlusIcon, SparklesIcon, CheckIcon } from './components/Icons';
import { getSummaryAdvice } from './services/geminiService';
import { databaseService } from './services/databaseService';
import { supabase } from './services/supabaseClient';
import { CONFIG } from './config';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');

  useEffect(() => {
    // Lấy session hiện tại từ Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Lắng nghe thay đổi trạng thái đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const loadTasks = async () => {
        setIsLoading(true);
        try {
          const data = await databaseService.fetchAllTasks();
          setTasks(data);
        } catch (error) {
          console.error("Không thể tải danh sách công việc:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadTasks();
    }
  }, [session]);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!session) return;
    
    try {
      const taskToSave: Task = editingTask 
        ? { ...editingTask, ...taskData } as Task
        : {
            id: crypto.randomUUID(),
            user_id: session.user.id,
            title: taskData.title || '',
            description: taskData.description || '',
            status: taskData.status || TaskStatus.TODO,
            priority: taskData.priority || TaskPriority.MEDIUM,
            startTime: taskData.startTime || new Date().toISOString(),
            endTime: taskData.endTime || new Date().toISOString(),
            createdAt: Date.now(),
            subTasks: taskData.subTasks || []
          };

      await databaseService.upsertTask(taskToSave);
      
      if (editingTask) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? taskToSave : t));
      } else {
        setTasks(prev => [taskToSave, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Lỗi khi lưu dữ liệu lên hệ thống.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Xóa công việc này khỏi hệ thống?')) {
      try {
        await databaseService.removeTask(id);
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (e) {
        alert("Không thể xóa công việc.");
      }
    }
  };

  const handleToggleDone = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, status: task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE };
    try {
      await databaseService.upsertTask(updated);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (e) {
      alert("Lỗi cập nhật trạng thái.");
    }
  };

  const handleGetAiSummary = async () => {
    setIsAiSummaryLoading(true);
    const summary = await getSummaryAdvice(tasks);
    setAiSummary(summary);
    setIsAiSummaryLoading(false);
  };

  const filteredTasks = useMemo(() => {
    if (filter === 'ALL') return tasks;
    return tasks.filter(t => t.status === filter);
  }, [tasks, filter]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang khởi động hệ thống...</div>;
  }

  if (!session) {
    return <AuthForm onSession={setSession} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {CONFIG.APP.NAME}
              </h1>
              <span className="text-[10px] text-gray-400 font-medium">{session.user.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 text-xs font-semibold px-3 py-2"
            >
              Đăng xuất
            </button>
            <button 
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <PlusIcon /> <span className="hidden sm:inline">Thêm Task</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <section className="mb-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon />
            <h2 className="font-bold text-gray-800">Gợi ý từ AI</h2>
          </div>
          <p className="text-gray-600 text-sm italic mb-4">
            {aiSummary || "Bấm nút bên dưới để AI phân tích danh sách công việc của bạn từ hệ thống."}
          </p>
          <button 
            onClick={handleGetAiSummary}
            disabled={isAiSummaryLoading}
            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
          >
            {isAiSummaryLoading ? 'Đang phân tích...' : 'Phân tích lộ trình'}
          </button>
        </section>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {['ALL', ...Object.values(TaskStatus)].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              {s === 'ALL' ? 'Tất cả' : s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={handleDeleteTask} 
              onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
              onToggleDone={handleToggleDone} 
            />
          ))}
          {filteredTasks.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
              Không có dữ liệu công việc.
            </div>
          )}
        </div>
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask} 
        editTask={editingTask} 
      />
    </div>
  );
};

export default App;