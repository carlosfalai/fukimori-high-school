import { DeepSeekService } from './DeepSeekService';
import { RealTimeJapanService } from './RealTimeJapanService';

export interface PlayerCharacterCreation {
  name: string;
  backstory: {
    transferStudent: boolean;
    previousSchool?: string;
    reasonForTransfer?: string;
    personality: string[];
    hobbies: string[];
    academicStrength: string;
    familyBackground: string;
    secrets?: string[];
  };
  appearance: {
    photoDescription?: string; // AI-generated description from uploaded photo
    height: 'short' | 'average' | 'tall';
    build: 'slim' | 'average' | 'athletic';
    distinctiveFeatures: string[];
  };
  startingDate: 'current' | 'school_year_start' | 'transfer_mid_year';
}

export class CharacterCreatorService {
  private deepSeekService: DeepSeekService;
  private realTimeJapan: RealTimeJapanService;

  constructor(deepSeekService: DeepSeekService) {
    this.deepSeekService = deepSeekService;
    this.realTimeJapan = new RealTimeJapanService();
  }

  /**
   * Analyze uploaded photo to create character description
   */
  async analyzePlayerPhoto(imageBase64: string): Promise<{
    description: string;
    suggestedTraits: string[];
    estimatedAge: string;
    style: string;
  }> {
    try {
      // This would integrate with vision APIs like GPT-4 Vision, Google Vision, or Claude Vision
      // For now, return a template that can be enhanced with actual API
      
      // Example using OpenAI GPT-4 Vision (you'd need to implement this with your API key)
      const prompt = `Analyze this photo of a person who will become a Japanese high school student character. Describe their:
      1. Physical appearance (hair, eyes, facial features) 
      2. Suggested personality traits based on expression/pose
      3. Estimated age range
      4. Style/fashion sense
      5. What kind of student they might be
      
      Format as JSON with: description, suggestedTraits (array), estimatedAge, style`;

      // Placeholder implementation - replace with actual vision API call
      return {
        description: "A friendly-looking student with an approachable smile and bright eyes. Medium-length dark hair, average height, with a casual but neat appearance.",
        suggestedTraits: ["friendly", "curious", "optimistic", "social"],
        estimatedAge: "15-16 years old",
        style: "casual and approachable"
      };
    } catch (error) {
      console.error('Error analyzing photo:', error);
      return {
        description: "A typical Japanese high school student with a warm personality",
        suggestedTraits: ["friendly", "determined"],
        estimatedAge: "15-16 years old", 
        style: "school-appropriate"
      };
    }
  }

  /**
   * Create player character based on their input and photo analysis
   */
  async createPlayerCharacter(playerData: PlayerCharacterCreation, photoAnalysis?: any): Promise<string> {
    const japanData = await this.realTimeJapan.getCurrentJapanData();
    const schoolYear = this.realTimeJapan.getSchoolYearInfo();
    
    // Determine starting scenario based on real date and player choice
    let startingScenario = '';
    let startingLocation = 'entrance';
    
    if (playerData.startingDate === 'school_year_start') {
      startingScenario = 'First day of the new school year in April';
      startingLocation = 'entrance';
    } else if (playerData.startingDate === 'transfer_mid_year') {
      startingScenario = `Transfer student arriving mid-year on ${japanData.currentDateTime.date}`;
      startingLocation = 'principal_office';
    } else {
      // Current date start
      if (japanData.currentDateTime.schoolStatus === 'summer_break') {
        startingScenario = `Starting during summer break on ${japanData.currentDateTime.date} - maybe summer school or club activities`;
        startingLocation = 'courtyard';
      } else if (japanData.currentDateTime.schoolStatus === 'in_session') {
        startingScenario = `Joining mid-semester on ${japanData.currentDateTime.date}`;
        startingLocation = 'classroom_1a';
      } else {
        startingScenario = `Starting on ${japanData.currentDateTime.date} - ${japanData.currentDateTime.schoolStatus}`;
        startingLocation = 'entrance';
      }
    }

    // Create comprehensive character seed
    const characterSeed = this.deepSeekService.createCharacterSeed({
      id: 'player',
      name: playerData.name,
      age: 15, // First year high school
      gender: 'player', // Player-defined
      appearance: {
        hairColor: photoAnalysis?.description?.includes('blonde') ? 'blonde' : 
                   photoAnalysis?.description?.includes('brown') ? 'brown' : 'black',
        hairStyle: 'medium length', // Can be customized based on photo
        eyeColor: 'brown', // Default Japanese
        height: playerData.appearance.height,
        bodyType: playerData.appearance.build,
        distinctiveFeatures: playerData.appearance.distinctiveFeatures,
        outfits: {
          schoolUniform: 'Fukimori High School first-year uniform',
          casualWear: ['comfortable student clothing'],
          specialOutfits: [],
          accessories: []
        },
        physicalMarks: []
      },
      personality: {
        traits: playerData.backstory.personality,
        likes: playerData.backstory.hobbies,
        dislikes: ['unfairness', 'bullying'],
        fears: ['not fitting in', 'academic failure'],
        goals: ['make friends', 'succeed at Fukimori High', 'discover my path'],
        speechPattern: 'polite student speech',
        coreValues: ['friendship', 'growth', 'authenticity'],
        behaviorPatterns: ['eager to learn', 'wants to fit in'],
        socialStyle: playerData.backstory.personality.includes('shy') ? 'reserved' : 'friendly'
      },
      background: {
        family: {
          father: { name: `${playerData.name}'s Father`, occupation: 'office worker', personality: 'supportive' },
          mother: { name: `${playerData.name}'s Mother`, occupation: 'teacher', personality: 'caring' },
          siblings: [],
          familyWealth: 'middle class',
          familyReputation: 'respectable'
        },
        homeAddress: playerData.backstory.transferStudent && playerData.backstory.previousSchool ? 
          'Recently moved to Tokyo area' : 'Tokyo residential area',
        roomDescription: 'typical teenager room with personal interests and study area',
        economicStatus: 'middle class',
        backstory: this.generatePlayerBackstory(playerData, startingScenario),
        secrets: playerData.backstory.secrets || []
      },
      abilities: {
        academic: { 
          subjects: [playerData.backstory.academicStrength], 
          averageGrade: 'B', 
          studyHabits: 'trying to establish good habits' 
        },
        athletic: { sports: [], physicalStrength: 5, endurance: 5 },
        artistic: { 
          talents: playerData.backstory.hobbies.filter(h => 
            ['art', 'music', 'writing', 'photography'].some(art => h.includes(art))
          ), 
          skill_level: 'beginner' 
        },
        social: { reputation: 50, popularityLevel: 'new student', socialCircle: [] }
      },
      dailyRoutine: {
        morning: 'arrives at school with mix of nervousness and excitement',
        lunch: 'looking for place to sit and people to talk to',
        afterSchool: 'exploring clubs and activities',
        weekend: 'getting used to new life in Tokyo'
      },
      reputationTags: ['first-year', 'new student', playerData.backstory.transferStudent ? 'transfer student' : 'local student']
    });

    // Create initial memory of starting at Fukimori High
    this.deepSeekService.addMemory({
      eventId: 'player_start_fukimori',
      timestamp: new Date().toISOString(),
      participants: ['player'],
      location: startingLocation,
      summary: `${playerData.name} begins their journey at Fukimori High School - ${startingScenario}`,
      emotionalTone: 'nervous but excited',
      consequences: ['new chapter begins', 'opportunities await'],
      dialogueHighlights: [`${playerData.name} thinks: "This is it... my new life at Fukimori High begins!"`]
    });

    return characterSeed.id;
  }

  /**
   * Generate rich backstory based on player choices
   */
  private generatePlayerBackstory(playerData: PlayerCharacterCreation, startingScenario: string): string {
    let backstory = `${playerData.name} is a 15-year-old student beginning their journey at Fukimori High School. `;
    
    if (playerData.backstory.transferStudent) {
      backstory += `As a transfer student from ${playerData.backstory.previousSchool || 'another school'}, `;
      backstory += `they moved to Tokyo ${playerData.backstory.reasonForTransfer || 'for family reasons'}. `;
      backstory += `This fresh start represents both an opportunity and a challenge. `;
    } else {
      backstory += `Having grown up in the Tokyo area, they chose Fukimori High for its reputation and opportunities. `;
    }

    backstory += `Their personality is characterized by being ${playerData.backstory.personality.join(', ')}, `;
    backstory += `and they have a passion for ${playerData.backstory.hobbies.join(' and ')}. `;
    
    if (playerData.backstory.academicStrength) {
      backstory += `Academically, they show particular strength in ${playerData.backstory.academicStrength}. `;
    }

    backstory += `Coming from a ${playerData.backstory.familyBackground} family background, `;
    backstory += `they approach this new chapter with determination to make meaningful connections and succeed. `;
    
    backstory += `${startingScenario} marks the beginning of what they hope will be an unforgettable high school experience.`;

    return backstory;
  }

  /**
   * Get starting game state based on player character
   */
  async getStartingGameState(playerId: string): Promise<{
    location: string;
    timeOfDay: string;
    characters: string[];
    introductionScenario: string;
    suggestedActions: string[];
  }> {
    const japanData = await this.realTimeJapan.getCurrentJapanData();
    const timeContext = this.realTimeJapan.getTimeOfDayContext();
    
    // Based on current real-time situation in Japan
    if (japanData.currentDateTime.schoolStatus === 'summer_break') {
      return {
        location: 'courtyard',
        timeOfDay: timeContext.period,
        characters: ['teacher_tanaka'], // Summer school teacher
        introductionScenario: `It's summer break, but you've come to school for summer activities. The campus feels different - quieter, more relaxed. ${japanData.weather.description}`,
        suggestedActions: [
          'Explore the quiet school campus',
          'Talk to the summer school teacher',
          'Find other students doing summer activities',
          'Enjoy the peaceful atmosphere'
        ]
      };
    } else if (japanData.currentDateTime.schoolStatus === 'in_session') {
      return {
        location: 'classroom_1a',
        timeOfDay: timeContext.period,
        characters: ['teacher_tanaka', 'student_random_1', 'student_random_2'],
        introductionScenario: `You enter your new classroom at Fukimori High. It's ${timeContext.atmosphere}. The other students look up curiously as you walk in. ${japanData.weather.description} through the windows.`,
        suggestedActions: [
          'Introduce yourself to the class',
          'Find an empty seat',
          'Talk to nearby students',
          'Listen to the teacher\'s instructions'
        ]
      };
    } else {
      return {
        location: 'entrance',
        timeOfDay: timeContext.period,
        characters: [],
        introductionScenario: `You stand at the entrance of Fukimori High School. Even though it's ${japanData.currentDateTime.schoolStatus}, you wanted to see your new school. ${japanData.weather.description}`,
        suggestedActions: [
          'Explore the school grounds',
          'Look around the entrance area',
          'Plan for when school resumes',
          'Take in the atmosphere of your new school'
        ]
      };
    }
  }
}