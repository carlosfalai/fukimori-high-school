import { DeepSeekService } from './DeepSeekService';
import { DefaultCharacters } from './DefaultCharacters';
import { DefaultLocations } from './DefaultLocations';

export class GameInitializer {
  private deepSeekService: DeepSeekService;

  constructor(deepSeekService: DeepSeekService) {
    this.deepSeekService = deepSeekService;
  }

  /**
   * Initialize the game world with default characters and locations
   * This ensures consistency across all game sessions
   */
  initializeGameWorld(): void {
    console.log('Initializing Fukimori High School game world...');
    
    try {
      // Initialize all default teachers and staff
      DefaultCharacters.initializeTeachersAndStaff(this.deepSeekService);
      console.log('✓ Default teachers and staff characters loaded');
      
      // Initialize all school locations
      DefaultLocations.initializeSchoolLocations(this.deepSeekService);
      console.log('✓ Default school locations loaded');
      
      // Create initial story memories for world building
      this.initializeWorldMemories();
      console.log('✓ Initial world memories created');
      
      console.log('Game world initialization complete!');
    } catch (error) {
      console.error('Error initializing game world:', error);
    }
  }

  /**
   * Create initial story memories that establish the world context
   */
  private initializeWorldMemories(): void {
    // School opening memory
    this.deepSeekService.addMemory({
      eventId: 'school_opening_2024',
      timestamp: '2024-04-01T08:00:00Z',
      participants: ['principal_yoshida', 'teacher_tanaka', 'teacher_anderson', 'nurse_kimura', 'coach_saito'],
      location: 'entrance',
      summary: 'Fukimori High School officially opened for the new academic year with a welcome ceremony',
      emotionalTone: 'ceremonial and hopeful',
      consequences: ['new academic year begins', 'teachers prepared for new students'],
      dialogueHighlights: [
        'Principal Yoshida: "Welcome to another year of learning and growth at Fukimori High"',
        'Ms. Anderson: "I\'m excited to meet our new students and help them discover their voices"'
      ]
    });

    // Teacher collaboration memory
    this.deepSeekService.addMemory({
      eventId: 'teacher_planning_meeting',
      timestamp: '2024-04-02T15:30:00Z',
      participants: ['teacher_tanaka', 'teacher_anderson', 'principal_yoshida'],
      location: 'faculty_room',
      summary: 'Teachers collaborated on interdisciplinary approaches to engage students',
      emotionalTone: 'collaborative and enthusiastic',
      consequences: ['improved teaching coordination', 'cross-subject projects planned'],
      dialogueHighlights: [
        'Mr. Tanaka: "We could incorporate mathematical concepts into creative writing"',
        'Ms. Anderson: "That\'s brilliant! Students love when subjects connect meaningfully"'
      ]
    });

    // Student health initiative memory
    this.deepSeekService.addMemory({
      eventId: 'health_wellness_program',
      timestamp: '2024-04-05T12:00:00Z',
      participants: ['nurse_kimura', 'coach_saito', 'principal_yoshida'],
      location: 'health_office',
      summary: 'School launched comprehensive student wellness program',
      emotionalTone: 'caring and proactive',
      consequences: ['improved student health awareness', 'preventive care programs established'],
      dialogueHighlights: [
        'Nurse Kimura: "Early intervention is key to student wellbeing"',
        'Coach Saito: "Physical and mental health go hand in hand"'
      ]
    });
  }

  /**
   * Get status of initialized characters and locations
   */
  getInitializationStatus(): {
    characters: number;
    locations: number;
    memories: number;
  } {
    return {
      characters: this.deepSeekService.getAllCharacters().length,
      locations: this.deepSeekService.getAllLocations().length,
      memories: this.deepSeekService.getStoryMemory().length
    };
  }

  /**
   * Reset and reinitialize the game world (useful for testing)
   */
  resetGameWorld(): void {
    console.log('Resetting game world...');
    
    // Clear existing data
    this.deepSeekService.clearAllData();
    
    // Reinitialize
    this.initializeGameWorld();
  }

  /**
   * Add a student character with random background
   */
  createRandomStudent(name: string, customOptions?: {
    personality?: string[];
    supernaturalPower?: string;
    academicFocus?: string;
  }): string {
    const genders = ['male', 'female'];
    const hairColors = ['black', 'brown', 'dark brown', 'blonde'];
    const personalities = [
      ['shy', 'studious', 'kind'],
      ['outgoing', 'athletic', 'loyal'],
      ['creative', 'dreamy', 'artistic'],
      ['confident', 'leader', 'ambitious'],
      ['quiet', 'observant', 'wise'],
      ['energetic', 'friendly', 'optimistic']
    ];
    
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    const randomHair = hairColors[Math.floor(Math.random() * hairColors.length)];
    const randomPersonality = customOptions?.personality || personalities[Math.floor(Math.random() * personalities.length)];
    
    const studentSeed = this.deepSeekService.createCharacterSeed({
      name,
      age: 16,
      gender: randomGender,
      appearance: {
        hairColor: randomHair,
        hairStyle: randomGender === 'female' ? 
          ['long', 'ponytail', 'twin tails', 'medium length'][Math.floor(Math.random() * 4)] :
          ['short', 'medium length'][Math.floor(Math.random() * 2)],
        eyeColor: ['brown', 'black', 'dark brown'][Math.floor(Math.random() * 3)],
        height: ['short', 'average', 'tall'][Math.floor(Math.random() * 3)],
        bodyType: ['slim', 'average'][Math.floor(Math.random() * 2)],
        distinctiveFeatures: [],
        outfits: {
          schoolUniform: 'Fukimori High School uniform',
          casualWear: ['casual student clothing'],
          specialOutfits: [],
          accessories: []
        },
        physicalMarks: []
      },
      personality: {
        traits: randomPersonality,
        likes: ['school', 'friends', 'learning'],
        dislikes: ['bullying', 'unfairness'],
        fears: ['failure', 'being alone'],
        goals: ['graduate successfully', 'make good friends'],
        speechPattern: 'typical teenage speech',
        coreValues: ['friendship', 'honesty'],
        behaviorPatterns: ['helpful to classmates'],
        socialStyle: randomPersonality.includes('shy') ? 'reserved' : 'friendly'
      },
      abilities: {
        supernatural: customOptions?.supernaturalPower ? {
          powers: [customOptions.supernaturalPower],
          powerLevel: 2,
          limitations: ['still discovering abilities'],
          awakening_story: 'recently awakened during a stressful moment',
          control_level: 'beginner'
        } : undefined
      },
      reputationTags: ['student', customOptions?.academicFocus || 'general studies']
    });

    // Set initial relationship with teachers
    this.deepSeekService.updateCharacterRelationship(
      studentSeed.id,
      'teacher_tanaka',
      { type: 'teacher-student', newMemory: `First day meeting ${name}` }
    );

    return studentSeed.id;
  }
}