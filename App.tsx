
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from './types';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import AuthForm from './components/AuthForm';
import { PlusIcon, SparklesIcon, CheckIcon, LinkIcon } from './components/Icons';
import { getSummaryAdvice } from './services/geminiService';
import { databaseService } from './services/databaseService';
import { supabase } from './services/supabaseClient';
import { CONFIG } from './config';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [showShareToast, setShowShareToast] = useState(false);

  // Kiểm tra Session khi khởi tạo
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data khi có session
  useEffect(() => {
    if (session) {
      const initData = async () => {
        setIsLoading(true);
        try {
          const data = await databaseService.fetchAllTasks();
          setTasks(data);
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
          setIsLoading(false);
        }
      };
      initData();
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTasks([]);
  };

  const handleShareApp = () => {
    const url = CONFIG.APP.BASE_URL;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    
    setIsSaving(true);
    try {
      const taskToSave: Task = editingTask 
        ? { 
            ...editingTask, 
            ...taskData,
            user_id: currentUserId 
          } as Task
        : {
            id: crypto.randomUUID(),
            user_id: currentUserId,
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
    } catch (error: any) {
      console.error("Lỗi lưu task:", error);
      alert(`Lỗi bảo mật (RLS): ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa công việc này?')) {
      setIsSaving(true);
      try {
        await databaseService.removeTask(id);
        setTasks(prev => prev.filter(t => t.id !== id));
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleToggleDone = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !session?.user?.id) return;

    const updatedTask = {
      ...task,
      user_id: session.user.id,
      status: task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE
    };

    setIsSaving(true);
    try {
      await databaseService.upsertTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } finally {
      setIsSaving(false);
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

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      done: tasks.filter(t => t.status === TaskStatus.DONE).length,
      todo: tasks.filter(t => t.status === TaskStatus.TODO).length
    };
  }, [tasks]);

  if (!session) {
    return <AuthForm onSession={setSession} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-right duration-300">
          <CheckIcon />
          <span className="font-semibold text-sm">Đã copy link ứng dụng!</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <CheckIcon />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                {CONFIG.APP.NAME}
              </h1>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                  {session.user.email}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleShareApp}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <LinkIcon />
              <span className="hidden sm:inline">Mời bạn bè</span>
            </button>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-2 py-2"
            >
              Thoát
            </button>
            <button 
              onClick={handleAddTask}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Task</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">Đang tải dữ liệu của bạn...</p>
          </div>
        ) : (
          <>
            {/* AI Insight Box */}
            <section className="mb-10 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <div className="text-center min-w-[60px]">
                    <p className="text-3xl font-black text-blue-600">{stats.todo}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Cần làm</p>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <SparklesIcon />
                    <h2 className="font-bold text-indigo-900">Trợ lý AI Gemini</h2>
                  </div>
                  <p className="text-indigo-700 text-sm italic mb-4 leading-relaxed">
                    {aiSummary || "Bấm nút phân tích để nhận lời khuyên thông minh về kế hoạch của bạn."}
                  </p>
                  <button 
                    onClick={handleGetAiSummary}
                    disabled={isAiSummaryLoading}
                    className="text-xs font-bold bg-white px-4 py-2 rounded-lg text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isAiSummaryLoading ? 'Đang suy nghĩ...' : 'Phân tích lộ trình'}
                  </button>
                </div>
              </div>
            </section>

            {/* Filters */}
            <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-6">
              <button 
                onClick={() => setFilter('ALL')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${filter === 'ALL' ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
              >
                Tất cả ({stats.total})
              </button>
              {Object.values(TaskStatus).map(s => (
                <button 
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${filter === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Task Grid */}
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onToggleDone={handleToggleDone}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700">Trống trải quá!</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">
                  Bạn chưa có công việc nào trong danh sách này. Thêm ngay một task để bắt đầu nhé.
                </p>
                <button 
                  onClick={handleAddTask}
                  className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                  <PlusIcon /> Tạo Task đầu tiên
                </button>
              </div>
            )}
          </>
        )}
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
