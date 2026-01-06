
import { Task } from "../types";
import { supabase } from "./supabaseClient";

export const databaseService = {
  // Lấy tất cả công việc từ Supabase
  async fetchAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error("Lỗi khi fetch tasks từ Supabase:", error);
      throw error;
    }

    return (data || []) as Task[];
  },

  // Thêm hoặc Cập nhật một công việc
  async upsertTask(task: Task): Promise<void> {
    // Đảm bảo chỉ gửi các field mà database có
    const payload = {
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startTime: task.startTime,
      endTime: task.endTime,
      createdAt: task.createdAt,
      subTasks: task.subTasks
    };

    const { error } = await supabase
      .from('tasks')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error("Chi tiết lỗi lưu Task:", error);
      throw error;
    }
  },

  // Xóa công việc
  async removeTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Lỗi khi xóa task trên Supabase:", error);
      throw error;
    }
  },

  // Đồng bộ hàng loạt
  async syncTasks(tasks: Task[]): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .upsert(tasks);

    if (error) {
      console.error("Lỗi khi sync tasks lên Supabase:", error);
      throw error;
    }
  }
};
