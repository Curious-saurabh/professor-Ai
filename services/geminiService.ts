import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult } from '../types';

function getAiClient() {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export async function analyzeContent(contentText: string): Promise<AnalysisResult> {
  const ai = getAiClient();

  const prompt = `
    Analyze the following academic content. Your task is to act as an expert professor.
    1. Identify all the major chapters, units, or main sections.
    2. Within each chapter, identify all important topics or key concepts.
    3. For each topic, provide a detailed, comprehensive explanation as if you were teaching it to a university student. The explanation should be thorough, clear, and easy to understand.
    4. Structure the final output strictly as the requested JSON object.
    5. **Formatting Instructions for Explanations**: Use markdown for all explanations. Use markdown headings (e.g., '### Sub-heading') to structure longer explanations. Emphasize **any important keywords or key terms** by making them bold.

    Content:
    ---
    ${contentText}
    ---
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      chapters: {
        type: Type.ARRAY,
        description: "An array of chapters, each containing topics from the content.",
        items: {
          type: Type.OBJECT,
          properties: {
            chapterTitle: {
              type: Type.STRING,
              description: "The title of the chapter or main unit."
            },
            topics: {
              type: Type.ARRAY,
              description: "An array of topics within this chapter.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The name of the specific topic or concept."
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A detailed, professor-like explanation of the topic, written in markdown format. It should include headings for structure and have key terms in **bold**."
                  }
                },
                required: ['title', 'explanation']
              }
            }
          },
          required: ['chapterTitle', 'topics']
        }
      }
    },
    required: ['chapters']
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult: AnalysisResult = JSON.parse(jsonText);
    return parsedResult;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
}

export function createProfessorChat(): Chat {
    const ai = getAiClient();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are Professor AI, a friendly and knowledgeable assistant. Your goal is to help students understand complex concepts. Explain things clearly, concisely, and patiently. Use markdown for formatting when it helps with clarity (like lists, bolding, or code snippets).',
        },
    });
}