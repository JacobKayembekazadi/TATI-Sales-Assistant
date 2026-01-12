
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { AnalysisResult, FileData } from "../types";

export async function analyzeInquiry(inquiry: string, fileData?: FileData): Promise<AnalysisResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [];
  if (inquiry.trim()) {
    parts.push({ text: `Analyze this inquiry: ${inquiry}` });
  }
  
  if (fileData) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.base64
      }
    });
    if (!inquiry.trim()) {
      parts.push({ text: "Please analyze the attached document." });
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: {
            type: Type.OBJECT,
            properties: {
              customerNeed: { type: Type.STRING },
              application: { type: Type.STRING },
              keyFactors: { type: Type.STRING },
              urgency: { type: Type.STRING }
            },
            required: ["customerNeed", "application", "keyFactors", "urgency"]
          },
          competitorConversion: {
            type: Type.OBJECT,
            properties: {
              currentlyUsing: { type: Type.STRING },
              tatiEquivalent: { type: Type.STRING },
              switchingAngle: { type: Type.STRING }
            }
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING },
              primaryReasoning: { type: Type.STRING },
              alternative: { type: Type.STRING },
              alternativeReasoning: { type: Type.STRING }
            },
            required: ["primary", "primaryReasoning"]
          },
          quoteTemplate: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              contact: { type: Type.STRING },
              contactInfo: { type: Type.STRING },
              location: { type: Type.STRING },
              lineItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    product: { type: Type.STRING },
                    quantity: { type: Type.STRING }
                  }
                }
              },
              notes: { type: Type.STRING }
            }
          },
          draft: { type: Type.STRING },
          leadScore: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              rating: { type: Type.STRING },
              signals: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedAction: { type: Type.STRING }
            },
            required: ["score", "rating", "signals", "recommendedAction"]
          },
          internalNotes: { type: Type.STRING },
          language: { type: Type.STRING }
        },
        required: ["analysis", "recommendations", "draft", "leadScore", "internalNotes", "language"]
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("The AI provided an invalid response format. Please try again.");
  }
}
