import { Request, Response } from "express";
import { IStorage } from "../storage";
import { GeminiService } from "../services/GeminiService";
import { MangaService } from "../services/MangaService";
import { Game, gameChoiceSchema, createPlayerSchema } from "@shared/schema";
import { z } from "zod";
import { createNewGame, getCurrentDayOfWeek } from "@/lib/gameState";

export class GameController {
  private storage: IStorage;
  private geminiService: GeminiService;
  private mangaService: MangaService;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.geminiService = new GeminiService(storage);
    this.mangaService = new MangaService(storage);
  }

  /**
   * Get the current game for the demo user
   */
  getCurrentGame = async (req: Request, res: Response) => {
    try {
      const userId = 1; // Use demo user ID
      let game = await this.storage.getCurrentGame(userId);

      // If no game exists, create a new one
      if (!game) {
        // Create a new game
        const newGame = createNewGame(userId);
        game = await this.storage.createGame(newGame);
      }

      // Generate dialogue choices using Gemini
      let dialogueChoices = [];
      if (game.currentScene.dialogue.length > 0) {
        const response = await this.geminiService.generateDialogue(game);
        dialogueChoices = response.choices;
      }

      res.json({ game, dialogueChoices });
    } catch (error) {
      console.error("Error getting current game:", error);
      res.status(500).json({ message: "Error getting current game" });
    }
  };

  /**
   * Create a new game for the logged in user
   */
  createGame = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the player name
      const schema = z.object({
        playerName: z.string().min(2).max(30)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get the user
      const user = await this.storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a new game
      const newGame = createNewGame(userId, validatedData.playerName);
      const game = await this.storage.createGame(newGame);
      
      // Generate initial dialogue
      const response = await this.openAIService.generateDialogue(game);
      const dialogueChoices = response.choices;
      
      // Update the game with the initial dialogue
      if (response.text) {
        const updatedScene = {
          ...game.currentScene,
          dialogue: [
            ...game.currentScene.dialogue,
            {
              character: "Aiko Tanaka", // Default initial character
              text: response.text,
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        await this.storage.updateGame(game.id, { currentScene: updatedScene });
        game.currentScene = updatedScene;
      }
      
      res.json({ game, dialogueChoices });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Error creating game" });
    }
  };

  /**
   * Save the current game state
   */
  saveGame = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the game ID
      const schema = z.object({
        gameId: z.number().int().positive()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get the game
      const game = await this.storage.getGame(validatedData.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Check if the game belongs to the user
      if (game.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Save the game (update updatedAt timestamp)
      await this.storage.updateGame(game.id, { updatedAt: new Date() });
      
      res.json({ message: "Game saved successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error saving game:", error);
      res.status(500).json({ message: "Error saving game" });
    }
  };

  /**
   * Reset the current game
   */
  resetGame = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Get the current game
      const currentGame = await this.storage.getCurrentGame(userId);
      if (!currentGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Create a new game
      const newGame = createNewGame(userId, currentGame.playerCharacter.name);
      const game = await this.storage.createGame(newGame);
      
      // Generate initial dialogue
      const response = await this.openAIService.generateDialogue(game);
      const dialogueChoices = response.choices;
      
      // Update the game with the initial dialogue
      if (response.text) {
        const updatedScene = {
          ...game.currentScene,
          dialogue: [
            ...game.currentScene.dialogue,
            {
              character: "Aiko Tanaka", // Default initial character
              text: response.text,
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        await this.storage.updateGame(game.id, { currentScene: updatedScene });
        game.currentScene = updatedScene;
      }
      
      res.json({ game, dialogueChoices });
    } catch (error) {
      console.error("Error resetting game:", error);
      res.status(500).json({ message: "Error resetting game" });
    }
  };

  /**
   * Move to the next page in the game
   */
  nextPage = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the game ID
      const schema = z.object({
        gameId: z.number().int().positive()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get the game
      const game = await this.storage.getGame(validatedData.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Check if the game belongs to the user
      if (game.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Check if there are enough pages available
      if (game.currentPage >= game.totalPages) {
        return res.status(400).json({ message: "No more pages available" });
      }
      
      // Advance to the next page
      const updatedGame = await this.storage.advanceGamePage(game.id);
      
      // Generate new dialogue
      const response = await this.geminiService.generateDialogue(updatedGame);
      const dialogueChoices = response.choices;
      
      // Update the game with the new dialogue
      if (response.text) {
        const characterName = updatedGame.currentScene.characters[0] || "Narrator";
        const updatedScene = {
          ...updatedGame.currentScene,
          dialogue: [
            ...updatedGame.currentScene.dialogue,
            {
              character: characterName,
              text: response.text,
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        await this.storage.updateGame(updatedGame.id, { currentScene: updatedScene });
        updatedGame.currentScene = updatedScene;
        
        // Generate manga frame for this interaction
        try {
          await this.mangaService.generateMangaFrame(
            updatedGame.id,
            1, // Using demo user ID
            response.text,
            characterName
          );
        } catch (error) {
          console.error("Error generating manga frame:", error);
          // Continue without throwing error as this is supplementary
        }
      }
      
      // Apply any stat or relationship updates
      if (response.updatedStats) {
        const updatedStats = {
          ...updatedGame.playerCharacter.stats,
          ...response.updatedStats
        };
        
        const updatedPlayerCharacter = {
          ...updatedGame.playerCharacter,
          stats: updatedStats
        };
        
        await this.storage.updateGame(updatedGame.id, { playerCharacter: updatedPlayerCharacter });
        updatedGame.playerCharacter = updatedPlayerCharacter;
      }
      
      if (response.updatedRelationships) {
        const updatedRelationships = {
          ...updatedGame.playerCharacter.relationships,
          ...response.updatedRelationships
        };
        
        const updatedPlayerCharacter = {
          ...updatedGame.playerCharacter,
          relationships: updatedRelationships
        };
        
        await this.storage.updateGame(updatedGame.id, { playerCharacter: updatedPlayerCharacter });
        updatedGame.playerCharacter = updatedPlayerCharacter;
      }
      
      res.json({ game: updatedGame, dialogueChoices });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error advancing game page:", error);
      res.status(500).json({ message: "Error advancing game page" });
    }
  };

  /**
   * Select a choice in the game
   */
  selectChoice = async (req: Request, res: Response) => {
    try {
      const userId = 1; // Use demo user ID
      
      // Validate the input
      const validatedData = gameChoiceSchema.parse(req.body);
      
      // Get the game
      const game = await this.storage.getGame(validatedData.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Generate the response based on the choice
      const response = await this.geminiService.generateDialogue(game, validatedData.choiceIndex);
      const dialogueChoices = response.choices;
      
      // Update the game with the new dialogue
      if (response.text) {
        const characterName = game.currentScene.characters[0] || "Narrator";
        const updatedScene = {
          ...game.currentScene,
          dialogue: [
            ...game.currentScene.dialogue,
            {
              character: characterName,
              text: response.text,
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        await this.storage.updateGame(game.id, { currentScene: updatedScene });
        game.currentScene = updatedScene;
        
        // Generate manga frame for this choice interaction
        try {
          await this.mangaService.generateMangaFrame(
            game.id,
            userId,
            response.text,
            characterName,
            `Choice ${validatedData.choiceIndex + 1} selected`
          );
        } catch (error) {
          console.error("Error generating manga frame for choice:", error);
        }
      }
      
      // Apply any stat or relationship updates
      if (response.updatedStats) {
        const updatedStats = {
          ...game.playerCharacter.stats,
          ...response.updatedStats
        };
        
        const updatedPlayerCharacter = {
          ...game.playerCharacter,
          stats: updatedStats
        };
        
        await this.storage.updateGame(game.id, { playerCharacter: updatedPlayerCharacter });
        game.playerCharacter = updatedPlayerCharacter;
      }
      
      if (response.updatedRelationships) {
        const updatedRelationships = {
          ...game.playerCharacter.relationships,
          ...response.updatedRelationships
        };
        
        const updatedPlayerCharacter = {
          ...game.playerCharacter,
          relationships: updatedRelationships
        };
        
        await this.storage.updateGame(game.id, { playerCharacter: updatedPlayerCharacter });
        game.playerCharacter = updatedPlayerCharacter;
      }
      
      res.json({ game, dialogueChoices });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error selecting choice:", error);
      res.status(500).json({ message: "Error selecting choice" });
    }
  };

  /**
   * Update game settings
   */
  updateSettings = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the settings
      const schema = z.object({
        bgmVolume: z.number().int().min(0).max(100),
        sfxVolume: z.number().int().min(0).max(100),
        autoAdvance: z.boolean(),
        showCharacterLabels: z.boolean(),
        textSpeed: z.enum(["slow", "normal", "fast", "instant"])
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get the current game
      const game = await this.storage.getCurrentGame(userId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Store settings in the game object
      const updatedGame = await this.storage.updateGame(game.id, {
        settings: validatedData
      } as any);
      
      res.json({ settings: validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Error updating settings" });
    }
  };

  /**
   * Get characters in the current game
   */
  getCharacters = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Get the current game
      const game = await this.storage.getCurrentGame(userId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Get all characters in the game
      const characters = [];
      for (const characterId of game.characters) {
        const character = await this.storage.getCharacter(characterId);
        if (character) {
          characters.push(character);
        }
      }
      
      res.json(characters);
    } catch (error) {
      console.error("Error getting characters:", error);
      res.status(500).json({ message: "Error getting characters" });
    }
  };

  /**
   * Get a specific character by ID
   */
  getCharacter = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const characterId = parseInt(req.params.id);
      
      if (isNaN(characterId)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      
      // Get the current game
      const game = await this.storage.getCurrentGame(userId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Check if the character is in the game
      if (!game.characters.includes(characterId)) {
        return res.status(404).json({ message: "Character not found in the game" });
      }
      
      // Get the character
      const character = await this.storage.getCharacter(characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.json(character);
    } catch (error) {
      console.error("Error getting character:", error);
      res.status(500).json({ message: "Error getting character" });
    }
  };
}
