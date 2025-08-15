import { GoogleAuth } from "google-auth-library";
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { Character } from "@shared/schema";

export class VertexAIService {
  private projectId: string;
  private location: string = "us-central1";
  private auth: GoogleAuth;
  private apiEndpoint: string;

  constructor() {
    this.projectId = process.env.GOOGLE_PROJECT_ID || "";
    this.auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    this.apiEndpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}`;
  }

  /**
   * Generate an image for a character based on their image prompt
   */
  async generateCharacterImage(character: Character): Promise<{ imageUrl: string }> {
    try {
      // Check if required environment variables are set
      if (!process.env.GOOGLE_PROJECT_ID) {
        throw new Error("GOOGLE_PROJECT_ID environment variable is required");
      }

      // Ensure the public/images directory exists
      const imageDir = path.join(process.cwd(), "public", "images");
      await fs.ensureDir(imageDir);

      // Create a unique filename for this character's image
      const timestamp = Date.now();
      const filename = `character_${character.id}_${timestamp}.png`;
      const imagePath = path.join(imageDir, filename);
      const imageUrl = `/images/${filename}`;

      const client = await this.auth.getClient();
      const authToken = await client.getAccessToken();

      // Ensuring a proper image generation prompt
      const prompt = character.imagePrompt || this.generateDefaultImagePrompt(character);

      const data = {
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "3:4", // Portrait aspect ratio
          negativePrompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation"
        },
      };

      // Use Vertex AI's Imagen model or another appropriate model
      const endpoint = `${this.apiEndpoint}/publishers/google/models/imagegeneration:predict`;

      // Make the API request to Vertex AI
      const response = await axios.post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${authToken.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data || !response.data.predictions || response.data.predictions.length === 0) {
        throw new Error("No image data received from Vertex AI");
      }

      // Save the image to a file - note that the exact response format will depend on the model
      // This assumes the response contains a base64 encoded image
      const imageData = response.data.predictions[0].image;
      if (imageData) {
        await fs.writeFile(imagePath, Buffer.from(imageData, "base64"));
        return { imageUrl };
      } else {
        throw new Error("Image data format is not as expected");
      }
    } catch (error) {
      console.error("Error generating character image:", error);
      
      // Return a fallback image URL if image generation fails
      return { 
        imageUrl: this.getFallbackImageUrl(character) 
      };
    }
  }

  /**
   * Generate a default image prompt if none is provided
   */
  private generateDefaultImagePrompt(character: Character): string {
    return `Create a full-body anime-style portrait of ${character.name}, a ${character.age}-year-old ${character.gender} ${character.role} from Fukimori High School. The artwork should reflect the mature, cinematic style of Tite Kubo's Bleach — featuring sharp linework, expressive facial detail, dramatic lighting, and a composed posture.`;
  }

  /**
   * Get a fallback image URL based on character gender
   */
  private getFallbackImageUrl(character: Character): string {
    if (character.gender.toLowerCase() === "female") {
      return "/images/default_female_character.png";
    } else {
      return "/images/default_male_character.png";
    }
  }
}
