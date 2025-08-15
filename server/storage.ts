import {
  users,
  User,
  InsertUser,
  characters,
  Character,
  InsertCharacter,
  games,
  Game,
  InsertGame,
  payments,
  Payment,
  InsertPayment,
  GameScene,
  PlayerCharacter,
  SchoolSchedule,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserPages(userId: number, pagesAdded: number): Promise<User>;
  
  // Character operations
  getCharacter(id: number): Promise<Character | undefined>;
  getAllCharacters(): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacterImage(id: number, imageUrl: string): Promise<Character>;
  
  // Game operations
  getGame(id: number): Promise<Game | undefined>;
  getCurrentGame(userId: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, updates: Partial<Game>): Promise<Game>;
  advanceGamePage(id: number): Promise<Game>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string, completedAt?: Date): Promise<Payment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private games: Map<number, Game>;
  private payments: Map<number, Payment>;
  private userId: number;
  private characterId: number;
  private gameId: number;
  private paymentId: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.games = new Map();
    this.payments = new Map();
    this.userId = 1;
    this.characterId = 1;
    this.gameId = 1;
    this.paymentId = 1;
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: this.userId++,
      username: "demo",
      password: "password", // In a real app, this would be hashed
      email: null,
      googleId: null,
      avatarUrl: null,
      pagesAvailable: 50,
      isAdmin: false,
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create demo characters
    const aikoCharacter: Character = {
      id: this.characterId++,
      name: "Aiko Tanaka",
      role: "Student Council Vice President",
      age: 16,
      gender: "female",
      personality: ["Kind", "Diligent", "Helpful", "Organized"],
      appearance: {
        hair: {
          color: "black",
          style: "shoulder-length"
        },
        eyes: "brown",
        outfit: "Standard school uniform with a blue ribbon",
        height: 162
      },
      background: "Aiko comes from a traditional Japanese family with high expectations. As the eldest daughter, she feels responsible for setting a good example. She's been at Fukimori High since her first year and quickly rose to become a class representative due to her organizational skills and dedication. While she appears perfect on the surface, she struggles with the pressure to maintain her flawless image.",
      relationships: {
        player: 45
      },
      specialTraits: ["Excellent memory", "Calligraphy expert"],
      quotes: ["Organization is the key to success!", "I believe in you more than you believe in yourself."],
      imagePrompt: "Create a full-body anime-style portrait of Aiko Tanaka, a 16-year-old female student council member from Fukimori High School. She has black shoulder-length hair and brown eyes, wearing a standard school uniform with a blue ribbon.",
      imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=800&q=80",
      createdAt: new Date()
    };
    this.characters.set(aikoCharacter.id, aikoCharacter);
    
    // Generate demo game
    const demoGame: Game = {
      id: this.gameId++,
      userId: demoUser.id,
      currentPage: 0,
      totalPages: 50,
      currentScene: {
        location: 'entrance',
        time: '08:00',
        day: 1,
        date: '2023-04-10',
        characters: ['aiko'],
        background: 'school_entrance.jpg',
        dialogue: [
          {
            character: "Aiko Tanaka",
            text: "Welcome to Fukimori High School! My name is Aiko Tanaka, and I'll be your guide for today. It's your first day here, right? I remember how nervous I was on my first day too. Don't worry, you'll fit right in! The cherry blossoms are beautiful this time of year, aren't they?",
            timestamp: new Date().toISOString()
          }
        ]
      },
      playerCharacter: {
        name: "Player",
        gender: "male",
        year: 1,
        age: 15,
        appearance: {
          height: 170,
          build: "average",
          features: {}
        },
        stats: {
          academics: 50,
          athletics: 50,
          charm: 50,
          creativity: 50,
          reputation: 50
        },
        relationships: {
          "1": 45 // Relationship with Aiko
        },
        inventory: [],
        activities: {
          gym: 0,
          study: 0,
          club: "",
          clubTime: 0
        },
        achievements: [],
        status: {
          inSchool: true,
          detention: 0,
          suspension: 0,
          isJailed: false,
          health: 100,
          energy: 100,
          money: 1000
        },
        scheduleToday: [
          { time: '08:30 - 08:45', activity: 'Morning Assembly' },
          { time: '08:50 - 09:40', activity: 'Mathematics' },
          { time: '09:50 - 10:40', activity: 'Japanese' },
          { time: '10:50 - 11:40', activity: 'Science' },
          { time: '11:50 - 12:40', activity: 'English' },
          { time: '12:40 - 13:30', activity: 'Lunch Break' },
          { time: '13:30 - 14:20', activity: 'Social Studies' },
          { time: '14:30 - 15:20', activity: 'Physical Education' },
          { time: '15:30 - 17:00', activity: 'Club Activities' }
        ]
      },
      characters: [aikoCharacter.id],
      gameYear: 1,
      gameMonth: 4,
      schoolSchedule: {
        monday: [
          { time: '08:30 - 08:45', activity: 'Morning Assembly' },
          { time: '08:50 - 09:40', activity: 'Mathematics' },
          { time: '09:50 - 10:40', activity: 'Japanese' },
          { time: '10:50 - 11:40', activity: 'Science' },
          { time: '11:50 - 12:40', activity: 'English' },
          { time: '12:40 - 13:30', activity: 'Lunch Break' },
          { time: '13:30 - 14:20', activity: 'Social Studies' },
          { time: '14:30 - 15:20', activity: 'Physical Education' },
          { time: '15:30 - 17:00', activity: 'Club Activities' }
        ],
        tuesday: [
          { time: '08:30 - 08:45', activity: 'Homeroom' },
          { time: '08:50 - 09:40', activity: 'Science' },
          { time: '09:50 - 10:40', activity: 'Mathematics' },
          { time: '10:50 - 11:40', activity: 'Japanese' },
          { time: '11:50 - 12:40', activity: 'Art' },
          { time: '12:40 - 13:30', activity: 'Lunch Break' },
          { time: '13:30 - 14:20', activity: 'English' },
          { time: '14:30 - 15:20', activity: 'Music' },
          { time: '15:30 - 17:00', activity: 'Club Activities' }
        ],
        wednesday: [
          { time: '08:30 - 08:45', activity: 'Homeroom' },
          { time: '08:50 - 09:40', activity: 'Japanese' },
          { time: '09:50 - 10:40', activity: 'Social Studies' },
          { time: '10:50 - 11:40', activity: 'Mathematics' },
          { time: '11:50 - 12:40', activity: 'English' },
          { time: '12:40 - 13:30', activity: 'Lunch Break' },
          { time: '13:30 - 14:20', activity: 'Science' },
          { time: '14:30 - 15:20', activity: 'Technical Arts' },
          { time: '15:30 - 17:00', activity: 'Club Activities' }
        ],
        thursday: [
          { time: '08:30 - 08:45', activity: 'Homeroom' },
          { time: '08:50 - 09:40', activity: 'English' },
          { time: '09:50 - 10:40', activity: 'Science' },
          { time: '10:50 - 11:40', activity: 'Japanese' },
          { time: '11:50 - 12:40', activity: 'Mathematics' },
          { time: '12:40 - 13:30', activity: 'Lunch Break' },
          { time: '13:30 - 14:20', activity: 'Social Studies' },
          { time: '14:30 - 15:20', activity: 'Physical Education' },
          { time: '15:30 - 17:00', activity: 'Club Activities' }
        ],
        friday: [
          { time: '08:30 - 08:45', activity: 'Homeroom' },
          { time: '08:50 - 09:40', activity: 'Mathematics' },
          { time: '09:50 - 10:40', activity: 'English' },
          { time: '10:50 - 11:40', activity: 'Japanese' },
          { time: '11:50 - 12:40', activity: 'Science' },
          { time: '12:40 - 13:30', activity: 'Lunch Break' },
          { time: '13:30 - 14:20', activity: 'Social Studies' },
          { time: '14:30 - 15:20', activity: 'Health Education' },
          { time: '15:30 - 17:00', activity: 'Club Activities' }
        ],
        saturday: [
          { time: '08:30 - 08:45', activity: 'Homeroom' },
          { time: '08:50 - 09:40', activity: 'Elective Course' },
          { time: '09:50 - 10:40', activity: 'Elective Course' },
          { time: '10:50 - 11:40', activity: 'Class Meeting' },
          { time: '11:50 - 12:40', activity: 'Cleaning Time' },
          { time: '12:40 - 13:00', activity: 'Weekly Assembly' }
        ],
        sunday: []
      },
      history: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.games.set(demoGame.id, demoGame);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password || null,
      email: insertUser.email || null,
      googleId: insertUser.googleId || null,
      avatarUrl: insertUser.avatarUrl || null,
      pagesAvailable: 50,
      isAdmin: false,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPages(userId: number, pagesAdded: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.pagesAvailable += pagesAdded;
    this.users.set(userId, user);
    return user;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.characterId++;
    const character: Character = {
      id,
      name: insertCharacter.name,
      role: insertCharacter.role,
      age: insertCharacter.age,
      gender: insertCharacter.gender,
      personality: insertCharacter.personality,
      appearance: insertCharacter.appearance,
      background: insertCharacter.background,
      relationships: insertCharacter.relationships,
      specialTraits: insertCharacter.specialTraits,
      quotes: insertCharacter.quotes,
      imagePrompt: insertCharacter.imagePrompt || null,
      imageUrl: insertCharacter.imageUrl || null,
      createdAt: new Date()
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacterImage(id: number, imageUrl: string): Promise<Character> {
    const character = await this.getCharacter(id);
    if (!character) {
      throw new Error("Character not found");
    }
    
    character.imageUrl = imageUrl;
    this.characters.set(id, character);
    return character;
  }

  // Game methods
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getCurrentGame(userId: number): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.userId === userId
    );
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameId++;
    // Ensure characters is an array of numbers
    const characters = Array.isArray(insertGame.characters) ? 
      insertGame.characters : 
      (insertGame.characters ? [insertGame.characters] : []);
    
    const game: Game = {
      id,
      userId: insertGame.userId,
      currentPage: insertGame.currentPage || 0,
      totalPages: insertGame.totalPages || 50,
      currentScene: insertGame.currentScene,
      playerCharacter: insertGame.playerCharacter,
      characters: characters,
      gameYear: insertGame.gameYear || 1,
      gameMonth: insertGame.gameMonth || 4,
      schoolSchedule: insertGame.schoolSchedule,
      history: insertGame.history || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, updates: Partial<Game>): Promise<Game> {
    const game = await this.getGame(id);
    if (!game) {
      throw new Error("Game not found");
    }
    
    const updatedGame = { ...game, ...updates, updatedAt: new Date() };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async advanceGamePage(id: number): Promise<Game> {
    const game = await this.getGame(id);
    if (!game) {
      throw new Error("Game not found");
    }
    
    // Check if user has pages available
    const user = await this.getUser(game.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    if (game.currentPage >= game.totalPages) {
      throw new Error("No more pages available");
    }
    
    // Advance page
    game.currentPage++;
    
    // Advance time by one hour
    let [hours, minutes] = game.currentScene.time.split(':').map(Number);
    hours = (hours + 1) % 24;
    game.currentScene.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // If day changes
    if (hours === 0 && minutes === 0) {
      this.advanceGameDay(game);
    }
    
    // Update player status (energy decreases with time)
    game.playerCharacter.status.energy = Math.max(0, game.playerCharacter.status.energy - 5);
    
    // Update the game
    game.updatedAt = new Date();
    this.games.set(id, game);
    
    return game;
  }

  private advanceGameDay(game: Game): void {
    game.currentScene.day++;
    
    // Update date
    const currentDate = new Date(game.currentScene.date);
    currentDate.setDate(currentDate.getDate() + 1);
    game.currentScene.date = currentDate.toISOString().split('T')[0];
    
    // If month changes
    if (currentDate.getDate() === 1) {
      game.gameMonth = currentDate.getMonth() + 1;
      
      // If school year changes (April is the start of school year in Japan)
      if (game.gameMonth === 4) {
        game.gameYear++;
        game.playerCharacter.year = Math.min(3, game.playerCharacter.year + 1);
        game.playerCharacter.age++;
      }
    }
    
    // Reset player energy and health
    game.playerCharacter.status.energy = 100;
    game.playerCharacter.status.health = Math.min(100, game.playerCharacter.status.health + 20);
    
    // Update today's schedule based on day of week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[currentDate.getDay()];
    game.playerCharacter.scheduleToday = game.schoolSchedule[dayOfWeek as keyof SchoolSchedule] || [];
  }

  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async updatePaymentStatus(id: number, status: string, completedAt?: Date): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    payment.status = status;
    if (completedAt) {
      payment.completedAt = completedAt;
    }
    
    this.payments.set(id, payment);
    return payment;
  }
}

export const storage = new MemStorage();
