
import { GoogleGenAI } from "@google/genai";

export async function getAiResponse(message: string): Promise<string> {
  if (!process.env.API_KEY) return "AI ist aktuell nicht konfiguriert.";
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "Du bist HorizontOS Assistent, ein freundlicher KI-Begleiter in einer Mitarbeiter-App für die Firma Horizont. Antworte immer hilfsbereit und auf Deutsch. Halte dich kurz.",
        temperature: 0.7,
      },
    });
    return response.text || "Entschuldigung, ich konnte keine Antwort generieren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ups, da ist etwas schief gelaufen bei der Verbindung zu meiner Intelligenz.";
  }
}
