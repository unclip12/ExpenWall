import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

const processReceiptImage = async (base64Image: string, mimeType: string): Promise<ReceiptData> => {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
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
        // Clean up potential markdown formatting before parsing
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanText) as ReceiptData;
        
        // Post-processing defaults
        if (!data.merchant || data.merchant.trim() === '') {
          data.merchant = "Unknown Merchant";
        }
        
        return data;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw text:", response.text);
        throw new Error("Failed to parse the receipt data. The AI response was not valid JSON.");
      }
    } else {
      throw new Error("No text response from Gemini. The image might be unclear or blocked by safety settings.");
    }

  } catch (error: any) {
    console.error("Error processing receipt with Gemini:", error);
    
    // Try to parse Google API JSON error message if it's stringified
    let errorMessage = error.message || "Unknown error occurred";
    
    // Check if the error message is a raw JSON string
    if (typeof errorMessage === 'string' && (errorMessage.startsWith('{') || errorMessage.startsWith('['))) {
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
        // failed to parse, keep original
      }
    }

    if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API Key in environment.");
    }

    throw new Error(errorMessage);
  }
};

export const geminiService = {
  processReceiptImage
};