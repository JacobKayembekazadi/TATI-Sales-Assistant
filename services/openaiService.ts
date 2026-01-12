
import OpenAI from "openai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { AnalysisResult, FileData } from "../types";

export async function analyzeInquiry(inquiry: string, fileData?: FileData): Promise<AnalysisResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_INSTRUCTION
    }
  ];

  if (fileData) {
    const content: OpenAI.Chat.ChatCompletionContentPart[] = [];

    if (inquiry.trim()) {
      content.push({ type: "text", text: `Analyze this inquiry: ${inquiry}` });
    } else {
      content.push({ type: "text", text: "Please analyze the attached document." });
    }

    if (fileData.mimeType.startsWith("image/")) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${fileData.mimeType};base64,${fileData.base64}`
        }
      });
    }

    messages.push({ role: "user", content });
  } else {
    messages.push({
      role: "user",
      content: `Analyze this inquiry: ${inquiry}`
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" }
  });

  try {
    const jsonStr = response.choices[0]?.message?.content?.trim() || "";
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error);
    throw new Error("The AI provided an invalid response format. Please try again.");
  }
}
