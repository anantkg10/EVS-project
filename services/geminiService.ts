import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ScanResult, Severity, Article } from '../types';

export let ai: GoogleGenAI | null = null;
export let apiKeyMissingError = false;

const initializeAi = () => {
    // API key is now exclusively handled by the environment variable.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error("CRITICAL: API_KEY environment variable is not set. AI features will be disabled.");
        apiKeyMissingError = true;
        ai = null;
    } else {
        try {
            ai = new GoogleGenAI({ apiKey });
            apiKeyMissingError = false;
        } catch(e) {
            console.error("Error initializing GoogleGenAI:", e);
            apiKeyMissingError = true;
            ai = null;
        }
    }
};

// Initial call to set up the service on load
initializeAi();

const fileToGenerativePart = (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const analyzePlantImage = async (imageFile: File): Promise<ScanResult> => {
    if (!ai) {
        throw new Error("Gemini AI client is not initialized. The application administrator needs to configure the API_KEY.");
    }

    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this image of a plant leaf/stem/fruit. You are a world-class plant pathologist AI.
    For data consistency and subsequent translation, it is critical that your entire response be in English.
    1. Identify the plant disease, if any. If the plant is healthy, state that.
    2. Provide a confidence score (0-100) for your diagnosis.
    3. Assess the severity as 'Mild', 'Moderate', 'Severe', or 'Healthy'.
    4. Provide a brief, one-paragraph summary of the findings.
    5. Suggest 2-3 specific treatment methods with short descriptions.
    6. List 2-3 actionable prevention tips with short descriptions.
    
    Your response MUST be a single, valid JSON object matching the provided schema. Do not include any markdown formatting like \`\`\`json.
    IMPORTANT: All text values in the JSON response (like diseaseName, summary, treatment names and descriptions, etc.) MUST be in English.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            diseaseName: { type: Type.STRING, description: "Name of the disease or 'Healthy'" },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 100" },
            severity: { type: Type.STRING, enum: [Severity.MILD, Severity.MODERATE, Severity.SEVERE, Severity.HEALTHY] },
            summary: { type: Type.STRING, description: "A brief summary of the diagnosis." },
            treatments: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                }
            },
            preventionTips: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                }
            }
        },
        required: ["diseaseName", "confidence", "severity", "summary", "treatments", "preventionTips"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as ScanResult;
        return parsedResult;
    } catch (error) {
        console.error("Error analyzing plant image with Gemini:", error);
        throw new Error("Failed to analyze plant image. The AI model may be temporarily unavailable or the API key is invalid.");
    }
};

export const translateScanResult = async (
    englishResult: ScanResult, 
    targetLanguageName: string
): Promise<ScanResult> => {
    if (!ai) {
        throw new Error("Gemini AI client is not initialized.");
    }
    
    const textToTranslate = {
        diseaseName: englishResult.diseaseName,
        summary: englishResult.summary,
        treatments: englishResult.treatments.map(t => ({ name: t.name, description: t.description })),
        preventionTips: englishResult.preventionTips.map(p => ({ name: p.name, description: p.description })),
    };

    const prompt = `Translate all string values in the following JSON object from English into the ${targetLanguageName} language.
    Your response MUST be a single, valid JSON object with the exact same structure as the input. Do not change keys or structure. Only translate the text values.

    Input JSON (source language is English):
    ${JSON.stringify(textToTranslate, null, 2)}
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            diseaseName: { type: Type.STRING },
            summary: { type: Type.STRING },
            treatments: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                }
            },
            preventionTips: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                }
            }
        },
        required: ["diseaseName", "summary", "treatments", "preventionTips"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const translatedTexts = JSON.parse(jsonText);

        return {
            ...englishResult,
            ...translatedTexts,
        };

    } catch (error) {
        console.error(`Error translating scan result to ${targetLanguageName}:`, error);
        throw new Error(`Failed to translate analysis results. The AI model may be temporarily unavailable.`);
    }
};


export const findRelatedArticles = async (diseaseName: string, articles: Article[]): Promise<number[]> => {
    if (!ai || diseaseName.toLowerCase() === 'healthy') {
        return [];
    }

    const articleInfo = articles.map(a => ({ id: a.id, title: a.title, summary: a.summary }));

    const prompt = `Given the plant disease diagnosis "${diseaseName}", which of the following articles are the most relevant? Please return the IDs of the top 2-3 most relevant articles.

Available Articles:
${JSON.stringify(articleInfo, null, 2)}

Your response must be a JSON object containing a single key "articleIds" which is an array of numbers.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            articleIds: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
            }
        },
        required: ["articleIds"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as { articleIds: number[] };
        return parsedResult.articleIds || [];
    } catch (error) {
        console.error("Error finding related articles:", error);
        return []; // Return empty array on error to prevent UI crash
    }
};