export const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  ai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  google: {
    projectId: process.env.GOOGLE_PROJECT_ID,
    vertexApiKey: process.env.GOOGLE_VERTEX_API_KEY,
    oauth: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
    }
  },
  game: {
    pagesPerDollar: parseInt(process.env.PAGES_PER_DOLLAR || '10')
  },
  session: {
    secret: process.env.SESSION_SECRET || 'fukimori-high-secret'
  }
};