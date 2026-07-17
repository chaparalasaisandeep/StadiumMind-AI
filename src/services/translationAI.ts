import { TranslationAIRequest, TranslationAIResponse } from "./aiTypes";
import { callAIOrchestrator } from "./aiOrchestrator";

export interface TranslationAIService {
  /**
   * Instantly translates emergency logs, announcements, or messages for international World Cup teams.
   * Backward-compatible with simple string returning.
   */
  translateText(text: string, sourceLang: string, targetLang: string): Promise<string>;

  /**
   * Translates content and provides detection details, confidence scores, and cultural notes.
   */
  translateTextDetailed(request: TranslationAIRequest): Promise<TranslationAIResponse>;
}

export const translationAIService: TranslationAIService = {
  async translateText(text, sourceLang, targetLang) {
    try {
      const response = await callAIOrchestrator<TranslationAIResponse>("translation", {
        text,
        targetLang,
        context: `Translate from ${sourceLang || "detected language"} to ${targetLang}.`
      });
      return response.translatedText;
    } catch (error) {
      console.warn("translateText fallback triggered:", error);
      return text; // Fallback to returning original text
    }
  },

  async translateTextDetailed(request) {
    try {
      return await callAIOrchestrator<TranslationAIResponse>("translation", request);
    } catch (error) {
      console.error("translationAIService.translateTextDetailed failed, returning fallback:", error);
      return {
        translatedText: request.text,
        detectedLanguage: "Unknown",
        confidenceScore: 0.0,
        culturalNotes: "Translation failed due to cognitive network disconnection."
      };
    }
  }
};
