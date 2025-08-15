import { GoogleGenerativeAI } from "@google/generative-ai";
import { IStorage } from "../storage";
import { Game, Character, MangaFrame, InsertMangaFrame } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

export class MangaService {
  private genAI: GoogleGenerativeAI;
  private storage: IStorage;

  constructor(storage: IStorage) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not provided - manga generation disabled");
      this.genAI = null as any; // Will use fallback responses
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    this.storage = storage;
  }

  /**
   * Generate a manga frame for the current dialogue and player interaction
   */
  async generateMangaFrame(
    gameId: number,
    userId: number,
    dialogueText: string,
    characterName?: string,
    playerChoice?: string
  ): Promise<MangaFrame> {
    try {
      // Get game and character context
      const game = await this.storage.getGame(gameId);
      if (!game) {
        throw new Error("Game not found");
      }

      // Get existing frames count for frame numbering
      const existingFrames = await this.getMangaFrames(userId, gameId);
      const frameNumber = existingFrames.length + 1;

      // Generate image prompt based on the current scene and dialogue
      const imagePrompt = await this.generateImagePrompt(game, dialogueText, characterName, playerChoice);

      // Generate the manga frame image using Imagen 4 (placeholder for now)
      const imageUrl = await this.generateFrameImage(imagePrompt, game.currentScene);

      // Create manga frame data
      const mangaFrameData: InsertMangaFrame = {
        gameId,
        userId,
        frameNumber,
        dialogueText,
        characterName,
        playerChoice,
        imagePrompt,
        imageUrl,
        sceneContext: {
          location: game.currentScene.location,
          time: game.currentScene.time,
          day: game.currentScene.day,
          characters: game.currentScene.characters,
          playerStats: game.playerCharacter.stats,
          relationships: game.playerCharacter.relationships
        }
      };

      // Save the frame to storage
      const savedFrame = await this.createMangaFrame(mangaFrameData);

      // Save frame to user's folder
      await this.saveFrameToUserFolder(userId, savedFrame);

      return savedFrame;

    } catch (error) {
      console.error("Error generating manga frame:", error);
      throw new Error("Failed to generate manga frame");
    }
  }

  /**
   * Generate an image prompt for the manga frame
   */
  private async generateImagePrompt(
    game: Game,
    dialogueText: string,
    characterName?: string,
    playerChoice?: string
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Create a detailed image prompt for a manga-style frame based on this visual novel scene:

SCENE CONTEXT:
- Location: ${game.currentScene.location}
- Time: ${game.currentScene.time}
- Characters present: ${game.currentScene.characters.join(", ")}
- Current dialogue: "${dialogueText}"
${characterName ? `- Speaking character: ${characterName}` : ""}
${playerChoice ? `- Player choice: "${playerChoice}"` : ""}

PLAYER CHARACTER:
- Name: ${game.playerCharacter.name}
- Gender: ${game.playerCharacter.gender}
- Year: ${game.playerCharacter.year}

Generate a detailed prompt for creating a manga-style frame that captures this moment. Include:
- Visual composition and camera angle
- Character expressions and body language
- Background and environmental details
- Mood and atmosphere
- Japanese manga art style specifications

Respond with just the image prompt, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }

  /**
   * Generate the actual frame image using Imagen 4 (placeholder implementation)
   */
  private async generateFrameImage(imagePrompt: string, sceneContext: any): Promise<string> {
    // This would integrate with Vertex AI's Imagen 4 API
    // For now, return a placeholder implementation
    
    console.log("Generating manga frame with prompt:", imagePrompt);
    
    // Placeholder: In real implementation, this would call Imagen 4
    // The actual integration would require Vertex AI setup and authentication
    
    // Return a placeholder URL for now
    const placeholderImages = [
      "https://i.imgur.com/classroom-scene-1.jpg",
      "https://i.imgur.com/school-hallway-2.jpg",
      "https://i.imgur.com/courtyard-scene-3.jpg"
    ];
    
    return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  }

  /**
   * Save the manga frame to the user's personal folder
   */
  private async saveFrameToUserFolder(userId: number, frame: MangaFrame): Promise<void> {
    try {
      const userFolder = path.join(process.cwd(), 'user_manga_stories', userId.toString());
      
      // Create user folder if it doesn't exist
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      // Create a story file for this frame
      const frameData = {
        frameNumber: frame.frameNumber,
        timestamp: frame.createdAt,
        dialogue: frame.dialogueText,
        character: frame.characterName,
        playerChoice: frame.playerChoice,
        imagePrompt: frame.imagePrompt,
        imageUrl: frame.imageUrl,
        sceneContext: frame.sceneContext
      };

      const frameFile = path.join(userFolder, `frame_${frame.frameNumber.toString().padStart(3, '0')}.json`);
      fs.writeFileSync(frameFile, JSON.stringify(frameData, null, 2));

      // Update or create a story index file
      const indexFile = path.join(userFolder, 'story_index.json');
      let storyIndex = { gameId: frame.gameId, totalFrames: 0, frames: [] };
      
      if (fs.existsSync(indexFile)) {
        storyIndex = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      }

      storyIndex.totalFrames = frame.frameNumber;
      storyIndex.frames.push({
        frameNumber: frame.frameNumber,
        filename: `frame_${frame.frameNumber.toString().padStart(3, '0')}.json`,
        createdAt: frame.createdAt
      });

      fs.writeFileSync(indexFile, JSON.stringify(storyIndex, null, 2));

    } catch (error) {
      console.error("Error saving frame to user folder:", error);
      // Don't throw error as this is supplementary functionality
    }
  }

  /**
   * Get all manga frames for a user's game
   */
  async getMangaFrames(userId: number, gameId: number): Promise<MangaFrame[]> {
    // This would query the database for manga frames
    // Placeholder implementation
    return [];
  }

  /**
   * Create a manga frame in storage
   */
  async createMangaFrame(frameData: InsertMangaFrame): Promise<MangaFrame> {
    // This would create the frame in the database
    // Placeholder implementation
    return {
      id: Date.now(),
      ...frameData,
      createdAt: new Date()
    } as MangaFrame;
  }

  /**
   * Get a user's complete manga story
   */
  async getUserMangaStory(userId: number, gameId: number): Promise<MangaFrame[]> {
    try {
      const userFolder = path.join(process.cwd(), 'user_manga_stories', userId.toString());
      const indexFile = path.join(userFolder, 'story_index.json');
      
      if (!fs.existsSync(indexFile)) {
        return [];
      }

      const storyIndex = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
      const frames: MangaFrame[] = [];

      for (const frameInfo of storyIndex.frames) {
        const frameFile = path.join(userFolder, frameInfo.filename);
        if (fs.existsSync(frameFile)) {
          const frameData = JSON.parse(fs.readFileSync(frameFile, 'utf8'));
          frames.push({
            id: frameData.frameNumber,
            gameId: storyIndex.gameId,
            userId,
            ...frameData
          });
        }
      }

      return frames.sort((a, b) => a.frameNumber - b.frameNumber);

    } catch (error) {
      console.error("Error loading user manga story:", error);
      return [];
    }
  }
}