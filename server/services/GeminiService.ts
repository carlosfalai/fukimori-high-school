import { GoogleGenerativeAI } from "@google/generative-ai";
import { Character, Game } from "@shared/schema";
import { IStorage } from "../storage";

export interface DialogueChoice {
  id: number;
  text: string;
}

export interface DialogueResponse {
  text: string;
  choices: DialogueChoice[];
  updatedStats?: Record<string, number>;
  updatedRelationships?: Record<string, number>;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private storage: IStorage;

  constructor(storage: IStorage) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not provided - using fallback responses");
      this.genAI = null as any; // Will use fallback responses
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    this.storage = storage;
  }

  /**
   * Generate dialogue in the visual novel based on the current game state
   */
  async generateDialogue(game: Game, choiceSelected?: number): Promise<DialogueResponse> {
    try {
      // Get characters involved in the current scene
      const characterIds = game.characters;
      const characters: Character[] = [];
      
      for (const id of characterIds) {
        const character = await this.storage.getCharacter(id);
        if (character) {
          characters.push(character);
        }
      }
      
      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(game, characters);
      const userPrompt = this.buildUserPrompt(game, characters, choiceSelected);
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      let dialogueData;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        dialogueData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", text);
        // Fallback response
        dialogueData = {
          text: text.substring(0, 200) + "...",
          choices: [
            { id: 1, text: "Continue..." }
          ]
        };
      }
      
      return {
        text: dialogueData.text || "The story continues...",
        choices: dialogueData.choices || [{ id: 1, text: "Continue..." }],
        updatedStats: dialogueData.updatedStats || {},
        updatedRelationships: dialogueData.updatedRelationships || {}
      };
      
    } catch (error) {
      console.error("Error generating dialogue with Gemini:", error);
      throw new Error("Failed to generate dialogue");
    }
  }

  /**
   * Generate a new character for the game
   */
  async generateCharacter(
    name: string, 
    role: string, 
    gameContext: string,
    existingCharacters: Character[]
  ): Promise<Partial<Character>> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const prompt = `Create a detailed character for a Japanese high school visual novel game.
      
Context: ${gameContext}
Character Name: ${name}
Role: ${role}

Existing Characters: ${existingCharacters.map(c => `${c.name} (${c.role})`).join(", ")}

Generate a unique character that fits the setting and complements existing characters. 
Respond with a JSON object containing:
{
  "name": "${name}",
  "role": "${role}",
  "age": number (15-18 for students, 25-50 for teachers),
  "gender": "Male" or "Female",
  "personality": ["trait1", "trait2", "trait3"],
  "appearance": {
    "hair": {"color": "string", "style": "string"},
    "eyes": "string",
    "height": number (in cm),
    "build": "string"
  },
  "background": "detailed background story",
  "relationships": {},
  "specialTraits": ["trait1", "trait2"],
  "quotes": ["quote1", "quote2", "quote3"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error("Failed to parse character generation response:", text);
        throw new Error("Failed to parse character data");
      }
      
    } catch (error) {
      console.error("Error generating character with Gemini:", error);
      throw new Error("Failed to generate character");
    }
  }

  /**
   * Generate an image for a character using Imagen 4
   */
  async generateCharacterImage(character: Character): Promise<{ imageUrl: string }> {
    try {
      // For now, we'll use a text-based image generation approach
      // Note: Imagen 4 integration would require additional setup with Vertex AI
      const imagePrompt = this.generateImagePrompt(character);
      
      // Placeholder for actual Imagen 4 implementation
      // This would require Vertex AI setup and proper authentication
      console.log("Generated image prompt for character:", imagePrompt);
      
      // Return a placeholder for now - in real implementation, this would call Imagen 4
      return {
        imageUrl: this.getFallbackImageUrl(character)
      };
      
    } catch (error) {
      console.error("Error generating character image:", error);
      return {
        imageUrl: this.getFallbackImageUrl(character)
      };
    }
  }

  /**
   * Generate a text prompt for image generation
   */
  private generateImagePrompt(character: Character): string {
    const appearance = character.appearance;
    const personality = character.personality?.join(", ") || "friendly";
    
    return `anime style portrait of a ${character.gender.toLowerCase()} ${character.role.toLowerCase()}, 
    ${appearance?.hair?.color || "brown"} ${appearance?.hair?.style || "medium length"} hair, 
    ${appearance?.eyes || "brown"} eyes, 
    ${appearance?.build || "average"} build, 
    ${personality} personality, 
    Japanese high school setting, 
    clean anime art style, 
    high quality, 
    detailed character design`;
  }

  /**
   * Build the system prompt for the AI
   */
  private buildSystemPrompt(game: Game, characters: Character[]): string {
    return `You are a creative writer for a Japanese high school visual novel game called "Fukimori High School."

SETTING: A prestigious Japanese high school with a focus on character development, relationships, and slice-of-life storytelling.

CHARACTERS:
${characters.map(char => `- ${char.name} (${char.role}): ${char.personality?.join(", ") || "mysterious"}`).join("\n")}

PLAYER CHARACTER: ${game.playerCharacter.name} (Year ${game.playerCharacter.year})
- Stats: Academics: ${game.playerCharacter.stats.academics}, Athletics: ${game.playerCharacter.stats.athletics}, Charm: ${game.playerCharacter.stats.charm}, Creativity: ${game.playerCharacter.stats.creativity}

CURRENT SCENE:
- Location: ${game.currentScene.location}
- Time: ${game.currentScene.time}
- Day: ${game.currentScene.day}
- Date: ${game.currentScene.date}

GUIDELINES:
- Keep dialogue natural and engaging
- Advance the story meaningfully
- Show character development
- Include 2-4 meaningful dialogue choices
- Respond in JSON format with: {"text": "dialogue", "choices": [{"id": 1, "text": "choice"}], "updatedStats": {}, "updatedRelationships": {}}
- Keep responses appropriate for a high school setting
- Focus on character interactions and relationship building`;
  }

  /**
   * Build the user prompt based on current game state
   */
  private buildUserPrompt(game: Game, characters: Character[], choiceSelected?: number): string {
    let prompt = `Current Activity: ${this.getCurrentActivity(game)}
    
Previous dialogue: ${game.currentScene.dialogue?.map(d => `${d.character}: ${d.text}`).join("\n") || "Starting new scene"}`;

    if (choiceSelected !== undefined) {
      prompt += `\n\nPlayer just selected choice ${choiceSelected + 1}. Continue the story based on this choice.`;
    } else {
      prompt += `\n\nGenerate the next dialogue in this scene.`;
    }

    prompt += `\n\nGenerate engaging dialogue that moves the story forward. Include meaningful choices for the player.`;

    return prompt;
  }

  /**
   * Get current activity based on time
   */
  private getCurrentActivity(game: Game): string {
    const time = game.currentScene.time;
    const hour = parseInt(time.split(":")[0]);

    if (hour >= 8 && hour < 12) return "Morning Classes";
    if (hour >= 12 && hour < 13) return "Lunch Break";
    if (hour >= 13 && hour < 16) return "Afternoon Classes";
    if (hour >= 16 && hour < 18) return "After School Activities";
    if (hour >= 18 && hour < 22) return "Evening Free Time";
    return "Free Time";
  }

  /**
   * Get a fallback image URL based on character gender and role
   */
  private getFallbackImageUrl(character: Character): string {
    const baseUrl = "https://i.imgur.com/";
    
    if (character.gender === "Female") {
      if (character.role === "Student") {
        return `${baseUrl}YFi37nw.png`; // Female student
      } else {
        return `${baseUrl}YFi37nw.png`; // Female teacher
      }
    } else {
      if (character.role === "Student") {
        return `${baseUrl}6XGZkn7.png`; // Male student
      } else {
        return `${baseUrl}RZRQDqt.png`; // Male teacher
      }
    }
  }
}