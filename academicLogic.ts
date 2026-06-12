
import { GoogleGenAI, Chat, Type, ThinkingLevel } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateCourseDescription = async (title: string, keywords: string): Promise<string> => {
    if (!process.env.GEMINI_API_KEY) return "AI service is unavailable. Please configure the API Key.";

    const prompt = `Generate a compelling and professional college course description for a course titled "${title}". 
    The description should be engaging for prospective students and accurately reflect the course content.
    Incorporate the following keywords or concepts: ${keywords}.
    The description should be approximately 3-4 sentences long. Do not use markdown.`;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text || "No description generated.";
    } catch (error) {
        console.error("Error generating course description:", error);
        return "Failed to generate description. Please try again.";
    }
};

export const improveCourseDescription = async (title: string, currentDescription: string): Promise<string> => {
    if (!process.env.GEMINI_API_KEY) return "AI service is unavailable.";

    const prompt = `You are an academic curriculum expert. Take the following course title and short description and generate a more detailed, sophisticated, and professional alternative description. 
    
    COURSE TITLE: ${title}
    CURRENT DESCRIPTION: ${currentDescription}
    
    The new description should be detailed (around 60-80 words), academic in tone, and highlight the learning outcomes or key areas of study. Do not use markdown or formatting tags.`;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });
        return response.text || "No improved description generated.";
    } catch (error) {
        console.error("Error improving course description:", error);
        return "Failed to enhance description. Please try again.";
    }
};

export const createChatInstance = (history?: { role: string; parts: { text: string }[] }[]): Chat => {
    const ai = getAI();
    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: history,
        config: {
                tools: [{ googleSearch: {} }],
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                systemInstruction: `Role: You are a highly efficient and accurate Medical AI Assistant designed for Mbeya College of Health and Allied Sciences (MCHAS).

CORE GUIDELINES:
1. Direct & Precise: Answer exactly what the user asks without adding unnecessary fluff, excessive recommendations, or too many follow-up questions. Act like a top-tier assistant (like Gemini or ChatGPT).
2. Avoid Repetitive Identity: Do NOT start responses by saying "I am Salvochat" or repeatedly stating your role. Just provide the answer.
3. References First: Always use the Google Search tool for factual or medical queries and INCLUDE clear references/links at the end of your response so the user can verify the information.
4. Professional Tone: Maintain a highly professional, supportive, and academically rigorous tone aimed at medical students and staff.
5. Medical Disclaimer: If providing clinical information, include a brief note that it is for educational purposes.
6. Formatting: Use clean Markdown (bullet points, bold text) for easy scanning, avoiding dense text walls.
`,
            }
    });
};

export const generateSummary = async (text: string): Promise<string> => {
    if (!process.env.GEMINI_API_KEY) return "AI service is unavailable.";
    const prompt = `Summarize the following text for a medical student. Focus on key diagnostic criteria and clinical points. No markdown. TEXT: ${text}`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "No summary generated.";
    } catch (error) {
        return "Error summarizing.";
    }
};

export const generateQuiz = async (text: string): Promise<any> => {
    if (!process.env.GEMINI_API_KEY) return { error: "AI service unavailable." };
    const prompt = `Generate a 5-question medical quiz from this text: ${text}`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    answer: { type: Type.STRING }
                                },
                                required: ["question", "options", "answer"]
                            }
                        }
                    },
                    required: ["quiz"]
                },
            },
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        return { error: "Quiz generation failed." };
    }
};

