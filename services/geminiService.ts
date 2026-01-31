import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData, StatementData } from "../types";

const processReceiptImage = async (base64Image: string, mimeType: string, apiKey: string): Promise<ReceiptData> => {
  try {
    if (!apiKey) {
      throw new Error("API Key is missing. Please configure it in Settings.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const currentYear = new Date().getFullYear();

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this receipt image and extract the transaction details.
            
            Context: The image might be a physical receipt, a digital order screen (e.g., Swiggy, Zomato, UberEats, Amazon), or a handwritten note.
            
            Requirements:
            1. **Merchant**: Identify the store or restaurant name. 
               - CRITICAL: If the specific restaurant name is not visible, LOOK AT THE UI (fonts, colors, layout, "Order #" style). 
               - If it looks like a food delivery app, return the App Name (e.g., "Zomato Order", "Swiggy Order", "UberEats").
               - Do not return "Unknown Merchant" unless absolutely no text or UI hints are present.
            2. **Date**: Extract the date. If the year is missing, assume the current year (${currentYear}). Return in YYYY-MM-DD format.
            3. **Total Amount**: Extract the final total numeric value (e.g., 155.40). Ignore currency symbols in this field.
            4. **Currency**: Detect currency. '₹', 'Rs', 'INR' -> 'INR'. '$', 'USD' -> 'USD'. Default to 'USD' if ambiguous.
            5. **Category**: Choose best fit: Food & Dining, Transportation, Utilities, Entertainment, Shopping, Health & Fitness, Groceries, Other.
            6. **Items**: List items with their names and prices.

            Return the data in strict JSON format.`
          }
        ]
      },
      config: {
        systemInstruction: "You are an expert receipt parser with knowledge of global app interfaces (UI). You can identify apps like Swiggy, Zomato, Uber, and Amazon based on their visual design even if the logo is cut off. Your job is to extract structured financial data. Always return valid JSON.",
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
          },
          required: ["totalAmount", "category", "items"] 
        }
      }
    });

    if (response.text) {
      try {
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanText) as ReceiptData;
        
        if (!data.merchant || data.merchant.trim() === '') {
          data.merchant = "Unknown Merchant";
        }
        
        return data;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw text:", response.text);
        throw new Error("Failed to parse the receipt data. The AI response was not valid JSON.");
      }
    } else {
      throw new Error("No text response from Gemini.");
    }

  } catch (error: any) {
    handleGeminiError(error);
    throw error;
  }
};

const analyzeBankStatement = async (base64Image: string, mimeType: string, apiKey: string): Promise<StatementData> => {
    try {
        if (!apiKey) throw new Error("API Key is missing.");

        const ai = new GoogleGenAI({ apiKey });
        const currentYear = new Date().getFullYear();

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    {
                        text: `Extract all transactions from this bank statement or transaction history list.
                        
                        CRITICAL CLEANUP RULES:
                        1. **Merchant Name**: Remove technical clutter.
                           - 'UPI/12345/Swiggy/...' -> 'Swiggy'
                           - 'POS/TERMINAL 1/STARBUCKS' -> 'Starbucks'
                           - 'AMZN Pay India Pvt' -> 'Amazon Pay'
                           - Remove dates or ref numbers from the name.
                           - Keep the name simple and readable.
                        
                        2. **Transaction Type**:
                           - Look for 'Cr', 'Credit', '+' or columns indicating Deposit/Income. Mark as 'income'.
                           - Look for 'Dr', 'Debit', '-' or columns indicating Withdrawal/Spend. Mark as 'expense'.
                        
                        3. **Category**: Auto-categorize based on the merchant name (e.g., Swiggy -> Food, Uber -> Transport).
                        
                        4. **Date**: Format YYYY-MM-DD. If year is missing in row, use ${currentYear}.`
                    }
                ]
            },
            config: {
                systemInstruction: "You are a specialized financial data extractor. You clean up messy bank transaction strings into human-readable merchant names. You accurately distinguish between Income (Credits) and Expenses (Debits).",
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
                    }
                }
            }
        });

        if (response.text) {
             const cleanText = response.text.replace(/```json|```/g, '').trim();
             return JSON.parse(cleanText) as StatementData;
        }
        throw new Error("No data returned.");

    } catch (error) {
        handleGeminiError(error);
        throw error;
    }
}

const handleGeminiError = (error: any) => {
    console.error("Gemini Error:", error);
    let errorMessage = error.message || "Unknown error";
    if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
      throw new Error("The API Key provided is invalid. Please check your settings.");
    }
}

export const geminiService = {
  processReceiptImage,
  analyzeBankStatement
};