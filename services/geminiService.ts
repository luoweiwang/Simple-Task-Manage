
import { GoogleGenAI, Type } from "@google/genai";
import { TaskStatus, TaskPriority, AISuggestion } from "../types";
import { CONFIG } from "../config";

// Khởi tạo an toàn: Nếu không có API_KEY, các hàm sẽ trả về null thay vì crash app
const getAIClient = () => {
  const apiKey = CONFIG.GEMINI.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
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

    const text = response.text;
    if (!text) return null;

    const result = JSON.parse(text);
    return result as AISuggestion;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

export const getSummaryAdvice = async (tasks: any[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI hiện chưa được cấu hình. Vui lòng kiểm tra API Key.";
  
  if (tasks.length === 0) return "Bạn chưa có công việc nào. Hãy bắt đầu bằng cách thêm một task mới!";
  
  try {
    const response = await ai.models.generateContent({
      model: CONFIG.GEMINI.MODEL,
      contents: `Đây là danh sách công việc của tôi: ${JSON.stringify(tasks)}. 
      Hãy đưa ra một nhận xét ngắn gọn (tối đa 3 câu) về khối lượng công việc và lời khuyên nên ưu tiên làm gì ngay bây giờ.`
    });
    
    return response.text || "Không nhận được phản hồi từ AI.";
  } catch (error) {
    return "Không thể kết nối với trí tuệ nhân tạo lúc này.";
  }
};
