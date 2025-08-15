import axios from 'axios';

export interface MangaPanelOptions {
  description: string;
  panelType: 'action' | 'dialogue' | 'closeup' | 'establishing' | 'reaction';
  characters?: string[];
  emotion?: string;
  setting?: string;
}

export interface GammaImageResponse {
  images: Array<{
    url: string;
    id: string;
  }>;
  status: string;
}

export class GammaAIService {
  private apiKey: string;
  private apiUrl: string = 'https://api.gamma.app/v1/images/generate';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gamma AI API key is required');
    }
    this.apiKey = apiKey;
  }

  async generateMangaPanel(options: MangaPanelOptions): Promise<string> {
    try {
      const prompt = this.buildMangaPanelPrompt(options);
      
      const response = await this.generateImage({
        prompt,
        model: 'imagen-4-ultra',
        aspectRatio: this.getAspectRatioForPanel(options.panelType),
        stylePreset: 'manga'
      });

      if (response.images && response.images.length > 0) {
        return response.images[0].url;
      }

      throw new Error('No manga panel generated');
    } catch (error) {
      console.error('Error generating manga panel:', error);
      throw error;
    }
  }

  private async generateImage(options: {
    prompt: string;
    model: string;
    aspectRatio: string;
    stylePreset: string;
  }): Promise<GammaImageResponse> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          prompt: options.prompt,
          model: options.model,
          aspect_ratio: options.aspectRatio,
          num_images: 1,
          style_preset: options.stylePreset,
          negative_prompt: 'text, watermark, low quality, blurry, distorted'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Gamma AI API Error:', error.response?.data || error.message);
        throw new Error(`Gamma AI API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  private buildMangaPanelPrompt(options: MangaPanelOptions): string {
    const { description, panelType, characters, emotion, setting } = options;
    
    let basePrompt = `manga style illustration, ${description}`;
    
    if (panelType === 'action') {
      basePrompt += ', dynamic action scene, motion lines, impact effects';
    } else if (panelType === 'closeup') {
      basePrompt += ', detailed face closeup, emotional expression';
    } else if (panelType === 'establishing') {
      basePrompt += ', wide shot, detailed background, atmospheric';
    } else if (panelType === 'reaction') {
      basePrompt += ', reaction shot, expressive, manga effects';
    }
    
    if (characters && characters.length > 0) {
      basePrompt += `, featuring ${characters.join(' and ')}`;
    }
    
    if (emotion) {
      basePrompt += `, ${emotion} emotion`;
    }
    
    if (setting) {
      basePrompt += `, ${setting} setting`;
    }
    
    basePrompt += ', black and white manga art, professional manga style, detailed linework, screen tones';
    
    return basePrompt;
  }

  private getAspectRatioForPanel(panelType: string): string {
    switch (panelType) {
      case 'action':
        return '16:9';
      case 'closeup':
        return '1:1';
      case 'establishing':
        return '21:9';
      case 'dialogue':
        return '4:3';
      case 'reaction':
        return '3:4';
      default:
        return '4:3';
    }
  }
}