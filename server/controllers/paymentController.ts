import { Request, Response } from "express";
import { IStorage } from "../storage";
import { StripeService } from "../services/StripeService";
import { z } from "zod";
import { purchasePagesSchema } from "@shared/schema";

export class PaymentController {
  private storage: IStorage;
  private stripeService: StripeService;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.stripeService = new StripeService(storage);
  }

  /**
   * Create a payment intent for purchasing pages
   */
  createPaymentIntent = async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate the input
      const validatedData = z.object({
        amount: z.number().positive(),
        pages: z.number().int().positive()
      }).parse(req.body);
      
      // Create a payment intent
      const result = await this.stripeService.createPaymentIntent(
        userId,
        validatedData.amount,
        validatedData.pages
      );
      
      res.json({ clientSecret: result.clientSecret, paymentId: result.paymentId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  };

  /**
   * Handle webhook events from Stripe
   */
  handleWebhook = async (req: Request, res: Response) => {
    try {
      const signature = req.headers["stripe-signature"] as string;
      
      if (!signature) {
        return res.status(400).json({ message: "Missing stripe-signature header" });
      }
      
      const payload = req.body;
      const result = await this.stripeService.handleWebhookEvent(signature, payload);
      
      res.json(result);
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ message: "Error handling webhook" });
    }
  };

  /**
   * Get the number of pages per dollar
   */
  getPagesPerDollar = async (req: Request, res: Response) => {
    try {
      const pagesPerDollar = this.stripeService.getPagesPerDollar();
      res.json({ pagesPerDollar });
    } catch (error) {
      console.error("Error getting pages per dollar:", error);
      res.status(500).json({ message: "Error getting pages per dollar" });
    }
  };
}
