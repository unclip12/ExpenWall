import { GoogleGenAI, Type } from '@google/genai';
import { ReceiptData, StatementData, DraftTransaction } from '../types';

export const GEMINI_MODEL = 'gemini-2.0-flash-exp';

class GeminiService {
  private getAI(apiKey: string) {
    return new GoogleGenAI({ apiKey });
  }

  async processReceiptImage(base64Data: string, mimeType: string, apiKey: string): Promise<ReceiptData> {
    const ai = this.getAI(apiKey);
    const prompt = `Extract: merchant, date, totalAmount, currency, category, items(name, price)`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            date: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            category: { type: Type.STRING },
            items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, price: { type: Type.NUMBER } } } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async analyzeBankStatement(base64Data: string, mimeType: string, apiKey: string, historyContext: string = ''): Promise<StatementData> {
    const ai = this.getAI(apiKey);
    const prompt = `Extract ALL transactions. ${historyContext}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  merchant: { type: Type.STRING },
                  date: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["expense", "income"] },
                  category: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async refineBankStatement(drafts: DraftTransaction[], userCorrection: string, apiKey: string): Promise<DraftTransaction[]> {
    const ai = this.getAI(apiKey);
    const prompt = `Correct these drafts based on user input: ${JSON.stringify(drafts)}. User: "${userCorrection}"`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, merchant: { type: Type.STRING }, date: { type: Type.STRING }, amount: { type: Type.NUMBER }, type: { type: Type.STRING }, category: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  }

  async parseNaturalLanguage(input: string, apiKey: string): Promise<any> {
    const ai = this.getAI(apiKey);
    const prompt = `Parse transaction: "${input}". Today: ${new Date().toISOString().split('T')[0]}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["expense", "income"] },
            date: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async generateInsights(transactions: any[], apiKey: string): Promise<any> {
    const ai = this.getAI(apiKey);
    const prompt = `Analyze spending: ${JSON.stringify(transactions.slice(0, 50))}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
}

export const geminiService = new GeminiService();