import OpenAI from "openai";
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

export class OpenAIService {
  private openai: OpenAI;
  private storage: IStorage;

  constructor(storage: IStorage) {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    this.openai = new OpenAI({ 
      apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY
    });
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
      
      // Extract relevant game state information
      const currentScene = game.currentScene;
      const playerCharacter = game.playerCharacter;
      
      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(game, characters);
      
      // Build the user prompt based on the current scene and history
      const userPrompt = this.buildUserPrompt(game, characters, choiceSelected);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Parse the JSON response
      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error("Empty response from AI");
      }
      
      const parsedResponse = JSON.parse(responseContent) as DialogueResponse;
      
      // Ensure the choices have unique IDs
      if (parsedResponse.choices) {
        parsedResponse.choices = parsedResponse.choices.map((choice, index) => ({
          id: index,
          text: choice.text
        }));
      } else {
        parsedResponse.choices = [];
      }
      
      return parsedResponse;
    } catch (error) {
      console.error("Error generating dialogue:", error);
      throw new Error("Failed to generate dialogue. Please try again.");
    }
  }

  /**
   * Generate a new character for the game
   */
  async generateCharacter(
    role: string, 
    gender?: string, 
    ageRange?: { min: number; max: number },
    personalityTraits?: string[],
    relationshipWithPlayer?: string
  ) {
    try {
      const prompt = `
Create a detailed character for a Japanese high school visual novel set at Fukimori High School.

Role: ${role}
${gender ? `Gender: ${gender}` : 'Choose an appropriate gender for this role'}
${ageRange ? `Age Range: ${ageRange.min} to ${ageRange.max}` : 'Choose an appropriate age for this role'}
${personalityTraits && personalityTraits.length > 0 ? `Personality Traits to include: ${personalityTraits.join(', ')}` : 'Choose interesting personality traits'}
${relationshipWithPlayer ? `Relationship with Player: ${relationshipWithPlayer}` : 'Define a potential relationship with the player character'}

Respond with JSON in this format:
{
  "name": "Japanese name appropriate for the character",
  "role": "Detailed role at school",
  "age": Number between 15 and 18 for students or 22 to 65 for teachers/staff,
  "gender": "male or female",
  "personality": ["List of 4-6 personality traits"],
  "appearance": {
    "hair": {
      "color": "Hair color",
      "style": "Hair style"
    },
    "eyes": "Eye color",
    "outfit": "Regular outfit description",
    "height": Height in cm
  },
  "background": "Detailed background story (at least 3 sentences)",
  "relationships": { "player": Initial relationship score from 0-100 },
  "specialTraits": ["List of 2-3 special abilities or unique characteristics"],
  "quotes": ["List of 2-4 memorable quotes from this character"]
}

Create a character that would be interesting to interact with in a visual novel.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "user", 
            content: prompt 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from AI");
      }

      const characterData = JSON.parse(content);
      
      // Generate an image prompt for this character
      characterData.imagePrompt = await this.generateCharacterImagePrompt(characterData);
      
      return characterData;
    } catch (error) {
      console.error("Error generating character:", error);
      throw new Error("Failed to generate character. Please try again.");
    }
  }

  /**
   * Generate a prompt for character image generation
   */
  async generateCharacterImagePrompt(character: any): Promise<string> {
    try {
      const prompt = `
Create a detailed image generation prompt for an anime-style character portrait with the following details:
- Name: ${character.name}
- Age: ${character.age}
- Gender: ${character.gender}
- Role: ${character.role} at Fukimori High School
- Appearance: ${character.appearance.hair.color} ${character.appearance.hair.style} hair, ${character.appearance.eyes} eyes, height ${character.appearance.height}cm
- Outfit: ${character.appearance.outfit}
- Personality: ${character.personality.join(', ')}

The prompt should be detailed enough for an image generation AI to create a high-quality, full-body anime-style portrait. The artwork should be in the mature, cinematic style of Tite Kubo's Bleach, with sharp linework, expressive facial detail, dramatic lighting, and a composed posture.

Respond with ONLY the prompt text, nothing else.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Error generating image prompt:", error);
      return `Create a full-body anime-style portrait of ${character.name}, a ${character.age}-year-old ${character.gender} ${character.role} from Fukimori High School with ${character.appearance.hair.color} ${character.appearance.hair.style} hair and ${character.appearance.eyes} eyes, wearing ${character.appearance.outfit}.`;
    }
  }

  /**
   * Build the system prompt for the AI
   */
  private buildSystemPrompt(game: Game, characters: Character[]): string {
    return `
You are the narrative AI for "Fukimori High", a Japanese high school visual novel game. Your job is to generate realistic, engaging dialogue and story content based on the current game state.

GAME DETAILS:
- Setting: Fukimori High School (吹森高校) in Tokyo, Japan
- Current Game Year: ${game.gameYear} (Year 1-3 of high school)
- Current Game Month: ${game.gameMonth} (Japanese school year starts in April)
- Current Game Day: ${game.currentScene.day}
- Current Date: ${game.currentScene.date}
- Current Time: ${game.currentScene.time}
- Current Location: ${game.currentScene.location}

PLAYER CHARACTER:
- Name: ${game.playerCharacter.name}
- Gender: ${game.playerCharacter.gender}
- Age: ${game.playerCharacter.age}
- Year: ${game.playerCharacter.year}
- Stats: ${Object.entries(game.playerCharacter.stats).map(([key, value]) => `${key}: ${value}`).join(', ')}

CHARACTERS IN SCENE:
${characters.map(char => `- ${char.name}: ${char.role}, ${char.age} years old, ${char.gender}, Personality: ${char.personality.join(', ')}`).join('\n')}

RESPONSE INSTRUCTIONS:
- Generate dialogue appropriate for the current scene, time, and characters present
- Always respond in JSON format with the following structure:
{
  "text": "The dialogue text - should be from one character's perspective",
  "choices": [
    { "text": "First player choice option" },
    { "text": "Second player choice option" },
    { "text": "Third player choice option" }
  ],
  "updatedStats": {
    "statName": newValue
  },
  "updatedRelationships": {
    "characterId": newValue
  }
}
- Generate 3 meaningful choices that would lead to different outcomes
- Stats and relationships should only be updated if it makes narrative sense
- Keep responses concise but emotionally impactful
- Write in a natural conversational style appropriate for Japanese high school students
- Maintain the tone of a dramatic, slice-of-life visual novel with occasional humor
`;
  }

  /**
   * Build the user prompt based on current game state
   */
  private buildUserPrompt(game: Game, characters: Character[], choiceSelected?: number): string {
    const currentScene = game.currentScene;
    const playerCharacter = game.playerCharacter;
    
    // Get the most recent dialogue entries
    const recentDialogue = currentScene.dialogue.slice(-3);
    const recentDialogueText = recentDialogue.map(d => 
      `${d.character}: "${d.text}"`
    ).join('\n');
    
    let prompt = `
Current Scene: ${currentScene.location} at ${currentScene.time}
Current Activity: ${this.getCurrentActivity(game)}

Recent Dialogue:
${recentDialogueText || "This is the start of the scene."}

Characters Present: ${currentScene.characters.join(', ') || "No one else is present."}
`;

    if (choiceSelected !== undefined && game.currentScene.dialogue.length > 0) {
      prompt += `\nPlayer selected choice #${choiceSelected + 1}.\n`;
    }
    
    prompt += `\nGenerate the next dialogue line and choices for this scene. Consider the time of day, location, and current activity.`;
    
    return prompt;
  }

  /**
   * Get current activity based on time
   */
  private getCurrentActivity(game: Game): string {
    const currentTime = game.currentScene.time;
    const schedule = game.playerCharacter.scheduleToday;
    
    for (const period of schedule) {
      const [startTime] = period.time.split(' - ');
      const [endTime] = period.time.split(' - ')[1] || '23:59';
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return period.activity;
      }
    }
    
    // Outside of school hours
    if (currentTime < '08:00' || currentTime > '17:00') {
      return 'Free Time';
    }
    
    return 'Free Period';
  }
}
