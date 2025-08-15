import axios from 'axios';

export interface CharacterSeed {
  id: string;
  name: string;
  age: number;
  gender: string;
  appearance: {
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    height: string;
    bodyType: string;
    distinctiveFeatures: string[];
    outfits: {
      schoolUniform: string;
      casualWear: string[];
      specialOutfits: string[];
      accessories: string[];
    };
    physicalMarks: string[];
  };
  personality: {
    traits: string[];
    likes: string[];
    dislikes: string[];
    fears: string[];
    goals: string[];
    speechPattern: string;
    coreValues: string[];
    behaviorPatterns: string[];
    socialStyle: string;
  };
  background: {
    family: {
      father: { name: string; occupation: string; personality: string };
      mother: { name: string; occupation: string; personality: string };
      siblings: Array<{ name: string; age: number; relationship: string }>;
      familyWealth: string;
      familyReputation: string;
    };
    homeAddress: string;
    roomDescription: string;
    economicStatus: string;
    backstory: string;
    secrets: string[];
    pastTrauma?: string;
  };
  abilities: {
    academic: { subjects: string[]; averageGrade: string; studyHabits: string };
    athletic: { sports: string[]; physicalStrength: number; endurance: number };
    artistic: { talents: string[]; skill_level: string };
    social: { reputation: number; popularityLevel: string; socialCircle: string[] };
    supernatural?: {
      powers: string[];
      powerLevel: number;
      limitations: string[];
      awakening_story: string;
      control_level: string;
    };
  };
  relationships: Map<string, {
    type: string;
    history: string[];
    currentStatus: string;
    affectionLevel: number;
    trustLevel: number;
    sharedMemories: string[];
    conflictHistory: string[];
    relationshipGoals: string[];
  }>;
  dailyRoutine: {
    morning: string;
    lunch: string;
    afterSchool: string;
    weekend: string;
  };
  reputationTags: string[];
}

export interface LocationSeed {
  id: string;
  name: string;
  type: string;
  description: string;
  atmosphere: string;
  keyFeatures: string[];
  connectedLocations: string[];
  typicalActivities: string[];
}

export interface StoryMemory {
  eventId: string;
  timestamp: string;
  participants: string[];
  location: string;
  summary: string;
  emotionalTone: string;
  consequences: string[];
  dialogueHighlights: string[];
}

export interface DialogueContext {
  characterId: string;
  currentMood: string;
  recentMemories: StoryMemory[];
  relationshipStatus: Map<string, number>;
  currentLocation: string;
  timeOfDay: string;
  ongoingPlots: string[];
}

export class DeepSeekService {
  private apiKey: string;
  private apiUrl: string = 'https://api.deepseek.com/v1/chat/completions';
  private characterSeeds: Map<string, CharacterSeed> = new Map();
  private locationSeeds: Map<string, LocationSeed> = new Map();
  private storyMemory: StoryMemory[] = [];
  private maxMemorySize: number = 1000;

  constructor(apiKey: string) {
    if (!apiKey) {
      console.warn('DeepSeek API key not provided - using mock character responses');
      this.apiKey = 'demo-key';
    } else {
      this.apiKey = apiKey;
    }
    this.loadPersistedData();
  }

  async generateCharacterResponse(
    context: DialogueContext,
    userInput: string,
    otherCharactersPresent: string[]
  ): Promise<{
    dialogue: string;
    emotion: string;
    action: string;
    thoughtBubble?: string;
    panelDescription: string;
  }> {
    const character = this.characterSeeds.get(context.characterId);
    if (!character) {
      throw new Error(`Character ${context.characterId} not found`);
    }

    const relevantMemories = this.getRelevantMemories(character, userInput);
    const prompt = this.buildCharacterPrompt(character, context, userInput, relevantMemories, otherCharactersPresent);

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(character)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      
      this.updateMemory({
        eventId: this.generateEventId(),
        timestamp: new Date().toISOString(),
        participants: [context.characterId, ...otherCharactersPresent],
        location: context.currentLocation,
        summary: `${character.name} responded to: "${userInput}"`,
        emotionalTone: result.emotion,
        consequences: [],
        dialogueHighlights: [result.dialogue]
      });

      return result;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  async generateStoryProgression(
    currentScene: string,
    userAction: string,
    involvedCharacters: string[],
    location: string
  ): Promise<{
    narration: string;
    panels: Array<{
      type: string;
      description: string;
      dialogue?: string;
      character?: string;
      emotion?: string;
    }>;
    choices: string[];
    stateChanges: {
      relationships?: Record<string, number>;
      plotProgression?: string[];
      unlockedLocations?: string[];
    };
  }> {
    const characters = involvedCharacters.map(id => this.characterSeeds.get(id)).filter(Boolean);
    const locationData = this.locationSeeds.get(location);
    const recentEvents = this.storyMemory.slice(-10);

    const prompt = `
Current Scene: ${currentScene}
User Action: ${userAction}
Location: ${locationData?.name} - ${locationData?.description}
Characters Present: ${characters.map(c => c?.name).join(', ')}

Recent Story Events:
${recentEvents.map(e => `- ${e.summary}`).join('\n')}

Based on the user's action and the characters' personalities, generate the next story progression.
Consider character relationships, ongoing plots, and realistic high school dynamics.

Respond in JSON format:
{
  "narration": "Story narration text",
  "panels": [
    {
      "type": "establishing|action|dialogue|closeup|reaction",
      "description": "Visual description for manga panel",
      "dialogue": "Character dialogue if any",
      "character": "Character name if dialogue",
      "emotion": "Character emotion"
    }
  ],
  "choices": ["Choice 1", "Choice 2", "Choice 3"],
  "stateChanges": {
    "relationships": {"character1": 5, "character2": -2},
    "plotProgression": ["New plot point"],
    "unlockedLocations": ["New location"]
  }
}`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a manga story writer creating engaging, character-driven narratives for a high school setting. Maintain consistency with established character traits and relationships.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Story progression error:', error);
      throw error;
    }
  }

  createCharacterSeed(characterData: Partial<CharacterSeed>): CharacterSeed {
    const seed: CharacterSeed = {
      id: characterData.id || this.generateId(),
      name: characterData.name || 'Unknown',
      age: characterData.age || 16,
      gender: characterData.gender || 'Unknown',
      appearance: {
        hairColor: characterData.appearance?.hairColor || 'black',
        hairStyle: characterData.appearance?.hairStyle || 'medium length',
        eyeColor: characterData.appearance?.eyeColor || 'brown',
        height: characterData.appearance?.height || 'average',
        bodyType: characterData.appearance?.bodyType || 'average',
        distinctiveFeatures: characterData.appearance?.distinctiveFeatures || [],
        outfits: {
          schoolUniform: characterData.appearance?.outfits?.schoolUniform || 'standard school uniform',
          casualWear: characterData.appearance?.outfits?.casualWear || ['jeans and t-shirt'],
          specialOutfits: characterData.appearance?.outfits?.specialOutfits || [],
          accessories: characterData.appearance?.outfits?.accessories || []
        },
        physicalMarks: characterData.appearance?.physicalMarks || []
      },
      personality: {
        traits: characterData.personality?.traits || ['friendly'],
        likes: characterData.personality?.likes || [],
        dislikes: characterData.personality?.dislikes || [],
        fears: characterData.personality?.fears || [],
        goals: characterData.personality?.goals || [],
        speechPattern: characterData.personality?.speechPattern || 'normal',
        coreValues: characterData.personality?.coreValues || ['honesty', 'friendship'],
        behaviorPatterns: characterData.personality?.behaviorPatterns || ['helpful to friends'],
        socialStyle: characterData.personality?.socialStyle || 'friendly'
      },
      background: {
        family: {
          father: characterData.background?.family?.father || { name: 'Unknown Father', occupation: 'unknown', personality: 'unknown' },
          mother: characterData.background?.family?.mother || { name: 'Unknown Mother', occupation: 'unknown', personality: 'unknown' },
          siblings: characterData.background?.family?.siblings || [],
          familyWealth: characterData.background?.family?.familyWealth || 'middle class',
          familyReputation: characterData.background?.family?.familyReputation || 'respectable'
        },
        homeAddress: characterData.background?.homeAddress || 'Unknown',
        roomDescription: characterData.background?.roomDescription || 'typical teenager room',
        economicStatus: characterData.background?.economicStatus || 'middle class',
        backstory: characterData.background?.backstory || '',
        secrets: characterData.background?.secrets || [],
        pastTrauma: characterData.background?.pastTrauma
      },
      abilities: {
        academic: characterData.abilities?.academic || { subjects: [], averageGrade: 'B', studyHabits: 'regular' },
        athletic: characterData.abilities?.athletic || { sports: [], physicalStrength: 5, endurance: 5 },
        artistic: characterData.abilities?.artistic || { talents: [], skill_level: 'beginner' },
        social: characterData.abilities?.social || { reputation: 50, popularityLevel: 'average', socialCircle: [] },
        supernatural: characterData.abilities?.supernatural
      },
      relationships: characterData.relationships || new Map(),
      dailyRoutine: characterData.dailyRoutine || {
        morning: 'arrives at school early',
        lunch: 'eats with friends',
        afterSchool: 'participates in club activities',
        weekend: 'relaxes at home'
      },
      reputationTags: characterData.reputationTags || []
    };

    this.characterSeeds.set(seed.id, seed);
    this.persistData();
    return seed;
  }

  createLocationSeed(locationData: Partial<LocationSeed>): LocationSeed {
    const seed: LocationSeed = {
      id: locationData.id || this.generateId(),
      name: locationData.name || 'Unknown Location',
      type: locationData.type || 'general',
      description: locationData.description || '',
      atmosphere: locationData.atmosphere || 'neutral',
      keyFeatures: locationData.keyFeatures || [],
      connectedLocations: locationData.connectedLocations || [],
      typicalActivities: locationData.typicalActivities || []
    };

    this.locationSeeds.set(seed.id, seed);
    this.persistData();
    return seed;
  }

  private getSystemPrompt(character: CharacterSeed): string {
    const supernatural = character.abilities.supernatural ? 
      `\nSupernatural Abilities: ${character.abilities.supernatural.powers.join(', ')} (${character.abilities.supernatural.control_level} control level)
Limitations: ${character.abilities.supernatural.limitations.join(', ')}` : '';

    return `You are ${character.name}, a ${character.age}-year-old ${character.gender} high school student at Fukimori High.

PHYSICAL APPEARANCE (NEVER CHANGES):
- Hair: ${character.appearance.hairColor} ${character.appearance.hairStyle}
- Eyes: ${character.appearance.eyeColor}
- Height: ${character.appearance.height}
- Build: ${character.appearance.bodyType}
- Distinctive features: ${character.appearance.distinctiveFeatures.join(', ')}
- Current outfit: ${character.appearance.outfits.schoolUniform}

PERSONALITY (CORE TRAITS):
- Traits: ${character.personality.traits.join(', ')}
- Speech Pattern: ${character.personality.speechPattern}
- Social Style: ${character.personality.socialStyle}
- Core Values: ${character.personality.coreValues.join(', ')}
- Behavior Patterns: ${character.personality.behaviorPatterns.join(', ')}

BACKGROUND:
- Family: Father (${character.background.family.father.name} - ${character.background.family.father.occupation}), Mother (${character.background.family.mother.name} - ${character.background.family.mother.occupation})
- Economic Status: ${character.background.economicStatus}
- Lives at: ${character.background.homeAddress}
- Backstory: ${character.background.backstory}${supernatural}

ACADEMIC & SOCIAL:
- Academic Performance: ${character.abilities.academic.averageGrade} student
- Social Reputation: ${character.abilities.social.popularityLevel} (${character.abilities.social.reputation}/100)
- Daily Routine: ${character.dailyRoutine.morning}, ${character.dailyRoutine.lunch}, ${character.dailyRoutine.afterSchool}

IMPORTANT RULES:
1. NEVER change your physical appearance, family background, or core personality
2. Remember your supernatural abilities and limitations (if any)
3. React authentically based on your established personality and relationships
4. Stay consistent with your speech pattern and social style
5. Reference your background, family, and past experiences when relevant
6. Maintain your reputation level and social circle preferences
7. Act like a real high school student with believable motivations and reactions`;
  }

  private buildCharacterPrompt(
    character: CharacterSeed,
    context: DialogueContext,
    userInput: string,
    memories: StoryMemory[],
    otherCharacters: string[]
  ): string {
    const relevantMemoriesText = memories.map(m => 
      `- ${m.summary} (${m.emotionalTone})`
    ).join('\n');

    return `Current situation:
Location: ${context.currentLocation}
Time: ${context.timeOfDay}
Your current mood: ${context.currentMood}
Others present: ${otherCharacters.join(', ')}

Recent relevant memories:
${relevantMemoriesText || 'None'}

The player/another character says/does: "${userInput}"

How do you respond? Consider your personality, current mood, and relationships.
Respond in JSON format:
{
  "dialogue": "Your spoken response",
  "emotion": "Your emotional state (happy, sad, angry, surprised, etc.)",
  "action": "Physical action or gesture",
  "thoughtBubble": "Internal thought (optional)",
  "panelDescription": "Description of the manga panel showing your response"
}`;
  }

  private getRelevantMemories(character: CharacterSeed, context: string): StoryMemory[] {
    const keywords = context.toLowerCase().split(' ');
    
    return this.storyMemory
      .filter(memory => 
        memory.participants.includes(character.id) ||
        keywords.some(keyword => 
          memory.summary.toLowerCase().includes(keyword) ||
          memory.dialogueHighlights.some(d => d.toLowerCase().includes(keyword))
        )
      )
      .slice(-5);
  }

  private updateMemory(memory: StoryMemory): void {
    this.storyMemory.push(memory);
    
    if (this.storyMemory.length > this.maxMemorySize) {
      this.storyMemory = this.storyMemory.slice(-this.maxMemorySize);
    }
    
    this.persistData();
  }

  private persistData(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mangaCharacterSeeds', JSON.stringify(Array.from(this.characterSeeds.entries())));
      localStorage.setItem('mangaLocationSeeds', JSON.stringify(Array.from(this.locationSeeds.entries())));
      localStorage.setItem('mangaStoryMemory', JSON.stringify(this.storyMemory));
    }
  }

  private loadPersistedData(): void {
    if (typeof window !== 'undefined') {
      try {
        const characters = localStorage.getItem('mangaCharacterSeeds');
        if (characters) {
          this.characterSeeds = new Map(JSON.parse(characters));
        }

        const locations = localStorage.getItem('mangaLocationSeeds');
        if (locations) {
          this.locationSeeds = new Map(JSON.parse(locations));
        }

        const memory = localStorage.getItem('mangaStoryMemory');
        if (memory) {
          this.storyMemory = JSON.parse(memory);
        }
      } catch (error) {
        console.error('Error loading persisted data:', error);
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId(): string {
    return `event_${this.generateId()}`;
  }

  getCharacterAppearancePrompt(characterId: string, situation: string = 'school'): string {
    const character = this.characterSeeds.get(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    let outfit = character.appearance.outfits.schoolUniform;
    if (situation === 'casual') {
      outfit = character.appearance.outfits.casualWear[0] || outfit;
    } else if (situation === 'special' && character.appearance.outfits.specialOutfits.length > 0) {
      outfit = character.appearance.outfits.specialOutfits[0];
    }

    const accessories = character.appearance.outfits.accessories.length > 0 ? 
      `, wearing ${character.appearance.outfits.accessories.join(' and ')}` : '';

    return `${character.name}: ${character.age}-year-old ${character.gender}, ${character.appearance.hairColor} ${character.appearance.hairStyle} hair, ${character.appearance.eyeColor} eyes, ${character.appearance.height} height, ${character.appearance.bodyType} build, wearing ${outfit}${accessories}. Distinctive features: ${character.appearance.distinctiveFeatures.join(', ')}. Physical marks: ${character.appearance.physicalMarks.join(', ')}`;
  }

  getCharacterPersonalityPrompt(characterId: string): string {
    const character = this.characterSeeds.get(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    return `Personality: ${character.personality.traits.join(', ')}, ${character.personality.socialStyle} social style, ${character.personality.speechPattern} speech pattern. Emotional state should reflect their core values: ${character.personality.coreValues.join(', ')}`;
  }

  updateCharacterRelationship(characterId: string, otherCharacterId: string, relationshipData: {
    type?: string;
    affectionChange?: number;
    trustChange?: number;
    newMemory?: string;
    conflictEvent?: string;
  }): void {
    const character = this.characterSeeds.get(characterId);
    if (!character) return;

    let relationship = character.relationships.get(otherCharacterId);
    if (!relationship) {
      relationship = {
        type: relationshipData.type || 'acquaintance',
        history: [],
        currentStatus: 'neutral',
        affectionLevel: 50,
        trustLevel: 50,
        sharedMemories: [],
        conflictHistory: [],
        relationshipGoals: []
      };
    }

    if (relationshipData.affectionChange) {
      relationship.affectionLevel = Math.max(0, Math.min(100, relationship.affectionLevel + relationshipData.affectionChange));
    }
    if (relationshipData.trustChange) {
      relationship.trustLevel = Math.max(0, Math.min(100, relationship.trustLevel + relationshipData.trustChange));
    }
    if (relationshipData.newMemory) {
      relationship.sharedMemories.push(relationshipData.newMemory);
    }
    if (relationshipData.conflictEvent) {
      relationship.conflictHistory.push(relationshipData.conflictEvent);
    }

    if (relationship.affectionLevel > 80) {
      relationship.currentStatus = 'close friend';
    } else if (relationship.affectionLevel > 60) {
      relationship.currentStatus = 'friend';
    } else if (relationship.affectionLevel > 40) {
      relationship.currentStatus = 'acquaintance';
    } else if (relationship.affectionLevel > 20) {
      relationship.currentStatus = 'distant';
    } else {
      relationship.currentStatus = 'dislike';
    }

    character.relationships.set(otherCharacterId, relationship);
    this.persistData();
  }

  getAllCharacters(): CharacterSeed[] {
    return Array.from(this.characterSeeds.values());
  }

  getAllLocations(): LocationSeed[] {
    return Array.from(this.locationSeeds.values());
  }

  getStoryMemory(): StoryMemory[] {
    return this.storyMemory;
  }

  addMemory(memory: StoryMemory): void {
    this.storyMemory.push(memory);
    
    if (this.storyMemory.length > this.maxMemorySize) {
      this.storyMemory = this.storyMemory.slice(-this.maxMemorySize);
    }
    
    this.persistData();
  }

  clearAllData(): void {
    this.characterSeeds.clear();
    this.locationSeeds.clear();
    this.storyMemory = [];
    this.persistData();
  }

  /**
   * Handle reputation changes that affect multiple characters
   */
  updatePlayerReputation(action: string, witnesses: string[], reputationChange: number): void {
    // Update reputation with witnesses and their social circles
    witnesses.forEach(witnessId => {
      const witness = this.characterSeeds.get(witnessId);
      if (!witness) return;

      // Direct witness relationship update
      this.updateCharacterRelationship(witnessId, 'player', {
        affectionChange: reputationChange,
        newMemory: `Witnessed player ${action}`
      });

      // Spread reputation through social circles
      witness.abilities.social.socialCircle.forEach(friendId => {
        const friend = this.characterSeeds.get(friendId);
        if (friend && friendId !== 'player') {
          // Friends hear about it with reduced impact
          const hearsayImpact = Math.floor(reputationChange * 0.5);
          this.updateCharacterRelationship(friendId, 'player', {
            affectionChange: hearsayImpact,
            newMemory: `Heard from ${witness.name} that player ${action}`
          });
        }
      });
    });
  }

  /**
   * Get social dynamics context for a character interaction
   */
  getSocialContext(characterId: string, location: string): {
    charactersPresent: string[];
    socialPressure: number;
    reputationModifier: number;
    groupDynamics: string;
  } {
    const character = this.characterSeeds.get(characterId);
    if (!character) {
      return { charactersPresent: [], socialPressure: 0, reputationModifier: 0, groupDynamics: 'neutral' };
    }

    // Find other characters likely to be in this location
    const locationSeed = this.locationSeeds.get(location);
    const charactersPresent: string[] = [];
    let socialPressure = 0;
    let friendsPresent = 0;
    let enemiesPresent = 0;

    // Check who might be present based on typical activities and social circles
    this.characterSeeds.forEach((otherCharacter, otherId) => {
      if (otherId === characterId) return;

      // Check if they'd be in this location (simplified logic)
      const wouldBePresent = this.wouldCharacterBeInLocation(otherCharacter, location);
      if (wouldBePresent) {
        charactersPresent.push(otherId);

        // Calculate social pressure based on relationships
        const relationship = character.relationships.get(otherId);
        if (relationship) {
          if (relationship.affectionLevel > 60) {
            friendsPresent++;
          } else if (relationship.affectionLevel < 40) {
            enemiesPresent++;
          }
        }

        // Social pressure from popular characters
        if (otherCharacter.abilities.social.reputation > 70) {
          socialPressure += 2;
        }
      }
    });

    // Calculate reputation modifier
    let reputationModifier = 0;
    if (character.abilities.social.reputation > 70) {
      reputationModifier = 2; // Popular characters have more impact
    } else if (character.abilities.social.reputation < 30) {
      reputationModifier = -1; // Unpopular characters have less impact
    }

    // Determine group dynamics
    let groupDynamics = 'neutral';
    if (friendsPresent > enemiesPresent + 1) {
      groupDynamics = 'supportive';
    } else if (enemiesPresent > friendsPresent + 1) {
      groupDynamics = 'hostile';
    } else if (socialPressure > 5) {
      groupDynamics = 'tense';
    }

    return {
      charactersPresent,
      socialPressure,
      reputationModifier,
      groupDynamics
    };
  }

  /**
   * Handle group interactions and their effects on relationships
   */
  processGroupInteraction(
    primaryCharacter: string,
    action: string,
    emotion: string,
    charactersPresent: string[],
    location: string
  ): void {
    const mainCharacter = this.characterSeeds.get(primaryCharacter);
    if (!mainCharacter) return;

    const socialContext = this.getSocialContext(primaryCharacter, location);
    
    // Create memory of the group interaction
    this.addMemory({
      eventId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      participants: [primaryCharacter, ...charactersPresent],
      location,
      summary: `${mainCharacter.name} ${action} in front of ${charactersPresent.length} others`,
      emotionalTone: emotion,
      consequences: [],
      dialogueHighlights: []
    });

    // Update relationships based on how others react to the action
    charactersPresent.forEach(witnessId => {
      const witness = this.characterSeeds.get(witnessId);
      if (!witness) return;

      const existingRelationship = mainCharacter.relationships.get(witnessId);
      let reactionStrength = 1;

      // Modify reaction based on existing relationship
      if (existingRelationship) {
        if (existingRelationship.affectionLevel > 70) {
          reactionStrength = 1.5; // Friends react more strongly (both good and bad)
        } else if (existingRelationship.affectionLevel < 30) {
          reactionStrength = 1.3; // Enemies also react more strongly
        }
      }

      // Different actions have different social impacts
      let reputationImpact = 0;
      if (action.includes('help') || action.includes('kind') || action.includes('generous')) {
        reputationImpact = Math.floor(3 * reactionStrength);
      } else if (action.includes('rude') || action.includes('mean') || action.includes('selfish')) {
        reputationImpact = Math.floor(-4 * reactionStrength);
      } else if (action.includes('funny') || action.includes('clever')) {
        reputationImpact = Math.floor(2 * reactionStrength);
      }

      // Update the relationship between characters
      this.updateCharacterRelationship(primaryCharacter, witnessId, {
        affectionChange: reputationImpact,
        newMemory: `${mainCharacter.name} ${action} in ${location}`
      });

      // Update witness's opinion of the primary character
      this.updateCharacterRelationship(witnessId, primaryCharacter, {
        affectionChange: reputationImpact,
        newMemory: `Witnessed ${mainCharacter.name} ${action}`
      });
    });

    // Update main character's reputation based on the action
    const reputationChange = Math.floor(
      (socialContext.reputationModifier + charactersPresent.length) / 2
    );
    
    if (action.includes('help') || action.includes('kind')) {
      mainCharacter.abilities.social.reputation = Math.min(100, 
        mainCharacter.abilities.social.reputation + reputationChange);
    } else if (action.includes('rude') || action.includes('mean')) {
      mainCharacter.abilities.social.reputation = Math.max(0, 
        mainCharacter.abilities.social.reputation - reputationChange);
    }
  }

  /**
   * Determine if a character would typically be in a specific location
   */
  private wouldCharacterBeInLocation(character: CharacterSeed, location: string): boolean {
    // Simple logic - could be enhanced with time-of-day, character schedules, etc.
    const locationSeed = this.locationSeeds.get(location);
    if (!locationSeed) return false;

    // Teachers are more likely in academic locations
    if (character.reputationTags.includes('teacher')) {
      return ['faculty_room', 'classroom_1a', 'library', 'science_lab'].includes(location);
    }

    // Students more likely in social areas
    if (character.reputationTags.includes('student')) {
      return ['cafeteria', 'courtyard', 'library', 'club_building'].includes(location);
    }

    // Athletic characters more likely in gym
    if (character.abilities.athletic.sports.length > 0) {
      return ['gymnasium', 'courtyard'].includes(location);
    }

    // Default: moderate chance in common areas
    return ['courtyard', 'cafeteria', 'main_hallway'].includes(location);
  }

  /**
   * Get character's reaction to player based on relationship and reputation
   */
  getCharacterReactionToPlayer(characterId: string): {
    baseAttitude: string;
    trustLevel: string;
    socialStanding: string;
    interactionStyle: string;
  } {
    const character = this.characterSeeds.get(characterId);
    if (!character) {
      return { baseAttitude: 'neutral', trustLevel: 'unknown', socialStanding: 'neutral', interactionStyle: 'polite' };
    }

    const relationship = character.relationships.get('player');
    const affection = relationship?.affectionLevel || 50;
    const trust = relationship?.trustLevel || 50;

    let baseAttitude = 'neutral';
    if (affection > 80) baseAttitude = 'very friendly';
    else if (affection > 60) baseAttitude = 'friendly';
    else if (affection > 40) baseAttitude = 'neutral';
    else if (affection > 20) baseAttitude = 'distant';
    else baseAttitude = 'hostile';

    let trustLevel = 'moderate';
    if (trust > 80) trustLevel = 'complete trust';
    else if (trust > 60) trustLevel = 'high trust';
    else if (trust > 40) trustLevel = 'moderate trust';
    else if (trust > 20) trustLevel = 'low trust';
    else trustLevel = 'no trust';

    let socialStanding = 'equal';
    const playerReputation = 50; // This could be tracked separately
    if (character.abilities.social.reputation > playerReputation + 20) {
      socialStanding = 'looks down on player';
    } else if (character.abilities.social.reputation < playerReputation - 20) {
      socialStanding = 'looks up to player';
    }

    let interactionStyle = 'polite';
    if (character.personality.socialStyle === 'shy' && affection < 60) {
      interactionStyle = 'nervous';
    } else if (character.personality.traits.includes('confident') && affection > 70) {
      interactionStyle = 'warm and open';
    } else if (character.personality.traits.includes('aggressive') && affection < 40) {
      interactionStyle = 'confrontational';
    }

    return { baseAttitude, trustLevel, socialStanding, interactionStyle };
  }
}