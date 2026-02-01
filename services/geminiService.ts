import { GoogleGenAI, Type } from '@google/genai';
import { ReceiptData, StatementData, DraftTransaction } from '../types';

export const GEMINI_MODEL = 'gemini-2.0-flash-exp';

class GeminiService {
  private getAI(apiKey: string) {
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Process a receipt image and extract transaction data
   */
  async processReceiptImage(
    base64Data: string,
    mimeType: string,
    apiKey: string
  ): Promise<ReceiptData> {
    const ai = this.getAI(apiKey);

    const prompt = `You are a receipt parser. Extract the following from this receipt image:
- merchant: Store/business name
- date: Date in YYYY-MM-DD format
- totalAmount: Total amount as a number
- currency: Currency code (e.g., INR, USD) or symbol
- category: One of: Food & Dining, Transportation, Shopping, Entertainment, Health & Fitness, Groceries, Utilities, Other
- items: Array of {name, price} for each line item`;

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
            date: { type: Type.STRING },
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

    if (!response.text) throw new Error("No data returned from Gemini");
    return JSON.parse(response.text);
  }

  /**
   * Analyze bank statement image
   */
  async analyzeBankStatement(
    base64Data: string,
    mimeType: string,
    apiKey: string,
    historyContext: string = ''
  ): Promise<StatementData> {
    const ai = this.getAI(apiKey);

    const prompt = `You are a bank statement analyzer. Extract ALL transactions from this image.

${historyContext}

For each transaction, determine:
- merchant: Business/person name (clean and readable)
- date: YYYY-MM-DD format
- amount: Numeric value (positive)
- type: "expense" or "income"
- category: Food & Dining, Transportation, Shopping, Entertainment, Health & Fitness, Groceries, Utilities, Income, or Other`;

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

    if (!response.text) throw new Error("No data returned from Gemini");
    return JSON.parse(response.text);
  }

  /**
   * Refine draft transactions based on user feedback
   */
  async refineBankStatement(
    drafts: DraftTransaction[],
    userCorrection: string,
    apiKey: string
  ): Promise<DraftTransaction[]> {
    const ai = this.getAI(apiKey);

    const prompt = `You are correcting transaction data. Here are the current drafts:

${JSON.stringify(drafts, null, 2)}

User says: "${userCorrection}"

Apply the correction and return the UPDATED array in the same format. Keep all fields intact unless the user specifically mentions them.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
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

    if (!response.text) throw new Error("No data returned from Gemini");
    return JSON.parse(response.text);
  }

  /**
   * NEW: Parse natural language transaction input
   * Example: "Spent 500 on groceries at DMart yesterday"
   */
  async parseNaturalLanguage(
    input: string,
    apiKey: string
  ): Promise<{
    merchant: string;
    amount: number;
    category: string;
    type: 'expense' | 'income';
    date: string;
  }> {
    const ai = this.getAI(apiKey);

    const prompt = `You are a transaction parser. Extract transaction details from natural language.

User input: "${input}"

Today's date: ${new Date().toISOString().split('T')[0]}

Extract:
- merchant: Business name (if mentioned, otherwise "Unknown")
- amount: Numeric value
- category: Food & Dining, Transportation, Shopping, Entertainment, Health & Fitness, Groceries, Utilities, Income, or Other
- type: "expense" or "income" (default to expense unless clearly income)
- date: YYYY-MM-DD (interpret "yesterday", "last week", etc. relative to today)`;

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

    if (!response.text) throw new Error("No data returned from Gemini");
    return JSON.parse(response.text);
  }

  /**
   * NEW: Generate AI insights from transaction data
   */
  async generateInsights(
    transactions: any[],
    apiKey: string
  ): Promise<{
    patterns: string[];
    anomalies: string[];
    suggestions: string[];
  }> {
    const ai = this.getAI(apiKey);

    const prompt = `You are a financial advisor analyzing spending patterns.

Transaction data (last 30 days):
${JSON.stringify(transactions.slice(0, 100), null, 2)}

Analyze and provide:
1. patterns: 3 spending patterns (e.g., "You spend 40% more on weekends")
2. anomalies: 2 unusual transactions (e.g., "Unusually high shopping expense")
3. suggestions: 3 actionable savings tips (e.g., "Reduce dining out by 15%")`;

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

    if (!response.text) throw new Error("No data returned from Gemini");
    return JSON.parse(response.text);
  }
}

export const geminiService = new GeminiService();