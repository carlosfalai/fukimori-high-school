import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  googleId: text("google_id").unique(),
  avatarUrl: text("avatar_url"),
  pagesAvailable: integer("pages_available").notNull().default(50),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  personality: json("personality").$type<string[]>().notNull(),
  appearance: json("appearance").$type<Appearance>().notNull(),
  background: text("background").notNull(),
  relationships: json("relationships").$type<Record<string, number>>().notNull(),
  specialTraits: json("special_traits").$type<string[]>().notNull(),
  quotes: json("quotes").$type<string[]>().notNull(),
  imagePrompt: text("image_prompt"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currentPage: integer("current_page").notNull().default(0),
  totalPages: integer("total_pages").notNull().default(50),
  currentScene: json("current_scene").$type<GameScene>().notNull(),
  playerCharacter: json("player_character").$type<PlayerCharacter>().notNull(),
  characters: json("characters").$type<number[]>().notNull(),
  gameYear: integer("game_year").notNull().default(1),
  gameMonth: integer("game_month").notNull().default(4),
  schoolSchedule: json("school_schedule").$type<SchoolSchedule>().notNull(),
  history: json("history").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  pagesAdded: integer("pages_added").notNull(),
  stripePaymentId: text("stripe_payment_id").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const mangaFrames = pgTable("manga_frames", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  userId: integer("user_id").notNull().references(() => users.id),
  frameNumber: integer("frame_number").notNull(),
  dialogueText: text("dialogue_text").notNull(),
  characterName: text("character_name"),
  playerChoice: text("player_choice"),
  imagePrompt: text("image_prompt").notNull(),
  imageUrl: text("image_url"),
  sceneContext: json("scene_context").$type<Record<string, any>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type Appearance = {
  hair?: {
    color: string;
    style: string;
  };
  eyes?: string;
  outfit?: string;
  height?: number;
  build?: string;
  features?: Record<string, string>;
};

export type GameScene = {
  location: string;
  time: string;
  day: number;
  date: string;
  characters: string[];
  background: string;
  dialogue: DialogueEntry[];
};

export type DialogueEntry = {
  character: string;
  text: string;
  timestamp: string;
};

export type PlayerStats = {
  academics: number;
  athletics: number;
  charm: number;
  creativity: number;
  reputation: number;
};

export type PlayerStatus = {
  inSchool: boolean;
  detention: number;
  suspension: number;
  isJailed: boolean;
  health: number;
  energy: number;
  money: number;
};

export type PlayerActivities = {
  gym: number;
  study: number;
  club: string;
  clubTime: number;
};

export type ScheduleItem = {
  time: string;
  activity: string;
};

export type SchoolSchedule = {
  monday: ScheduleItem[];
  tuesday: ScheduleItem[];
  wednesday: ScheduleItem[];
  thursday: ScheduleItem[];
  friday: ScheduleItem[];
  saturday: ScheduleItem[];
  sunday: ScheduleItem[];
};

export type PlayerCharacter = {
  name: string;
  gender: string;
  year: number;
  age: number;
  appearance: Appearance;
  stats: PlayerStats;
  relationships: Record<string, number>;
  inventory: string[];
  activities: PlayerActivities;
  achievements: string[];
  status: PlayerStatus;
  scheduleToday: ScheduleItem[];
};

export type MangaFrame = {
  id: number;
  gameId: number;
  userId: number;
  frameNumber: number;
  dialogueText: string;
  characterName?: string;
  playerChoice?: string;
  imagePrompt: string;
  imageUrl?: string;
  sceneContext: Record<string, any>;
  createdAt: Date;
};

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  pagesAvailable: true,
  isAdmin: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  imageUrl: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Types for insert operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Types for select operations
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Payment = typeof payments.$inferSelect;

// Extension schemas for validation
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6).optional(),
});

export const createPlayerSchema = z.object({
  name: z.string().min(2).max(30),
  gender: z.enum(["male", "female"]),
});

export const purchasePagesSchema = z.object({
  pageAmount: z.number().int().positive(),
  paymentAmount: z.number().positive(),
});

export const gameChoiceSchema = z.object({
  choiceIndex: z.number().int().min(0),
  gameId: z.number().int().positive(),
});
