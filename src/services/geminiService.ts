import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ReceiptData, StatementData, DraftTransaction } from '../types';

export const GEMINI_MODEL = 'gemini-1.5-flash'; // Fallback to stable model if exp is issues, but let's try flash

class GeminiService {
  private getAI(apiKey: string) {
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Process a receipt image and extract transaction data
   */
  async processReceiptImage(
    base64Data: string,
    mimeType: string,
    apiKey: string
  ): Promise<ReceiptData> {
    const genAI = this.getAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            merchant: { type: SchemaType.STRING },
            date: { type: SchemaType.STRING },
            totalAmount: { type: SchemaType.NUMBER },
            currency: { type: SchemaType.STRING },
            category: { type: SchemaType.STRING },
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  price: { type: SchemaType.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const prompt = `You are a receipt parser. Extract the following from this receipt image:
- merchant: Store/business name
- date: Date in YYYY-MM-DD format
- totalAmount: Total amount as a number
- currency: Currency code (e.g., INR, USD) or symbol
- category: One of: Food & Dining, Transportation, Shopping, Entertainment, Health & Fitness, Groceries, Utilities, Other
- items: Array of {name, price} for each line item`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    const text = result.response.text();
    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text);
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
    const genAI = this.getAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            transactions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  merchant: { type: SchemaType.STRING },
                  date: { type: SchemaType.STRING },
                  amount: { type: SchemaType.NUMBER },
                  type: { type: SchemaType.STRING, enum: ["expense", "income"] },
                  category: { type: SchemaType.STRING }
                }
              }
            }
          }
        }
      }
    });

    const prompt = `You are a bank statement analyzer. Extract ALL transactions from this image.

${historyContext}

For each transaction, determine:
- merchant: Business/person name (clean and readable)
- date: YYYY-MM-DD format
- amount: Numeric value (positive)
- type: "expense" or "income"
- category: Food & Dining, Transportation, Shopping, Entertainment, Health & Fitness, Groceries, Utilities, Income, or Other`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    const text = result.response.text();
    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text);
  }

  /**
   * Refine draft transactions based on user feedback
   */
  async refineBankStatement(
    drafts: DraftTransaction[],
    userCorrection: string,
    apiKey: string
  ): Promise<DraftTransaction[]> {
    const genAI = this.getAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
             type: SchemaType.OBJECT,
             properties: {
               id: { type: SchemaType.STRING },
               merchant: { type: SchemaType.STRING },
               date: { type: SchemaType.STRING },
               amount: { type: SchemaType.NUMBER },
               type: { type: SchemaType.STRING },
               category: { type: SchemaType.STRING }
             }
          }
        }
      }
    });

    const prompt = `You are correcting transaction data. Here are the current drafts:

${JSON.stringify(drafts, null, 2)}

User says: "${userCorrection}"

Apply the correction and return the UPDATED array in the same format. Keep all fields intact unless the user specifically mentions them.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text);
  }

  /**
   * Parse natural language transaction input
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
    const genAI = this.getAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            merchant: { type: SchemaType.STRING },
            amount: { type: SchemaType.NUMBER },
            category: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING, enum: ["expense", "income"] },
            date: { type: SchemaType.STRING }
          }
        }
      }
    });

    const prompt = `You are a transaction parser. Extract transaction details from natural language.

User input: "${input}"

Today's date: ${new Date().toISOString().split('T')[0]}

Extract:
- merchant: Business name (if mentioned, otherwise "Unknown")
- amount: Numeric value
- category: Food & Dining, Transportation, Shopping, Entertainment, Health & Fitness, Groceries, Utilities, Income, or Other
- type: "expense" or "income" (default to expense unless clearly income)
- date: YYYY-MM-DD (interpret "yesterday", "last week", etc. relative to today)`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text);
  }

  /**
   * Generate AI insights from transaction data
   */
  async generateInsights(
    transactions: any[],
    apiKey: string
  ): Promise<{
    patterns: string[];
    anomalies: string[];
    suggestions: string[];
  }> {
    const genAI = this.getAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            patterns: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            anomalies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            suggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          }
        }
      }
    });

    const prompt = `You are a financial advisor analyzing spending patterns.

Transaction data (last 30 days):
${JSON.stringify(transactions.slice(0, 100), null, 2)}

Analyze and provide:
1. patterns: 3 spending patterns (e.g., "You spend 40% more on weekends")
2. anomalies: 2 unusual transactions (e.g., "Unusually high shopping expense")
3. suggestions: 3 actionable savings tips (e.g., "Reduce dining out by 15%")`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text);
  }
}

export const geminiService = new GeminiService();