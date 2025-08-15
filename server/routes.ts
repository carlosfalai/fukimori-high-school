import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GameController } from "./controllers/gameController";
import { PaymentController } from "./controllers/paymentController";
import { AIController } from "./controllers/aiController";
import { MusicController } from "./controllers/musicController";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { insertUserSchema, loginSchema } from "@shared/schema";
import passport from "passport";
import { setupPassport } from "./config/passport";

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize controllers
  const gameController = new GameController(storage);
  const paymentController = new PaymentController(storage);
  const aiController = new AIController(storage);
  const musicController = new MusicController();

  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fukimori-high-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000, // 24 hours
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );
  
  // Initialize Passport
  const passportInstance = setupPassport();
  app.use(passportInstance.initialize());
  app.use(passportInstance.session());

  // Middleware to check if user is authenticated
  const isAuthenticated = async (req: Request, res: Response, next: Function) => {
    // Debug authentication information
    console.log('Auth check - Session ID:', req.sessionID);
    console.log('Auth check - Session data:', req.session);
    console.log('Auth check - Is authenticated via Passport:', req.isAuthenticated ? req.isAuthenticated() : 'method not available');
    
    // Check passport authentication
    if (req.isAuthenticated && req.isAuthenticated()) {
      console.log('User authenticated via Passport');
      return next();
    }
    
    // Check session-based authentication
    if (req.session && req.session.userId) {
      console.log('Found userId in session:', req.session.userId);
      
      // Attach user to request object
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          console.log('User found in storage:', user.id, user.username);
          req.user = user;
          return next();
        } else {
          console.log('User ID in session but not found in storage:', req.session.userId);
        }
      } catch (error) {
        console.error('Error retrieving user from storage:', error);
      }
    }
    
    // User is not authenticated
    console.log('Authentication failed - unauthorized access attempt');
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  
  // Google OAuth routes
  app.get('/auth/google', 
    passportInstance.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  app.get('/auth/google/callback', 
    passportInstance.authenticate('google', { failureRedirect: '/?error=oauth-failed' }),
    (req, res) => {
      // Successful authentication, store user id in session
      if (req.user && 'id' in req.user) {
        req.session.userId = req.user.id as number;
        
        // Save session explicitly to ensure it persists
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session after Google OAuth callback:', err);
            return res.redirect('/?error=session-save-failed');
          }
          
          console.log('User authenticated via Google OAuth:', req.user);
          console.log('Session saved successfully, sessionID:', req.sessionID);
          console.log('Session data:', req.session);
          
          res.redirect('/');
        });
      } else {
        console.log('Google OAuth authentication failed - no user object in request');
        res.redirect('/?error=no-user-data');
      }
    }
  );
  
  // Add a route for local testing
  app.get('/auth/google-test', async (req, res) => {
    try {
      // Check if demo user exists in storage, create if not
      let user = await storage.getUserByUsername("demo");
      
      if (!user) {
        console.log('Creating demo user for testing');
        // Create a demo user if it doesn't exist
        user = await storage.createUser({
          username: "demo",
          password: "demo123", // Not secure, only for testing
          email: "demo@example.com",
          googleId: "test-google-id",
          avatarUrl: null
        });
        console.log('Demo user created:', user);
      } else {
        console.log('Using existing demo user:', user.id, user.username);
      }
      
      // Set the user in session
      req.session.userId = user.id;
      // Save session explicitly to ensure it persists
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
        }
        console.log('Session saved. User authenticated for testing:', user.id, user.username);
        console.log('Current session:', req.sessionID, req.session);
        res.redirect('/');
      });
    } catch (error) {
      console.error('Error in google-test route:', error);
      res.status(500).send('Authentication test failed');
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error logging in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId as number);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Game routes (no authentication required for demo)
  app.get("/api/game/current", gameController.getCurrentGame);
  app.post("/api/game/create", gameController.createGame);
  app.post("/api/game/save", gameController.saveGame);
  app.post("/api/game/reset", gameController.resetGame);
  app.post("/api/game/next-page", gameController.nextPage);
  app.post("/api/game/select-choice", gameController.selectChoice);
  app.post("/api/game/settings", gameController.updateSettings);
  
  // Character routes
  app.get("/api/game/characters", gameController.getCharacters);
  app.get("/api/game/character/:id", gameController.getCharacter);
  
  // AI routes
  app.post("/api/ai/generate-dialogue", aiController.generateDialogue);
  app.post("/api/ai/generate-character", aiController.generateCharacter);
  app.post("/api/ai/generate-character-image", aiController.generateCharacterImage);
  app.get("/api/ai/player-progression", aiController.getPlayerProgression);
  app.post("/api/ai/award-experience", aiController.awardExperience);
  app.post("/api/ai/check-action", aiController.checkPlayerAction);
  app.post("/api/ai/character-data", aiController.getCharacterData);
  app.get("/api/ai/japan-realtime", aiController.getRealTimeJapanData);
  app.get("/api/ai/reputation", aiController.getPlayerReputation);
  app.post("/api/ai/trigger-achievement", aiController.triggerAchievement);
  
  // Music routes
  app.post("/api/music/location", musicController.getLocationMusic);
  app.post("/api/music/interaction", musicController.getInteractionMusic);
  app.post("/api/music/event", musicController.getEventMusic);
  app.post("/api/music/dynamic", musicController.getDynamicPlaylist);
  app.post("/api/music/search", musicController.searchMusic);
  app.get("/api/music/seasonal", musicController.getSeasonalMusic);
  app.post("/api/music/story", musicController.getStoryMusic);
  app.post("/api/music/ambient", musicController.getAmbientMusic);
  
  // Payment routes
  app.post("/api/payment/create-payment-intent", isAuthenticated, paymentController.createPaymentIntent);
  app.post("/api/payment/webhook", paymentController.handleWebhook);

  const httpServer = createServer(app);

  return httpServer;
}
