import { GoogleGenAI, Type } from "@google/genai";
import { TaskStatus, TaskPriority, AISuggestion } from "../types";
import { CONFIG } from "../config";

// Khởi tạo client Gemini - Sử dụng process.env.API_KEY được AI Studio cung cấp tự động
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("AI Studio chưa cung cấp API_KEY.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getSmartTaskAdvice = async (title: string, description: string): Promise<AISuggestion | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: CONFIG.GEMINI.MODEL,
      contents: [{ parts: [{ text: `Hãy phân tích công việc sau và đưa ra gợi ý:
      Tiêu đề: ${title}
      Mô tả: ${description}
      
      Yêu cầu trả về JSON định dạng sau:
      {
        "suggestedPriority": "Thấp" | "Trung bình" | "Cao" | "Khẩn cấp",
        "suggestedSubTasks": string[],
        "tips": string (lời khuyên ngắn gọn để hoàn thành tốt)
      }` }]}],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPriority: { type: Type.STRING },
            suggestedSubTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tips: { type: Type.STRING }
          },
          required: ["suggestedPriority", "suggestedSubTasks", "tips"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AISuggestion;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

export const getSummaryAdvice = async (tasks: any[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI hiện chưa được cấu hình.";
  
  if (tasks.length === 0) return "Bạn chưa có công việc nào. Hãy bắt đầu bằng cách thêm một task mới!";
  
  try {
    const response = await ai.models.generateContent({
      model: CONFIG.GEMINI.MODEL,
      contents: [{ parts: [{ text: `Đây là danh sách công việc của tôi: ${JSON.stringify(tasks)}. 
      Hãy đưa ra một nhận xét ngắn gọn (tối đa 2 câu) bằng tiếng Việt về khối lượng công việc và lời khuyên nên ưu tiên làm gì.` }]}]
    });
    
    return response.text || "Không nhận được phản hồi từ AI.";
  } catch (error) {
    return "Không thể kết nối với AI lúc này.";
  }
};