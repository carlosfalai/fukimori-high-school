import { DeepSeekService } from './DeepSeekService';

export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNext: number;
  
  // Core characteristics that can be improved
  characteristics: {
    academics: number;      // 1-100, affects learning and study interactions
    athletics: number;      // 1-100, affects sports and physical activities  
    charm: number;         // 1-100, affects social interactions and relationships
    creativity: number;    // 1-100, affects artistic activities and problem solving
    reputation: number;    // 1-100, affects how NPCs initially react to player
    courage: number;       // 1-100, affects ability to take risks and stand up to others
    empathy: number;      // 1-100, affects understanding others and helping
    leadership: number;   // 1-100, affects ability to influence groups
  };

  // Skills that can be learned and improved
  skills: {
    [skillName: string]: {
      level: number;        // 1-10 skill level
      experience: number;   // XP in this specific skill
      unlocked: boolean;    // Whether the skill is available to the player
    };
  };

  // Inventory and possessions
  inventory: {
    items: string[];           // Items the player owns
    money: number;            // Player's money
    specialItems: string[];   // Unique or story-important items
    maxCapacity: number;      // How many items player can carry
  };

  // Unlocked actions and abilities
  unlockedActions: string[];  // Special actions the player can perform
  
  // Relationship multipliers based on characteristics
  relationshipBonuses: {
    [characterType: string]: number; // Bonus to relationship gains with certain character types
  };
}

export interface ExperienceGain {
  amount: number;
  source: string;
  skillCategory?: string;
  description: string;
}

export class PlayerProgression {
  private deepSeekService: DeepSeekService;
  private playerStats: PlayerStats;

  constructor(deepSeekService: DeepSeekService) {
    this.deepSeekService = deepSeekService;
    this.playerStats = this.initializePlayerStats();
    this.loadPersistedData();
  }

  private initializePlayerStats(): PlayerStats {
    return {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      
      characteristics: {
        academics: 50,
        athletics: 50,
        charm: 50,
        creativity: 50,
        reputation: 50,
        courage: 50,
        empathy: 50,
        leadership: 50
      },

      skills: {
        // Academic skills
        'mathematics': { level: 1, experience: 0, unlocked: true },
        'literature': { level: 1, experience: 0, unlocked: true },
        'science': { level: 1, experience: 0, unlocked: true },
        'history': { level: 1, experience: 0, unlocked: true },
        
        // Social skills  
        'persuasion': { level: 1, experience: 0, unlocked: false },
        'intimidation': { level: 1, experience: 0, unlocked: false },
        'diplomacy': { level: 1, experience: 0, unlocked: false },
        'comedy': { level: 1, experience: 0, unlocked: false },
        
        // Physical skills
        'martial_arts': { level: 1, experience: 0, unlocked: false },
        'athletics': { level: 1, experience: 0, unlocked: true },
        'dancing': { level: 1, experience: 0, unlocked: false },
        
        // Creative skills
        'art': { level: 1, experience: 0, unlocked: false },
        'music': { level: 1, experience: 0, unlocked: false },
        'writing': { level: 1, experience: 0, unlocked: false },
        'photography': { level: 1, experience: 0, unlocked: false },
        
        // Special skills
        'supernatural_control': { level: 1, experience: 0, unlocked: false },
        'meditation': { level: 1, experience: 0, unlocked: false },
        'investigation': { level: 1, experience: 0, unlocked: false }
      },

      inventory: {
        items: ['school_bag', 'pencil', 'notebook'],
        money: 1000, // Starting money in yen
        specialItems: [],
        maxCapacity: 10
      },

      unlockedActions: [
        'study', 'exercise', 'socialize', 'explore_school'
      ],

      relationshipBonuses: {}
    };
  }

  /**
   * Award experience to the player for various actions
   */
  awardExperience(gain: ExperienceGain): {
    leveledUp: boolean;
    newLevel?: number;
    characteristicImproved?: string;
    skillImproved?: string;
    actionsUnlocked?: string[];
  } {
    const oldLevel = this.playerStats.level;
    this.playerStats.experience += gain.amount;
    
    // Add skill-specific experience
    if (gain.skillCategory && this.playerStats.skills[gain.skillCategory]) {
      this.playerStats.skills[gain.skillCategory].experience += gain.amount;
      this.checkSkillLevelUp(gain.skillCategory);
    }

    // Check for level up
    const result = this.checkLevelUp();
    
    // Store the experience gain in memory
    this.deepSeekService.addMemory({
      eventId: this.deepSeekService.generateEventId(),
      timestamp: new Date().toISOString(),
      participants: ['player'],
      location: 'progression_system',
      summary: `Player gained ${gain.amount} XP from ${gain.source}: ${gain.description}`,
      emotionalTone: 'accomplished',
      consequences: result.leveledUp ? [`Level up to ${result.newLevel}`] : [],
      dialogueHighlights: []
    });

    this.persistData();
    return result;
  }

  /**
   * Check if the player leveled up and handle level up rewards
   */
  private checkLevelUp(): {
    leveledUp: boolean;
    newLevel?: number;
    characteristicImproved?: string;
    actionsUnlocked?: string[];
  } {
    if (this.playerStats.experience < this.playerStats.experienceToNext) {
      return { leveledUp: false };
    }

    const oldLevel = this.playerStats.level;
    this.playerStats.level++;
    this.playerStats.experience -= this.playerStats.experienceToNext;
    this.playerStats.experienceToNext = Math.floor(this.playerStats.experienceToNext * 1.2);

    // Level up rewards
    const rewards = this.handleLevelUpRewards();
    
    return {
      leveledUp: true,
      newLevel: this.playerStats.level,
      ...rewards
    };
  }

  /**
   * Handle rewards and improvements when player levels up
   */
  private handleLevelUpRewards(): {
    characteristicImproved?: string;
    actionsUnlocked?: string[];
  } {
    const level = this.playerStats.level;
    const actionsUnlocked: string[] = [];
    
    // Every level: choose a characteristic to improve
    const characteristicImproved = this.improveRandomCharacteristic();
    
    // Unlock new actions at specific levels
    if (level === 3 && !this.playerStats.unlockedActions.includes('join_club')) {
      this.playerStats.unlockedActions.push('join_club');
      actionsUnlocked.push('join_club');
    }
    
    if (level === 5 && !this.playerStats.unlockedActions.includes('ask_on_date')) {
      this.playerStats.unlockedActions.push('ask_on_date');
      actionsUnlocked.push('ask_on_date');
    }
    
    if (level === 7 && !this.playerStats.unlockedActions.includes('start_rumors')) {
      this.playerStats.unlockedActions.push('start_rumors');
      actionsUnlocked.push('start_rumors');
    }
    
    if (level === 10 && !this.playerStats.unlockedActions.includes('organize_event')) {
      this.playerStats.unlockedActions.push('organize_event');
      actionsUnlocked.push('organize_event');
    }

    // Unlock skills at certain levels
    if (level === 4) this.unlockSkill('persuasion');
    if (level === 6) this.unlockSkill('art');
    if (level === 8) this.unlockSkill('martial_arts');
    if (level === 12) this.unlockSkill('supernatural_control');

    // Increase inventory capacity
    if (level % 3 === 0) {
      this.playerStats.inventory.maxCapacity += 2;
    }

    return { characteristicImproved, actionsUnlocked };
  }

  /**
   * Improve a random characteristic based on recent activities
   */
  private improveRandomCharacteristic(): string {
    const recentMemories = this.deepSeekService.getStoryMemory().slice(-10);
    const characteristics = Object.keys(this.playerStats.characteristics);
    
    // Weight improvements based on recent activities
    const weights: { [key: string]: number } = {};
    characteristics.forEach(char => weights[char] = 1);
    
    recentMemories.forEach(memory => {
      if (memory.summary.includes('study') || memory.summary.includes('class')) {
        weights.academics += 2;
      }
      if (memory.summary.includes('exercise') || memory.summary.includes('sports')) {
        weights.athletics += 2;
      }
      if (memory.summary.includes('social') || memory.summary.includes('friend')) {
        weights.charm += 2;
      }
      if (memory.summary.includes('art') || memory.summary.includes('creative')) {
        weights.creativity += 2;
      }
      if (memory.summary.includes('help') || memory.summary.includes('kind')) {
        weights.empathy += 2;
      }
      if (memory.summary.includes('lead') || memory.summary.includes('organize')) {
        weights.leadership += 2;
      }
      if (memory.summary.includes('brave') || memory.summary.includes('stand up')) {
        weights.courage += 2;
      }
    });

    // Choose weighted random characteristic to improve
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [char, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        this.playerStats.characteristics[char as keyof typeof this.playerStats.characteristics] = 
          Math.min(100, this.playerStats.characteristics[char as keyof typeof this.playerStats.characteristics] + 5);
        return char;
      }
    }
    
    return 'academics'; // fallback
  }

  /**
   * Check if a skill leveled up
   */
  private checkSkillLevelUp(skillName: string): boolean {
    const skill = this.playerStats.skills[skillName];
    if (!skill) return false;

    const xpNeeded = skill.level * 50; // XP needed increases with level
    if (skill.experience >= xpNeeded) {
      skill.level++;
      skill.experience -= xpNeeded;
      return true;
    }
    return false;
  }

  /**
   * Unlock a new skill for the player
   */
  private unlockSkill(skillName: string): void {
    if (this.playerStats.skills[skillName]) {
      this.playerStats.skills[skillName].unlocked = true;
    }
  }

  /**
   * Add an item to the player's inventory
   */
  addItem(item: string, isSpecial: boolean = false): boolean {
    if (isSpecial) {
      this.playerStats.inventory.specialItems.push(item);
      return true;
    }
    
    if (this.playerStats.inventory.items.length < this.playerStats.inventory.maxCapacity) {
      this.playerStats.inventory.items.push(item);
      this.persistData();
      return true;
    }
    return false; // Inventory full
  }

  /**
   * Remove an item from inventory
   */
  removeItem(item: string): boolean {
    const index = this.playerStats.inventory.items.indexOf(item);
    if (index > -1) {
      this.playerStats.inventory.items.splice(index, 1);
      this.persistData();
      return true;
    }
    return false;
  }

  /**
   * Get experience multiplier based on characteristics
   */
  getExperienceMultiplier(activity: string): number {
    let multiplier = 1.0;
    
    switch (activity) {
      case 'academic':
        multiplier += (this.playerStats.characteristics.academics - 50) / 100;
        break;
      case 'social':
        multiplier += (this.playerStats.characteristics.charm - 50) / 100;
        break;
      case 'physical':
        multiplier += (this.playerStats.characteristics.athletics - 50) / 100;
        break;
      case 'creative':
        multiplier += (this.playerStats.characteristics.creativity - 50) / 100;
        break;
    }
    
    return Math.max(0.5, Math.min(2.0, multiplier));
  }

  /**
   * Get player's current progression data
   */
  getPlayerStats(): PlayerStats {
    return { ...this.playerStats };
  }

  /**
   * Check if player can perform an action
   */
  canPerformAction(action: string): boolean {
    return this.playerStats.unlockedActions.includes(action);
  }

  /**
   * Get skill level for a specific skill
   */
  getSkillLevel(skillName: string): number {
    return this.playerStats.skills[skillName]?.level || 0;
  }

  /**
   * Check if skill is unlocked
   */
  isSkillUnlocked(skillName: string): boolean {
    return this.playerStats.skills[skillName]?.unlocked || false;
  }

  private persistData(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('playerProgression', JSON.stringify(this.playerStats));
    }
  }

  private loadPersistedData(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('playerProgression');
        if (data) {
          const loaded = JSON.parse(data);
          this.playerStats = { ...this.playerStats, ...loaded };
        }
      } catch (error) {
        console.error('Error loading player progression data:', error);
      }
    }
  }
}