import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string | null;
      googleId: string | null;
      pagesAvailable: number;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}