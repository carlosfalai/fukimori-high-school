import { Request, Response } from "express";
import { SpotifyService, MoodPlaylist } from "../services/SpotifyService";
import { z } from "zod";

export class MusicController {
  private spotifyService: SpotifyService;

  constructor() {
    this.spotifyService = new SpotifyService();
  }

  /**
   * Get music for a specific location
   */
  getLocationMusic = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        location: z.string().min(1),
        mood: z.string().optional().default('neutral'),
        timeOfDay: z.string().optional().default('day')
      });

      const validatedData = schema.parse(req.body);

      const playlist = await this.spotifyService.getLocationSoundtrack(
        validatedData.location,
        validatedData.mood,
        validatedData.timeOfDay
      );

      res.json({
        success: true,
        playlist,
        message: `Music for ${validatedData.location} (${validatedData.mood} mood)`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error getting location music:", error);
      res.status(500).json({ message: "Error fetching music for location" });
    }
  };

  /**
   * Get music for character interactions
   */
  getInteractionMusic = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        characterName: z.string().min(1),
        emotion: z.string().min(1),
        relationship: z.string().min(1)
      });

      const validatedData = schema.parse(req.body);

      const tracks = await this.spotifyService.getCharacterInteractionMusic(
        validatedData.characterName,
        validatedData.emotion,
        validatedData.relationship
      );

      res.json({
        success: true,
        tracks,
        context: {
          character: validatedData.characterName,
          emotion: validatedData.emotion,
          relationship: validatedData.relationship
        },
        message: `Music for interaction with ${validatedData.characterName}`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error getting interaction music:", error);
      res.status(500).json({ message: "Error fetching interaction music" });
    }
  };

  /**
   * Get music for special events
   */
  getEventMusic = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        eventType: z.string().min(1)
      });

      const validatedData = schema.parse(req.body);

      const tracks = await this.spotifyService.getEventMusic(validatedData.eventType);

      res.json({
        success: true,
        tracks,
        eventType: validatedData.eventType,
        message: `Music for ${validatedData.eventType} event`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error getting event music:", error);
      res.status(500).json({ message: "Error fetching event music" });
    }
  };

  /**
   * Create a dynamic playlist based on current game context
   */
  getDynamicPlaylist = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        location: z.string().min(1),
        mood: z.string().optional().default('neutral'),
        timeOfDay: z.string().optional().default('day'),
        charactersPresent: z.array(z.string()).optional().default([]),
        eventType: z.string().optional(),
        season: z.string().optional(),
        playerLevel: z.number().optional()
      });

      const validatedData = schema.parse(req.body);

      const playlist = await this.spotifyService.createDynamicPlaylist(validatedData);

      res.json({
        success: true,
        playlist,
        context: validatedData,
        message: `Dynamic playlist for your current situation at Fukimori High`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error creating dynamic playlist:", error);
      res.status(500).json({ message: "Error creating dynamic playlist" });
    }
  };

  /**
   * Search for specific tracks
   */
  searchMusic = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        query: z.string().min(1),
        limit: z.number().optional().default(20)
      });

      const validatedData = schema.parse(req.body);

      const tracks = await this.spotifyService.searchTracks(
        validatedData.query,
        validatedData.limit
      );

      res.json({
        success: true,
        tracks,
        query: validatedData.query,
        message: `Search results for "${validatedData.query}"`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error searching music:", error);
      res.status(500).json({ message: "Error searching for music" });
    }
  };

  /**
   * Get seasonal music based on current time
   */
  getSeasonalMusic = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        season: z.string().optional(),
        month: z.number().optional()
      });

      const validatedData = schema.parse(req.body);

      const currentMonth = validatedData.month || (new Date().getMonth() + 1);
      let season = validatedData.season;

      // Auto-determine season if not provided
      if (!season) {
        if (currentMonth >= 3 && currentMonth <= 5) season = 'spring';
        else if (currentMonth >= 6 && currentMonth <= 8) season = 'summer';
        else if (currentMonth >= 9 && currentMonth <= 11) season = 'autumn';
        else season = 'winter';
      }

      const tracks = await this.spotifyService.getSeasonalMusic(season, currentMonth);

      res.json({
        success: true,
        tracks,
        season,
        month: currentMonth,
        message: `${season.charAt(0).toUpperCase() + season.slice(1)} music for Fukimori High`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error getting seasonal music:", error);
      res.status(500).json({ message: "Error fetching seasonal music" });
    }
  };

  /**
   * Get music recommendations based on player's current story context
   */
  getStoryMusic = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        storyMoment: z.string().min(1),
        emotionalTone: z.string().min(1),
        characters: z.array(z.string()).optional().default([]),
        location: z.string().optional().default('school')
      });

      const validatedData = schema.parse(req.body);

      // Create specialized queries based on story moments
      let musicQuery = '';
      
      if (validatedData.storyMoment.includes('confession')) {
        musicQuery = 'romantic confession emotional japanese love';
      } else if (validatedData.storyMoment.includes('friendship')) {
        musicQuery = 'friendship bonds heartwarming japanese youth';
      } else if (validatedData.storyMoment.includes('conflict')) {
        musicQuery = 'dramatic tension conflict resolution';
      } else if (validatedData.storyMoment.includes('achievement')) {
        musicQuery = 'victory success celebration triumphant';
      } else if (validatedData.storyMoment.includes('mystery')) {
        musicQuery = 'mysterious investigation suspense ambient';
      } else if (validatedData.storyMoment.includes('supernatural')) {
        musicQuery = 'supernatural magical mysterious powers';
      } else {
        musicQuery = `${validatedData.emotionalTone} school life japanese emotional`;
      }

      const tracks = await this.spotifyService.searchTracks(musicQuery, 10);

      res.json({
        success: true,
        tracks,
        storyContext: {
          moment: validatedData.storyMoment,
          tone: validatedData.emotionalTone,
          characters: validatedData.characters,
          location: validatedData.location
        },
        message: `Music perfectly crafted for your story moment`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error getting story music:", error);
      res.status(500).json({ message: "Error fetching story music" });
    }
  };

  /**
   * Get ambient music for different times of day
   */
  getAmbientMusic = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
        activity: z.string().optional()
      });

      const validatedData = schema.parse(req.body);

      let query = '';
      switch (validatedData.timeOfDay) {
        case 'morning':
          query = 'morning coffee peaceful sunrise gentle start';
          break;
        case 'afternoon':
          query = 'afternoon energy productive focus midday';
          break;
        case 'evening':
          query = 'evening sunset relaxation golden hour chill';
          break;
        case 'night':
          query = 'nighttime ambient peaceful sleep dreamy';
          break;
      }

      if (validatedData.activity) {
        query += ` ${validatedData.activity}`;
      }

      const tracks = await this.spotifyService.searchTracks(query, 15);

      res.json({
        success: true,
        tracks,
        timeOfDay: validatedData.timeOfDay,
        activity: validatedData.activity,
        message: `Ambient music for ${validatedData.timeOfDay} at Fukimori High`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }

      console.error("Error getting ambient music:", error);
      res.status(500).json({ message: "Error fetching ambient music" });
    }
  };
}