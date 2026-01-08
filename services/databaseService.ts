
import { Task } from "../types";
import { supabase } from "./supabaseClient";

export const databaseService = {
  async fetchAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error("Lỗi khi tải tasks từ Supabase:", error.message);
      throw error;
    }
    return (data || []) as Task[];
  },

  async upsertTask(task: Task): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .upsert(task, { onConflict: 'id' });
    
    if (error) {
      console.error("Lỗi khi lưu task lên Supabase:", error.message);
      throw error;
    }
  },

  async removeTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Lỗi khi xóa task khỏi Supabase:", error.message);
      throw error;
    }
  },

  async uploadImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    // Lưu ảnh vào thư mục mang tên userId để dễ quản lý RLS Policy
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Lỗi upload ảnh:", uploadError.message);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
