import { GoogleGenAI, Type } from '@google/genai';
import { ReceiptData, StatementData, DraftTransaction } from '../types';

// Exporting the model used for vision tasks for UI reference if needed
export const GEMINI_MODEL = 'gemini-2.5-flash-image';
const TEXT_MODEL = 'gemini-3-flash-preview';

class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Process a receipt image and extract transaction data
   * Uses gemini-2.5-flash-image for vision capabilities
   */
  async processReceiptImage(base64Data: string, mimeType: string): Promise<ReceiptData> {
    const ai = this.getAI();
    const prompt = `Extract the following from this receipt image: merchant, date, totalAmount, currency, category, items(name, price).`;
    
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            category: { type: Type.STRING },
            items: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  name: { type: Type.STRING }, 
                  price: { type: Type.NUMBER } 
                } 
              } 
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }

  /**
   * Analyze bank statement image
   * Uses gemini-2.5-flash-image for vision capabilities
   */
  async analyzeBankStatement(base64Data: string, mimeType: string, historyContext: string = ''): Promise<StatementData> {
    const ai = this.getAI();
    const prompt = `Extract ALL transactions from this bank statement. ${historyContext}`;
    
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
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
    
    return JSON.parse(response.text || '{"transactions": []}');
  }

  /**
   * Refine draft transactions based on user feedback
   * Uses gemini-3-flash-preview for complex text reasoning
   */
  async refineBankStatement(drafts: DraftTransaction[], userCorrection: string): Promise<DraftTransaction[]> {
    const ai = this.getAI();
    const prompt = `Correct these drafts based on user input: ${JSON.stringify(drafts)}. User: "${userCorrection}"`;
    
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { 
            type: Type.OBJECT, 
            properties: { 
              id: { type: Type.STRING }, 
              merchant: { type: Type.STRING }, 
              date: { type: Type.STRING }, 
              amount: { type: Type.NUMBER }, 
              type: { type: Type.STRING }, 
              category: { type: Type.STRING } 
            } 
          }
        }
      }
    });
    
    return JSON.parse(response.text || '[]');
  }

  /**
   * Parse natural language transaction input
   * Uses gemini-3-flash-preview for text understanding
   */
  async parseNaturalLanguage(input: string): Promise<any> {
    const ai = this.getAI();
    const prompt = `Parse transaction: "${input}". Today: ${new Date().toISOString().split('T')[0]}`;
    
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
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

  /**
   * Generate insights from transaction history
   * Uses gemini-3-flash-preview for reasoning
   */
  async generateInsights(transactions: any[]): Promise<any> {
    const ai = this.getAI();
    // Limit to 50 recent transactions to save tokens
    const prompt = `Analyze spending patterns, anomalies, and suggestions for: ${JSON.stringify(transactions.slice(0, 50))}`;
    
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
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