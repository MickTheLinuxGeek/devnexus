import { GoogleGenAI, Type } from "@google/genai";

// Vite replaces process.env.API_KEY at build time with the actual string literal.
// We disable TS checking here because 'process' is not defined in the browser,
// but the replacement happens before runtime.
// @ts-ignore
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Helper to parse JSON that might be wrapped in markdown code blocks
const parseGeminiJson = (text: string) => {
  try {
    // Remove markdown code blocks if present (e.g. ```json ... ```)
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw e;
  }
};

export const analyzeIssue = async (issueTitle: string, issueBody: string): Promise<{
  summary: string;
  priority: 'Low' | 'Medium' | 'High';
  suggestedFix: string;
}> => {
  if (!apiKey) {
    return {
      summary: "API Key missing. Cannot analyze.",
      priority: "Low",
      suggestedFix: "Please configure environment variables."
    };
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Analyze the following GitHub issue.
      Title: ${issueTitle}
      Body: ${issueBody}
      
      Return a JSON object with:
      1. A concise summary (max 2 sentences).
      2. A priority level (Low, Medium, High) based on urgency and severity implications.
      3. A suggested technical approach or fix strategy (max 3 bullet points).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            suggestedFix: { type: Type.STRING }
          },
          required: ["summary", "priority", "suggestedFix"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Analysis failed.",
      priority: "Medium",
      suggestedFix: "Could not generate suggestion."
    };
  }
};

export const generateResearchIdeas = async (topic: string): Promise<string[]> => {
  if (!apiKey) return ["API Key missing"];

  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: `Provide 5 key research areas or technical concepts related to: "${topic}" for a senior software engineer. Return a simple JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini Research Failed:", error);
    return ["Error fetching research ideas."];
  }
};

export const draftPullRequest = async (issueTitle: string, issueBody: string, suggestedFix?: string): Promise<{
  title: string;
  description: string;
}> => {
  if (!apiKey) {
    return {
      title: "API Key missing",
      description: "Please configure environment variables to generate PR drafts."
    };
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Draft a GitHub Pull Request based on the following issue.
      
      Issue Title: ${issueTitle}
      Issue Description: ${issueBody}
      ${suggestedFix ? `Technical Context/Proposed Fix: ${suggestedFix}` : ''}
      
      Return a JSON object with:
      1. A clear, conventional commit style PR Title.
      2. A markdown formatted PR Description including sections for "Summary", "Changes", and "Verification".
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini PR Draft Failed:", error);
    return {
      title: "Error Generating PR",
      description: "Could not generate PR draft."
    };
  }
};
