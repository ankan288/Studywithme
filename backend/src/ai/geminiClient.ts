import { GoogleGenAI } from "@google/genai";
import { DepthLevel, TaskMode } from '../types/index';
import { promptBuilder } from './promptBuilder';
import { ethicsGuard } from './ethicsGuard';
import { logger } from '../utils/logger';

class GeminiClient {
  private client: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  public initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({ apiKey });
  }

  public isInitialized(): boolean {
    return !!this.client;
  }

  // Direct content generation for syllabus features
  public async generateContent(prompt: string): Promise<{ response: { text: () => string } }> {
    this.ensureInitialized();
    if (!this.client) throw new Error("Failed to initialize API client");

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      return {
        response: {
          text: () => response.text || ""
        }
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  public async sendMessage(
    message: string,
    depth: DepthLevel,
    mode: TaskMode
  ): Promise<{ text: string; ethicsFlag: boolean }> {
    if (!this.client) throw new Error("API Key not set");

    const { safeInput, flag } = ethicsGuard.sanitizeInput(message, mode);
    const systemInstruction = promptBuilder.buildSystemInstruction(depth, mode);
    const finalPrompt = promptBuilder.formatUserMessage(safeInput);

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        contents: finalPrompt
      });

      let responseText = response.text || "";

      if (mode === TaskMode.Assignment) {
        responseText = ethicsGuard.validateOutput(responseText);
      }

      logger.logInteraction(finalPrompt, responseText, depth, mode, flag);

      return { text: responseText, ethicsFlag: flag };

    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        text: "I'm having trouble connecting to my knowledge base right now. Please check your connection or API key.",
        ethicsFlag: false
      };
    }
  }

  // Auto-initialize from environment if not already initialized
  public ensureInitialized(): void {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }
      this.initialize(apiKey);
    }
  }
}

export const geminiClient = new GeminiClient();