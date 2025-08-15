export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'academic' | 'athletic' | 'romantic' | 'rebel' | 'leadership';
  reputationEffect: {
    popularityChange: number;
    respectChange: number;
    fearChange: number;
    attractivenessChange: number;
  };
  unlockedAt: Date;
  triggerEvent: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface ReputationStatus {
  popularity: number; // How well-liked you are (0-100)
  respect: number; // How much others respect you (0-100)
  fear: number; // How much others fear you (0-100)
  attractiveness: number; // Romantic appeal (0-100)
  notoriety: number; // How famous/infamous you are (0-100)
  currentTitle: string; // Current reputation title
  achievements: Achievement[];
}

export class AchievementSystem {
  private playerReputation: ReputationStatus;
  private achievementDatabase: Map<string, Omit<Achievement, 'unlockedAt'>> = new Map();

  constructor() {
    this.playerReputation = {
      popularity: 50,
      respect: 50,
      fear: 0,
      attractiveness: 50,
      notoriety: 10,
      currentTitle: "The Transfer Student",
      achievements: []
    };
    
    this.initializeAchievements();
  }

  private initializeAchievements() {
    // Romantic Achievements
    this.achievementDatabase.set('first_kiss', {
      id: 'first_kiss',
      name: "Not a Simp Anymore",
      description: "Successfully kissed someone without paying for it",
      category: 'romantic',
      reputationEffect: { popularityChange: 15, respectChange: 10, fearChange: 0, attractivenessChange: 20 },
      triggerEvent: 'first_kiss_success',
      rarity: 'uncommon'
    });

    this.achievementDatabase.set('dating_popular_girl', {
      id: 'dating_popular_girl',
      name: "Enemy of the School", 
      description: "Dating the most popular girl - now all the guys hate you",
      category: 'romantic',
      reputationEffect: { popularityChange: -30, respectChange: 25, fearChange: 15, attractivenessChange: 40 },
      triggerEvent: 'dating_most_popular_girl',
      rarity: 'legendary'
    });

    this.achievementDatabase.set('friendzoned_hard', {
      id: 'friendzoned_hard',
      name: "Professional Friend",
      description: "Been friendzoned by 5 different people",
      category: 'romantic',
      reputationEffect: { popularityChange: 10, respectChange: -10, fearChange: -5, attractivenessChange: -20 },
      triggerEvent: 'friendzoned_5_times',
      rarity: 'rare'
    });

    // Social Achievements
    this.achievementDatabase.set('social_outcast', {
      id: 'social_outcast',
      name: "Lunch Alone Champion",
      description: "Ate lunch alone for 2 weeks straight",
      category: 'social',
      reputationEffect: { popularityChange: -20, respectChange: -5, fearChange: 0, attractivenessChange: -10 },
      triggerEvent: 'lunch_alone_14_days',
      rarity: 'uncommon'
    });

    this.achievementDatabase.set('party_king', {
      id: 'party_king',
      name: "The Life of Every Party",
      description: "Organized 3 successful parties this semester",
      category: 'social',
      reputationEffect: { popularityChange: 35, respectChange: 15, fearChange: 5, attractivenessChange: 25 },
      triggerEvent: 'organized_3_parties',
      rarity: 'rare'
    });

    this.achievementDatabase.set('gossip_master', {
      id: 'gossip_master',
      name: "The School's TMZ",
      description: "Successfully spread 10 rumors that turned out to be true",
      category: 'social',
      reputationEffect: { popularityChange: 20, respectChange: -10, fearChange: 15, attractivenessChange: 5 },
      triggerEvent: 'spread_10_true_rumors',
      rarity: 'rare'
    });

    // Academic Achievements
    this.achievementDatabase.set('perfect_student', {
      id: 'perfect_student',
      name: "Teacher's Pet Supreme",
      description: "Got perfect scores on 5 consecutive tests",
      category: 'academic',
      reputationEffect: { popularityChange: -5, respectChange: 30, fearChange: 0, attractivenessChange: -5 },
      triggerEvent: 'perfect_scores_5_tests',
      rarity: 'rare'
    });

    this.achievementDatabase.set('cheating_mastermind', {
      id: 'cheating_mastermind',
      name: "Academic Underground",
      description: "Successfully ran a cheating operation for a whole semester",
      category: 'academic',
      reputationEffect: { popularityChange: 25, respectChange: -15, fearChange: 20, attractivenessChange: 10 },
      triggerEvent: 'cheating_operation_semester',
      rarity: 'legendary'
    });

    // Athletic Achievements
    this.achievementDatabase.set('sports_hero', {
      id: 'sports_hero',
      name: "The School's Ace",
      description: "Won the championship for your sports club",
      category: 'athletic',
      reputationEffect: { popularityChange: 40, respectChange: 35, fearChange: 10, attractivenessChange: 30 },
      triggerEvent: 'won_championship',
      rarity: 'legendary'
    });

    this.achievementDatabase.set('gym_disaster', {
      id: 'gym_disaster',
      name: "Human Catastrophe",
      description: "Injured 3 people during gym class in one day",
      category: 'athletic',
      reputationEffect: { popularityChange: -15, respectChange: -20, fearChange: 10, attractivenessChange: -15 },
      triggerEvent: 'injured_3_people_gym',
      rarity: 'uncommon'
    });

    // Rebel Achievements
    this.achievementDatabase.set('detention_king', {
      id: 'detention_king',
      name: "Detention Hall of Fame",
      description: "Spent more time in detention than in class this month",
      category: 'rebel',
      reputationEffect: { popularityChange: 15, respectChange: -25, fearChange: 25, attractivenessChange: 10 },
      triggerEvent: 'detention_more_than_class',
      rarity: 'rare'
    });

    this.achievementDatabase.set('rooftop_access', {
      id: 'rooftop_access',
      name: "Sky High Rebel",
      description: "Found a way to access the school rooftop",
      category: 'rebel',
      reputationEffect: { popularityChange: 20, respectChange: 5, fearChange: 5, attractivenessChange: 15 },
      triggerEvent: 'accessed_rooftop',
      rarity: 'uncommon'
    });

    // Leadership Achievements
    this.achievementDatabase.set('student_president', {
      id: 'student_president',
      name: "The People's Choice",
      description: "Won student council president election",
      category: 'leadership',
      reputationEffect: { popularityChange: 50, respectChange: 40, fearChange: 0, attractivenessChange: 20 },
      triggerEvent: 'won_student_president',
      rarity: 'legendary'
    });

    this.achievementDatabase.set('club_destroyer', {
      id: 'club_destroyer',
      name: "The Club Killer",
      description: "Single-handedly caused 2 clubs to disband",
      category: 'leadership',
      reputationEffect: { popularityChange: -30, respectChange: -20, fearChange: 30, attractivenessChange: -10 },
      triggerEvent: 'disbanded_2_clubs',
      rarity: 'rare'
    });
  }

  /**
   * Trigger an achievement based on game events
   */
  triggerAchievement(eventId: string): Achievement | null {
    const achievementTemplate = Array.from(this.achievementDatabase.values())
      .find(achievement => achievement.triggerEvent === eventId);

    if (!achievementTemplate || this.hasAchievement(achievementTemplate.id)) {
      return null; // Achievement doesn't exist or already unlocked
    }

    const newAchievement: Achievement = {
      ...achievementTemplate,
      unlockedAt: new Date()
    };

    // Add to player's achievements
    this.playerReputation.achievements.push(newAchievement);

    // Apply reputation effects
    this.applyReputationChanges(newAchievement.reputationEffect);

    // Update title based on new reputation
    this.updatePlayerTitle();

    return newAchievement;
  }

  /**
   * Apply reputation changes and clamp values
   */
  private applyReputationChanges(effects: Achievement['reputationEffect']) {
    this.playerReputation.popularity = Math.max(0, Math.min(100, 
      this.playerReputation.popularity + effects.popularityChange));
    this.playerReputation.respect = Math.max(0, Math.min(100, 
      this.playerReputation.respect + effects.respectChange));
    this.playerReputation.fear = Math.max(0, Math.min(100, 
      this.playerReputation.fear + effects.fearChange));
    this.playerReputation.attractiveness = Math.max(0, Math.min(100, 
      this.playerReputation.attractiveness + effects.attractivenessChange));
    
    // Calculate notoriety based on how extreme your stats are
    const extremeness = Math.max(
      Math.abs(this.playerReputation.popularity - 50),
      Math.abs(this.playerReputation.respect - 50),
      Math.abs(this.playerReputation.fear - 50),
      Math.abs(this.playerReputation.attractiveness - 50)
    );
    this.playerReputation.notoriety = Math.min(100, extremeness * 2);
  }

  /**
   * Update player's title based on current reputation
   */
  private updatePlayerTitle() {
    const { popularity, respect, fear, attractiveness } = this.playerReputation;

    // Legendary status titles
    if (fear > 80) this.playerReputation.currentTitle = "The Untouchable";
    else if (popularity > 90) this.playerReputation.currentTitle = "School Royalty";
    else if (respect > 90) this.playerReputation.currentTitle = "The Legend";
    else if (attractiveness > 90) this.playerReputation.currentTitle = "Heartbreaker Supreme";
    
    // High status titles
    else if (popularity > 80 && attractiveness > 70) this.playerReputation.currentTitle = "The Golden Student";
    else if (fear > 60 && respect > 60) this.playerReputation.currentTitle = "Respected & Feared";
    else if (popularity > 75) this.playerReputation.currentTitle = "School Celebrity";
    else if (respect > 75) this.playerReputation.currentTitle = "The Respected One";
    else if (attractiveness > 75) this.playerReputation.currentTitle = "The Heartbreaker";
    else if (fear > 60) this.playerReputation.currentTitle = "The Intimidator";
    
    // Balanced titles
    else if (popularity > 60 && respect > 60) this.playerReputation.currentTitle = "Well-Rounded Student";
    else if (popularity > 65) this.playerReputation.currentTitle = "Popular Kid";
    else if (respect > 65) this.playerReputation.currentTitle = "The Reliable One";
    else if (attractiveness > 65) this.playerReputation.currentTitle = "The Charmer";
    
    // Low status titles
    else if (popularity < 20) this.playerReputation.currentTitle = "Social Outcast";
    else if (respect < 20) this.playerReputation.currentTitle = "The Disappointment";
    else if (attractiveness < 20) this.playerReputation.currentTitle = "Romantically Challenged";
    else if (fear < 10 && popularity < 40) this.playerReputation.currentTitle = "The Invisible Student";
    
    // Default titles
    else this.playerReputation.currentTitle = "Regular Student";
  }

  /**
   * Check if player has specific achievement
   */
  hasAchievement(achievementId: string): boolean {
    return this.playerReputation.achievements.some(achievement => achievement.id === achievementId);
  }

  /**
   * Get how other characters should react to player based on reputation
   */
  getCharacterReactionModifier(characterPersonality: string[]): {
    attitudeShift: string;
    dialogueModifier: string;
    relationshipBonus: number;
  } {
    const { popularity, respect, fear, attractiveness, currentTitle } = this.playerReputation;

    // Popular characters
    if (characterPersonality.includes('popular')) {
      if (popularity > 80) return {
        attitudeShift: 'impressed',
        dialogueModifier: 'treats you as an equal',
        relationshipBonus: 15
      };
      if (popularity < 30) return {
        attitudeShift: 'dismissive',
        dialogueModifier: 'barely acknowledges you',
        relationshipBonus: -10
      };
    }

    // Shy characters
    if (characterPersonality.includes('shy')) {
      if (fear > 50) return {
        attitudeShift: 'intimidated',
        dialogueModifier: 'nervous and stuttering',
        relationshipBonus: -15
      };
      if (attractiveness > 70) return {
        attitudeShift: 'flustered',
        dialogueModifier: 'blushing and awkward',
        relationshipBonus: 5
      };
    }

    // Rebellious characters
    if (characterPersonality.includes('rebellious')) {
      if (respect < 30 && fear < 20) return {
        attitudeShift: 'contemptuous',
        dialogueModifier: 'mocks you openly',
        relationshipBonus: -20
      };
      if (fear > 60) return {
        attitudeShift: 'respectful',
        dialogueModifier: 'acknowledges your reputation',
        relationshipBonus: 10
      };
    }

    return {
      attitudeShift: 'normal',
      dialogueModifier: 'treats you normally',
      relationshipBonus: 0
    };
  }

  /**
   * Get current reputation status
   */
  getReputationStatus(): ReputationStatus {
    return { ...this.playerReputation };
  }

  /**
   * Get recent achievements (last 5)
   */
  getRecentAchievements(): Achievement[] {
    return this.playerReputation.achievements
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 5);
  }

  /**
   * Simulate complex reputation scenarios
   */
  simulateScenario(scenario: string): { 
    achievementUnlocked?: Achievement; 
    reputationChanges: string[];
    newInteractions: string[];
  } {
    const results = {
      reputationChanges: [] as string[],
      newInteractions: [] as string[]
    };

    switch (scenario) {
      case 'caught_cheating_with_principals_daughter':
        const achievement = this.triggerAchievement('dating_most_popular_girl');
        results.reputationChanges.push('Massive scandal spreads through school');
        results.reputationChanges.push('Teachers are conflicted about your grades');
        results.newInteractions.push('Male students glare at you with jealousy');
        results.newInteractions.push('Female students gossip whenever you pass');
        results.newInteractions.push('Principal gives you awkward stares');
        return { achievementUnlocked: achievement || undefined, ...results };

      case 'started_underground_fight_club':
        results.reputationChanges.push('Fear factor increases dramatically');
        results.reputationChanges.push('Respect from delinquents skyrockets');
        results.newInteractions.push('Tough students start asking for your approval');
        results.newInteractions.push('Teachers become more cautious around you');
        results.newInteractions.push('Shy students avoid eye contact');
        return results;

      default:
        return results;
    }
  }
}