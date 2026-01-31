import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData, StatementData, DraftTransaction } from "../types";

// Using the experimental model as it typically has better availability/quotas in preview
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

/**
 * Creates a new GoogleGenAI instance. Centralised so the model name
 * is easy to change in one place.
 */
const createAI = (apiKey: string) => new GoogleGenAI({ apiKey });

// ─── Receipt Processing ──────────────────────────────────────────────────────

const processReceiptImage = async (
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<ReceiptData> => {
  if (!apiKey) throw new Error("API Key is missing. Please configure it in Settings.");

  const ai = createAI(apiKey);
  const currentYear = new Date().getFullYear();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        {
          text: `Analyze this receipt image and extract the transaction details.

Context: The image might be a physical receipt, a digital order screen (e.g., Swiggy, Zomato, UberEats, Amazon), or a handwritten note.

Requirements:
1. Merchant: Identify the store or restaurant name.
   - If the specific restaurant name is not visible, examine the UI (fonts, colors, layout).
   - If it looks like a food delivery app, return the App Name (e.g., "Zomato Order", "Swiggy Order").
   - Do not return "Unknown Merchant" unless absolutely no text or UI hints are present.
2. Date: Extract the date. If the year is missing, assume ${currentYear}. Return in YYYY-MM-DD format.
3. Total Amount: Extract the final total numeric value (e.g., 155.40). Ignore currency symbols.
4. Currency: Detect currency. '₹', 'Rs', 'INR' -> 'INR'. '$', 'USD' -> 'USD'. Default to 'USD' if ambiguous.
5. Category: Choose best fit: Food & Dining, Transportation, Utilities, Entertainment, Shopping, Health & Fitness, Groceries, Other.
6. Items: List items with their names and prices.`
        }
      ]
    },
    config: {
      systemInstruction: "You are an expert receipt parser. You can identify apps like Swiggy, Zomato, Uber, and Amazon based on their visual design. Extract structured financial data. Always return valid JSON only — no extra text or markdown fences.",
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
              },
              required: ["name", "price"]
            }
          }
        },
        required: ["merchant", "totalAmount", "category", "items"]
      }
    }
  });

  if (!response.text) throw new Error("No text response from Gemini.");

  const data = JSON.parse(response.text) as ReceiptData;
  if (!data.merchant || data.merchant.trim() === '') {
    data.merchant = "Unknown Merchant";
  }
  return data;
};

// ─── Bank Statement Analysis ─────────────────────────────────────────────────

const analyzeBankStatement = async (
  base64Image: string,
  mimeType: string,
  apiKey: string,
  historyContext?: string
): Promise<StatementData> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = createAI(apiKey);
  const currentYear = new Date().getFullYear();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        {
          text: `Extract all transactions from this bank statement or transaction history list.

CRITICAL CLEANUP RULES:
1. Merchant Name: Remove technical clutter.
   - 'UPI/12345/Swiggy/...' -> 'Swiggy'
   - 'POS/TERMINAL 1/STARBUCKS' -> 'Starbucks'
   - 'AMZN Pay India Pvt' -> 'Amazon Pay'
   - 'IDFC FAS' -> 'Fastag' (unless overridden by context)
   - Remove dates or ref numbers from the name.

2. Transaction Type:
   - 'Cr', 'Credit', '+', Deposit/Income columns -> 'income'
   - 'Dr', 'Debit', '-', Withdrawal/Spend columns -> 'expense'

3. Category: Auto-categorize based on merchant name.
   - Use HISTORY CONTEXT below to match user preferences.

4. Date: Format YYYY-MM-DD. If year is missing, use ${currentYear}.`
        }
      ]
    },
    config: {
      systemInstruction: `You are a specialised financial data extractor. Clean up messy bank transaction strings into human-readable merchant names.

HISTORY CONTEXT (use this to learn user preferences):
${historyContext || "No history available."}`,
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
                type: { type: Type.STRING, enum: ['expense', 'income'] },
                category: { type: Type.STRING }
              },
              required: ["merchant", "amount", "type"]
            }
          }
        },
        required: ["transactions"]
      }
    }
  });

  if (!response.text) throw new Error("No data returned.");
  return JSON.parse(response.text) as StatementData;
};

// ─── Draft Refinement ────────────────────────────────────────────────────────

const refineBankStatement = async (
  currentDrafts: DraftTransaction[],
  userInstruction: string,
  apiKey: string
): Promise<DraftTransaction[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = createAI(apiKey);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: {
      parts: [
        {
          text: `I have a list of extracted transactions. The user wants to correct or refine them.

Current Data: ${JSON.stringify(currentDrafts)}

User Instruction: "${userInstruction}"

Apply the user's instruction to all relevant items and return the updated list.`
        }
      ]
    },
    config: {
      systemInstruction: "You are a financial data assistant. You take a JSON list of transactions and a user correction request, and you return the corrected JSON list. Return only the JSON — no extra text.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                merchant: { type: Type.STRING },
                date: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ['expense', 'income'] },
                category: { type: Type.STRING }
              },
              required: ["merchant", "amount", "type"]
            }
          }
        },
        required: ["transactions"]
      }
    }
  });

  if (!response.text) throw new Error("No refinement data returned.");
  const data = JSON.parse(response.text) as StatementData;
  return data.transactions as unknown as DraftTransaction[];
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const geminiService = {
  processReceiptImage,
  analyzeBankStatement,
  refineBankStatement
};