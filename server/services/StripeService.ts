import Stripe from "stripe";
import { IStorage } from "../storage";
import { Payment, InsertPayment } from "@shared/schema";

export class StripeService {
  private stripe: Stripe;
  private storage: IStorage;
  private pagesPerDollar: number;

  constructor(storage: IStorage) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("STRIPE_SECRET_KEY not provided - payment processing disabled");
      this.stripe = null as any; // Will use fallback responses
    } else {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16"
      });
    }
    this.storage = storage;
    this.pagesPerDollar = parseInt(process.env.PAGES_PER_DOLLAR || "10");
  }

  /**
   * Create a payment intent for purchasing pages
   */
  async createPaymentIntent(userId: number, amount: number, pages: number): Promise<{ clientSecret: string; paymentId: number }> {
    try {
      // Create a payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount, // amount is already in cents
        currency: "usd",
        metadata: {
          userId: userId.toString(),
          pages: pages.toString(),
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error("Failed to create payment intent");
      }

      // Create a payment record in the database
      const paymentData: InsertPayment = {
        userId,
        amount,
        pagesAdded: pages,
        stripePaymentId: paymentIntent.id,
        status: "pending",
      };

      const payment = await this.storage.createPayment(paymentData);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to create payment intent. Please try again.");
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhookEvent(signature: string, payload: Buffer): Promise<{ received: boolean }> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
      }

      // Verify the webhook signature
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      // Handle the event based on its type
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error("Error handling webhook event:", error);
      throw new Error("Failed to handle webhook event");
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Get the payment from our database using the payment intent ID
      const payments = Array.from((await this.storage as any).payments.values()).filter(
        (p: Payment) => p.stripePaymentId === paymentIntent.id
      );

      if (payments.length === 0) {
        throw new Error(`Payment not found for payment intent: ${paymentIntent.id}`);
      }

      const payment = payments[0];

      // Update payment status
      await this.storage.updatePaymentStatus(
        payment.id,
        "completed",
        new Date()
      );

      // Add pages to user's account
      await this.storage.updateUserPages(payment.userId, payment.pagesAdded);

      // Update the game's total pages
      const game = await this.storage.getCurrentGame(payment.userId);
      if (game) {
        await this.storage.updateGame(game.id, {
          totalPages: game.totalPages + payment.pagesAdded,
        });
      }
    } catch (error) {
      console.error("Error handling payment succeeded:", error);
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Get the payment from our database using the payment intent ID
      const payments = Array.from((await this.storage as any).payments.values()).filter(
        (p: Payment) => p.stripePaymentId === paymentIntent.id
      );

      if (payments.length === 0) {
        throw new Error(`Payment not found for payment intent: ${paymentIntent.id}`);
      }

      const payment = payments[0];

      // Update payment status
      await this.storage.updatePaymentStatus(
        payment.id,
        "failed",
        new Date()
      );
    } catch (error) {
      console.error("Error handling payment failed:", error);
    }
  }

  /**
   * Calculate the number of pages per dollar
   */
  getPagesPerDollar(): number {
    return this.pagesPerDollar;
  }
}
