
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ScanResult, Severity } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


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
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this image of a plant leaf/stem/fruit. You are a world-class plant pathologist AI. 
    1. Identify the plant disease, if any. If the plant is healthy, state that.
    2. Provide a confidence score (0-100) for your diagnosis.
    3. Assess the severity as 'Mild', 'Moderate', 'Severe', or 'Healthy'.
    4. Provide a brief, one-paragraph summary of the findings.
    5. Suggest 2-3 specific treatment methods with short descriptions.
    6. List 2-3 actionable prevention tips with short descriptions.
    
    Your response MUST be a single, valid JSON object matching the provided schema. Do not include any markdown formatting like \`\`\`json.`;

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
        throw new Error("Failed to analyze plant image. The AI model may be temporarily unavailable.");
    }
};
