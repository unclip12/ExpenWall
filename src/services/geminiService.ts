import { GoogleGenAI } from '@google/genai';
import { ReceiptData, StatementData, SubcategorySuggestion } from '../types';

export class GeminiService {
  private getAI(apiKey: string) {
    return new GoogleGenAI({ apiKey });
  }

  async analyzeBankStatement(
    base64Image: string,
    mimeType: string,
    apiKey: string,
    context?: string
  ): Promise<StatementData> {
    if (!apiKey) throw new Error('API key required');
    const ai = this.getAI(apiKey);

    const prompt = `Analyze this bank statement image and extract all transactions in JSON format.
${context ? `Previous context: ${context}` : ''}

Return ONLY valid JSON (no markdown, no explanations) in this exact format:
{
  "transactions": [
    {
      "merchant": "merchant name",
      "date": "YYYY-MM-DD",
      "amount": number,
      "type": "expense" or "income",
      "category": "Food & Dining" | "Transportation" | "Shopping" | "Utilities" | "Entertainment" | "Health & Fitness" | "Groceries" | "Education" | "Other",
      "subcategory": "optional subcategory"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    return JSON.parse(jsonMatch[0]);
  }

  async analyzeReceipt(
    base64Image: string,
    mimeType: string,
    apiKey: string
  ): Promise<ReceiptData> {
    if (!apiKey) throw new Error('API key required');
    const ai = this.getAI(apiKey);

    const prompt = `Analyze this receipt/bill image and extract ALL items with complete details.

Return ONLY valid JSON (no markdown) in this exact format:
{
  "merchant": "shop name",
  "date": "YYYY-MM-DD",
  "totalAmount": number,
  "currency": "INR",
  "category": "Groceries" | "Food & Dining" | "Shopping" | "Other",
  "subcategory": "optional",
  "items": [
    {
      "name": "product name",
      "brand": "brand name if visible",
      "price": number,
      "quantity": number,
      "weight": number (if applicable),
      "weightUnit": "gram" | "kg" | "ml" | "litre" | "piece",
      "mrp": number (if shown),
      "discount": number (if applicable),
      "tax": number (if shown),
      "pricePerUnit": number (calculated)
    }
  ],
  "tax": {
    "cgst": number,
    "sgst": number,
    "total": number
  }
}

Extract every item with brand, weight/volume, quantity, MRP, discount if visible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    return JSON.parse(jsonMatch[0]);
  }

  async suggestSubcategory(
    merchant: string,
    apiKey: string
  ): Promise<SubcategorySuggestion[]> {
    if (!apiKey) throw new Error('API key required');
    const ai = this.getAI(apiKey);

    const prompt = `Given the merchant/transaction: "${merchant}"

Suggest top 3 subcategories with their parent categories.

Return ONLY valid JSON array:
[
  {
    "subcategory": "subcategory name",
    "category": "parent category",
    "emoji": "relevant emoji",
    "confidence": 0.95
  }
]

Categories: Food & Dining, Transportation, Utilities, Shopping, Groceries, Health & Fitness, Entertainment, Education, Personal Care, Government & Official, Banking & Finance, Other`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
    });
    
    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  }

  async detectEmoji(merchant: string, apiKey: string): Promise<string> {
    if (!apiKey) throw new Error('API key required');
    const ai = this.getAI(apiKey);

    const prompt = `For the merchant/product: "${merchant}"
Return ONLY a single relevant emoji (no text, no explanation).
Examples:
- "Zomato" → 🍔
- "Uber" → 🚕
- "Netflix" → 🎬
- "Dove Soap" → 🧼`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
    });
    return (response.text || '').trim();
  }

  async parseNaturalLanguage(
    input: string,
    apiKey: string
  ): Promise<{
    merchant: string;
    amount: number;
    category: string;
    subcategory?: string;
    type: 'expense' | 'income';
    date: string;
  }> {
    if (!apiKey) throw new Error('API key required');
    const ai = this.getAI(apiKey);

    const prompt = `Parse this natural language transaction: "${input}"

Return ONLY valid JSON:
{
  "merchant": "merchant name",
  "amount": number,
  "category": "appropriate category",
  "subcategory": "optional",
  "type": "expense" or "income",
  "date": "YYYY-MM-DD" (today if not specified)
}

Examples:
"Spent 500 on groceries" → {"merchant": "Groceries", "amount": 500, "category": "Groceries", "type": "expense", "date": "2026-02-01"}
"Paid 250 to Rohit" → {"merchant": "Rohit", "amount": 250, "category": "Other", "type": "expense", "date": "2026-02-01"}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse input');

    return JSON.parse(jsonMatch[0]);
  }

  async refineBankStatement(
    drafts: any[],
    userCorrection: string,
    apiKey: string
  ): Promise<any[]> {
    if (!apiKey) throw new Error('API key required');
    const ai = this.getAI(apiKey);

    const prompt = `Current transactions:
${JSON.stringify(drafts, null, 2)}

User correction: "${userCorrection}"

Apply the correction and return the updated transactions as a JSON array.
Return ONLY valid JSON array (no markdown):
[
  {
    "merchant": "...",
    "date": "YYYY-MM-DD",
    "amount": number,
    "type": "expense" | "income",
    "category": "...",
    "subcategory": "..."
  }
]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid response format');

    return JSON.parse(jsonMatch[0]).map((tx: any, idx: number) => ({
      ...tx,
      id: `draft-${Date.now()}-${idx}`,
    }));
  }
  
  async generateInsights(
    transactions: any[],
    apiKey: string
  ): Promise<{
    patterns: string[];
    anomalies: string[];
    suggestions: string[];
  }> {
    if (!apiKey) throw new Error('API key required');
    const ai = this.getAI(apiKey);

    const prompt = `You are a financial advisor analyzing spending patterns.

Transaction data (last 30 days):
${JSON.stringify(transactions.slice(0, 100), null, 2)}

Analyze and provide:
1. patterns: 3 spending patterns (e.g., "You spend 40% more on weekends")
2. anomalies: 2 unusual transactions (e.g., "Unusually high shopping expense")
3. suggestions: 3 actionable savings tips (e.g., "Reduce dining out by 15%")

Return JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');
    return JSON.parse(jsonMatch[0]);
  }
}

export const geminiService = new GeminiService();