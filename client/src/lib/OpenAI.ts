import { apiRequest } from "./queryClient";

export interface StoryPrompt {
  currentScene: {
    location: string;
    time: string;
    date: string;
    characters: string[];
  };
  playerCharacter: {
    name: string;
    gender: string;
    stats: Record<string, number>;
    relationships: Record<string, number>;
  };
  history: string[];
  choiceSelected?: number;
}

export interface DialogueChoice {
  id: number;
  text: string;
}

export interface StoryResponse {
  text: string;
  choices: DialogueChoice[];
  updatedStats?: Record<string, number>;
  updatedRelationships?: Record<string, number>;
}

export async function generateStoryDialogue(
  prompt: StoryPrompt
): Promise<StoryResponse> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/ai/generate-dialogue",
      prompt
    );
    return await response.json();
  } catch (error) {
    console.error("Error generating dialogue:", error);
    throw new Error("Failed to generate dialogue. Please try again.");
  }
}

export interface CharacterGenerationPrompt {
  role: string;
  gender?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  personalityTraits?: string[];
  relationshipWithPlayer?: string;
}

export async function generateCharacter(
  prompt: CharacterGenerationPrompt
) {
  try {
    const response = await apiRequest(
      "POST",
      "/api/ai/generate-character",
      prompt
    );
    return await response.json();
  } catch (error) {
    console.error("Error generating character:", error);
    throw new Error("Failed to generate character. Please try again.");
  }
}

export async function generateCharacterImage(characterId: number) {
  try {
    const response = await apiRequest(
      "POST",
      "/api/ai/generate-character-image",
      { characterId }
    );
    return await response.json();
  } catch (error) {
    console.error("Error generating character image:", error);
    throw new Error("Failed to generate character image. Please try again.");
  }
}
