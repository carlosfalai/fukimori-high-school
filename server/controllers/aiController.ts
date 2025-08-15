import { Request, Response } from "express";
import { IStorage } from "../storage";
import { GeminiService } from "../services/GeminiService";
import { DeepSeekService, DialogueContext } from "../services/DeepSeekService";
import { PlayerProgression } from "../services/PlayerProgression";
import { RealTimeJapanService } from "../services/RealTimeJapanService";
import { AchievementSystem, Achievement } from "../services/AchievementSystem";
import { z } from "zod";

export class AIController {
  private storage: IStorage;
  private geminiService: GeminiService;
  private deepSeekService: DeepSeekService;
  private playerProgression: PlayerProgression;
  private realTimeJapan: RealTimeJapanService;
  private achievementSystem: AchievementSystem;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.geminiService = new GeminiService(storage);
    this.deepSeekService = new DeepSeekService(process.env.DEEPSEEK_API_KEY || '');
    this.playerProgression = new PlayerProgression(this.deepSeekService);
    this.realTimeJapan = new RealTimeJapanService();
    this.achievementSystem = new AchievementSystem();
  }


  /**
   * Generate a new character with full consistency seed
   */
  generateCharacter = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the input
      const schema = z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        gender: z.enum(["male", "female"]).optional(),
        ageRange: z.object({
          min: z.number().int().min(15),
          max: z.number().int().max(18)
        }).optional(),
        personalityTraits: z.array(z.string()).optional(),
        relationshipWithPlayer: z.string().optional(),
        supernaturalPower: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Create comprehensive character seed using DeepSeek service
      const characterSeed = this.deepSeekService.createCharacterSeed({
        name: validatedData.name,
        age: validatedData.ageRange ? 
          Math.floor(Math.random() * (validatedData.ageRange.max - validatedData.ageRange.min + 1)) + validatedData.ageRange.min : 
          16,
        gender: validatedData.gender || (Math.random() > 0.5 ? 'female' : 'male'),
        appearance: {
          hairColor: ['black', 'brown', 'blonde', 'red', 'dark brown'][Math.floor(Math.random() * 5)],
          hairStyle: ['short', 'medium length', 'long', 'ponytail', 'twin tails'][Math.floor(Math.random() * 5)],
          eyeColor: ['brown', 'black', 'blue', 'green', 'hazel'][Math.floor(Math.random() * 5)],
          height: ['short', 'average', 'tall'][Math.floor(Math.random() * 3)],
          bodyType: ['slim', 'average', 'athletic'][Math.floor(Math.random() * 3)],
          distinctiveFeatures: [],
          outfits: {
            schoolUniform: 'Fukimori High School uniform with personal touches',
            casualWear: ['comfortable casual clothes'],
            specialOutfits: [],
            accessories: []
          },
          physicalMarks: []
        },
        personality: {
          traits: validatedData.personalityTraits || ['friendly', 'curious'],
          likes: ['studying', 'friends', 'school activities'],
          dislikes: ['rudeness', 'dishonesty'],
          fears: ['failure', 'loneliness'],
          goals: ['graduate successfully', 'make good friends'],
          speechPattern: 'normal',
          coreValues: ['friendship', 'honesty'],
          behaviorPatterns: ['helpful to friends'],
          socialStyle: 'friendly'
        },
        background: {
          family: {
            father: { name: `${validatedData.name}'s Father`, occupation: 'office worker', personality: 'caring' },
            mother: { name: `${validatedData.name}'s Mother`, occupation: 'teacher', personality: 'supportive' },
            siblings: [],
            familyWealth: 'middle class',
            familyReputation: 'respectable'
          },
          homeAddress: 'Fukimori City residential area',
          roomDescription: 'typical teenager room with personal interests',
          economicStatus: 'middle class',
          backstory: `${validatedData.name} is a student at Fukimori High School with a ${validatedData.role} role.`,
          secrets: [],
        },
        abilities: {
          academic: { subjects: ['Mathematics', 'Japanese'], averageGrade: 'B', studyHabits: 'regular' },
          athletic: { sports: [], physicalStrength: 5, endurance: 5 },
          artistic: { talents: [], skill_level: 'beginner' },
          social: { reputation: 50, popularityLevel: 'average', socialCircle: [] },
          supernatural: validatedData.supernaturalPower ? {
            powers: [validatedData.supernaturalPower],
            powerLevel: 3,
            limitations: ['still learning to control'],
            awakening_story: 'recently discovered during a stressful situation',
            control_level: 'beginner'
          } : undefined
        },
        dailyRoutine: {
          morning: 'arrives at school on time',
          lunch: 'eats with classmates',
          afterSchool: 'participates in school activities',
          weekend: 'spends time with family and friends'
        },
        reputationTags: [validatedData.role]
      });

      // Set initial relationship with player
      if (validatedData.relationshipWithPlayer) {
        this.deepSeekService.updateCharacterRelationship(
          characterSeed.id,
          'player',
          { type: validatedData.relationshipWithPlayer, newMemory: 'First meeting with player' }
        );
      }
      
      res.json({
        id: characterSeed.id,
        name: characterSeed.name,
        role: validatedData.role,
        appearance: characterSeed.appearance,
        personality: characterSeed.personality,
        background: characterSeed.background,
        abilities: characterSeed.abilities
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error generating character:", error);
      res.status(500).json({ message: "Error generating character" });
    }
  };

  /**
   * Generate an image for a character using consistent appearance data
   */
  generateCharacterImage = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the input
      const schema = z.object({
        characterId: z.string().min(1),
        situation: z.enum(['school', 'casual', 'special']).optional().default('school'),
        emotion: z.string().optional().default('neutral')
      });
      
      const validatedData = schema.parse(req.body);
      
      try {
        // Get consistent character appearance from DeepSeek service
        const appearancePrompt = this.deepSeekService.getCharacterAppearancePrompt(
          validatedData.characterId, 
          validatedData.situation
        );
        const personalityPrompt = this.deepSeekService.getCharacterPersonalityPrompt(validatedData.characterId);
        
        // Generate the image using the enhanced manga style
        const imagePrompt = `${appearancePrompt}. ${personalityPrompt}. ${validatedData.emotion} expression. High quality manga art style, detailed character illustration, professional anime artwork, clean linework, screen tones, Japanese high school setting`;
        
        // Here you would call your image generation service (Gamma AI, etc.)
        // For now, return the prompt that would be used
        res.json({ 
          success: true,
          characterId: validatedData.characterId,
          imagePrompt,
          situation: validatedData.situation,
          emotion: validatedData.emotion,
          message: "Character image prompt generated with consistent appearance data"
        });
        
      } catch (characterError) {
        // Character not found in DeepSeek service, fallback to database
        const character = await this.storage.getCharacter(parseInt(validatedData.characterId));
        if (!character) {
          return res.status(404).json({ message: "Character not found" });
        }
        
        // Generate using Gemini as fallback
        const result = await this.geminiService.generateCharacterImage(character);
        
        res.json({ 
          character, 
          imageUrl: result.imageUrl,
          method: 'fallback'
        });
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error generating character image:", error);
      res.status(500).json({ message: "Error generating character image" });
    }
  };

  /**
   * Get character consistency data
   */
  getCharacterData = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        characterId: z.string().min(1)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get all character data from DeepSeek service
      const characters = this.deepSeekService.getAllCharacters();
      const character = characters.find(c => c.id === validatedData.characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.json({
        character,
        storyMemory: this.deepSeekService.getStoryMemory()
          .filter(memory => memory.participants.includes(validatedData.characterId))
          .slice(-10),
        locations: this.deepSeekService.getAllLocations()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error getting character data:", error);
      res.status(500).json({ message: "Error getting character data" });
    }
  };

  /**
   * Calculate experience gain based on interaction type and quality
   */
  private calculateExperienceGain(userInput: string, characterEmotion: string, characterId: string): {
    amount: number;
    source: string;
    skillCategory?: string;
    description: string;
  } {
    let baseXP = 10;
    let multiplier = 1.0;
    let skillCategory: string | undefined;
    
    // Analyze user input for interaction type
    const input = userInput.toLowerCase();
    
    // Academic interactions
    if (input.includes('study') || input.includes('homework') || input.includes('class') || input.includes('learn')) {
      baseXP = 15;
      skillCategory = 'academics';
      multiplier = this.playerProgression.getExperienceMultiplier('academic');
    }
    
    // Social interactions
    else if (input.includes('hello') || input.includes('friend') || input.includes('talk') || input.includes('chat')) {
      baseXP = 12;
      skillCategory = 'charm';
      multiplier = this.playerProgression.getExperienceMultiplier('social');
    }
    
    // Creative interactions
    else if (input.includes('art') || input.includes('music') || input.includes('creative') || input.includes('draw')) {
      baseXP = 14;
      skillCategory = 'creativity';
      multiplier = this.playerProgression.getExperienceMultiplier('creative');
    }
    
    // Physical/athletic interactions
    else if (input.includes('exercise') || input.includes('sports') || input.includes('gym') || input.includes('run')) {
      baseXP = 13;
      skillCategory = 'athletics';
      multiplier = this.playerProgression.getExperienceMultiplier('physical');
    }
    
    // Helping/empathy interactions
    else if (input.includes('help') || input.includes('support') || input.includes('comfort')) {
      baseXP = 16;
      skillCategory = 'empathy';
    }
    
    // Leadership interactions
    else if (input.includes('organize') || input.includes('lead') || input.includes('suggest')) {
      baseXP = 18;
      skillCategory = 'leadership';
    }

    // Bonus XP for positive character reactions
    if (characterEmotion === 'happy' || characterEmotion === 'excited' || characterEmotion === 'grateful') {
      multiplier += 0.5;
    } else if (characterEmotion === 'angry' || characterEmotion === 'annoyed') {
      multiplier += 0.2; // Still gain some XP from challenging interactions
    }

    // Teacher interactions give more XP
    if (characterId.includes('teacher') || characterId.includes('principal')) {
      multiplier += 0.3;
    }

    const finalXP = Math.floor(baseXP * multiplier);
    
    return {
      amount: finalXP,
      source: 'character_interaction',
      skillCategory,
      description: `Interacted with character using: ${userInput}`
    };
  }

  /**
   * Get player progression data
   */
  getPlayerProgression = async (req: Request, res: Response) => {
    try {
      const playerStats = this.playerProgression.getPlayerStats();
      res.json(playerStats);
    } catch (error) {
      console.error("Error getting player progression:", error);
      res.status(500).json({ message: "Error getting player progression" });
    }
  };

  /**
   * Manually award experience (for admin/testing purposes)
   */
  awardExperience = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        amount: z.number().int().positive(),
        source: z.string().min(1),
        skillCategory: z.string().optional(),
        description: z.string().min(1)
      });
      
      const validatedData = schema.parse(req.body);
      
      const result = this.playerProgression.awardExperience({
        amount: validatedData.amount,
        source: validatedData.source,
        skillCategory: validatedData.skillCategory,
        description: validatedData.description
      });
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error awarding experience:", error);
      res.status(500).json({ message: "Error awarding experience" });
    }
  };

  /**
   * Check if player can perform a specific action
   */
  checkPlayerAction = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        action: z.string().min(1)
      });
      
      const validatedData = schema.parse(req.body);
      
      const canPerform = this.playerProgression.canPerformAction(validatedData.action);
      const requiredLevel = this.getRequiredLevelForAction(validatedData.action);
      const currentLevel = this.playerProgression.getPlayerStats().level;
      
      res.json({
        canPerform,
        action: validatedData.action,
        requiredLevel,
        currentLevel,
        message: canPerform ? 
          `You can perform ${validatedData.action}` : 
          `You need level ${requiredLevel} to perform ${validatedData.action} (current: ${currentLevel})`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error checking player action:", error);
      res.status(500).json({ message: "Error checking player action" });
    }
  };

  /**
   * Get required level for specific actions
   */
  private getRequiredLevelForAction(action: string): number {
    const actionLevels: { [key: string]: number } = {
      'join_club': 3,
      'ask_on_date': 5,
      'start_rumors': 7,
      'organize_event': 10,
      'confront_bully': 8,
      'lead_study_group': 6,
      'perform_on_stage': 12,
      'access_rooftop': 4,
      'enter_teachers_lounge': 15
    };
    
    return actionLevels[action] || 1;
  }

  /**
   * Get real-time Japan data for authentic school life simulation
   */
  getRealTimeJapanData = async (req: Request, res: Response) => {
    try {
      const japanData = await this.realTimeJapan.getCurrentJapanData();
      const timeContext = this.realTimeJapan.getTimeOfDayContext();
      const schoolYear = this.realTimeJapan.getSchoolYearInfo();

      res.json({
        success: true,
        realTime: japanData,
        timeContext,
        schoolYear,
        message: `Current time in Japan: ${japanData.currentDateTime.time} on ${japanData.currentDateTime.day}`
      });
    } catch (error) {
      console.error("Error getting real-time Japan data:", error);
      res.status(500).json({ message: "Error fetching real-time Japan data" });
    }
  };

  /**
   * Update dialogue generation to include real-time context
   */
  generateDialogue = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the input
      const schema = z.object({
        gameId: z.number().int().positive(),
        characterId: z.string().min(1),
        userInput: z.string().min(1),
        choiceIndex: z.number().int().min(0).optional()
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

      // Get real-time Japan context
      const japanData = await this.realTimeJapan.getCurrentJapanData();
      const timeContext = this.realTimeJapan.getTimeOfDayContext();

      // Build dialogue context with real-time data
      const context: DialogueContext = {
        characterId: validatedData.characterId,
        currentMood: 'neutral',
        recentMemories: this.deepSeekService.getStoryMemory().slice(-5),
        relationshipStatus: new Map(),
        currentLocation: game.currentScene.location,
        timeOfDay: timeContext.period,
        ongoingPlots: [
          `Real date: ${japanData.currentDateTime.date}`,
          `School status: ${japanData.currentDateTime.schoolStatus}`,
          `Weather: ${japanData.weather.description}`,
          `School events: ${japanData.schoolEvents.today.join(', ')}`,
          `Time context: ${timeContext.atmosphere}`
        ]
      };

      // Get other characters present in the scene
      const otherCharactersPresent = game.currentScene.characters || [];
      
      // Generate character response using DeepSeek with real-time context
      const response = await this.deepSeekService.generateCharacterResponse(
        context,
        validatedData.userInput,
        otherCharactersPresent
      );

      // Update character relationships based on the interaction
      if (response.emotion === 'happy' || response.emotion === 'excited') {
        this.deepSeekService.updateCharacterRelationship(
          validatedData.characterId,
          'player',
          { affectionChange: 2, newMemory: `Player interaction on ${japanData.currentDateTime.date}: ${validatedData.userInput}` }
        );
      } else if (response.emotion === 'angry' || response.emotion === 'annoyed') {
        this.deepSeekService.updateCharacterRelationship(
          validatedData.characterId,
          'player', 
          { affectionChange: -3, conflictEvent: `Player upset them on ${japanData.currentDateTime.date}: ${validatedData.userInput}` }
        );
      }

      // Award experience based on interaction quality and type
      const experienceGain = this.calculateExperienceGain(validatedData.userInput, response.emotion, validatedData.characterId);
      const progressionResult = this.playerProgression.awardExperience(experienceGain);

      // Check for achievements based on interaction
      let achievementUnlocked: Achievement | null = null;
      if (response.emotion === 'happy' && validatedData.userInput.toLowerCase().includes('kiss')) {
        achievementUnlocked = this.achievementSystem.triggerAchievement('first_kiss_success');
      }
      if (validatedData.characterId.includes('popular') && response.emotion === 'love') {
        achievementUnlocked = this.achievementSystem.triggerAchievement('dating_most_popular_girl');
      }
      
      res.json({
        ...response,
        experienceGained: experienceGain.amount,
        progressionResult: progressionResult.leveledUp ? progressionResult : undefined,
        achievementUnlocked: achievementUnlocked || undefined,
        realTimeContext: {
          japanTime: japanData.currentDateTime,
          weather: japanData.weather,
          schoolStatus: japanData.currentDateTime.schoolStatus,
          timeOfDay: timeContext.period,
          atmosphere: timeContext.atmosphere
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error generating dialogue:", error);
      res.status(500).json({ message: "Error generating dialogue" });
    }
  };

  /**
   * Get player's current reputation and achievements
   */
  getPlayerReputation = async (req: Request, res: Response) => {
    try {
      const reputation = this.achievementSystem.getReputationStatus();
      const recentAchievements = this.achievementSystem.getRecentAchievements();
      
      res.json({
        success: true,
        reputation,
        recentAchievements,
        message: `Current reputation: ${reputation.currentTitle}`
      });
    } catch (error) {
      console.error("Error getting player reputation:", error);
      res.status(500).json({ message: "Error fetching player reputation" });
    }
  };

  /**
   * Manually trigger achievement (for testing/admin purposes)
   */
  triggerAchievement = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        eventId: z.string().min(1)
      });
      
      const validatedData = schema.parse(req.body);
      
      const achievement = this.achievementSystem.triggerAchievement(validatedData.eventId);
      
      if (achievement) {
        res.json({
          success: true,
          achievement,
          newReputation: this.achievementSystem.getReputationStatus(),
          message: `Achievement unlocked: ${achievement.name}`
        });
      } else {
        res.json({
          success: false,
          message: "Achievement not found or already unlocked"
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error triggering achievement:", error);
      res.status(500).json({ message: "Error triggering achievement" });
    }
  };
}
