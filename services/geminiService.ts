
import { GoogleGenAI, Type } from "@google/genai";
import { TaskStatus, TaskPriority, AISuggestion } from "../types";
import { CONFIG } from "../config";

// Always use named parameter and direct process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartTaskAdvice = async (title: string, description: string): Promise<AISuggestion | null> => {
  try {
    const response = await ai.models.generateContent({
      model: CONFIG.GEMINI.MODEL,
      contents: `Hãy phân tích công việc sau và đưa ra gợi ý:
      Tiêu đề: ${title}
      Mô tả: ${description}
      
      Yêu cầu trả về JSON định dạng sau:
      {
        "suggestedPriority": "Thấp" | "Trung bình" | "Cao" | "Khẩn cấp",
        "suggestedSubTasks": string[],
        "tips": string (lời khuyên ngắn gọn để hoàn thành tốt)
      }`,
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

    const result = JSON.parse(response.text);
    return result as AISuggestion;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

export const getSummaryAdvice = async (tasks: any[]): Promise<string> => {
  if (tasks.length === 0) return "Bạn chưa có công việc nào. Hãy bắt đầu bằng cách thêm một task mới!";
  
  try {
    const response = await ai.models.generateContent({
      model: CONFIG.GEMINI.MODEL,
      contents: `Đây là danh sách công việc của tôi: ${JSON.stringify(tasks)}. 
      Hãy đưa ra một nhận xét ngắn gọn (tối đa 3 câu) về khối lượng công việc và lời khuyên nên ưu tiên làm gì ngay bây giờ.`
    });
    return response.text;
  } catch (error) {
    return "Không thể kết nối với trí tuệ nhân tạo lúc này.";
  }
};
