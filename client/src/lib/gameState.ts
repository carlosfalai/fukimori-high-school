import { Game, ScheduleItem, SchoolSchedule, GameScene, PlayerCharacter } from "@shared/schema";

// Default schedule
export const generateDefaultSchedule = (): SchoolSchedule => {
  return {
    monday: [
      { time: '08:30 - 08:45', activity: 'Morning Assembly' },
      { time: '08:50 - 09:40', activity: 'Mathematics' },
      { time: '09:50 - 10:40', activity: 'Japanese' },
      { time: '10:50 - 11:40', activity: 'Science' },
      { time: '11:50 - 12:40', activity: 'English' },
      { time: '12:40 - 13:30', activity: 'Lunch Break' },
      { time: '13:30 - 14:20', activity: 'Social Studies' },
      { time: '14:30 - 15:20', activity: 'Physical Education' },
      { time: '15:30 - 17:00', activity: 'Club Activities' }
    ],
    tuesday: [
      { time: '08:30 - 08:45', activity: 'Homeroom' },
      { time: '08:50 - 09:40', activity: 'Science' },
      { time: '09:50 - 10:40', activity: 'Mathematics' },
      { time: '10:50 - 11:40', activity: 'Japanese' },
      { time: '11:50 - 12:40', activity: 'Art' },
      { time: '12:40 - 13:30', activity: 'Lunch Break' },
      { time: '13:30 - 14:20', activity: 'English' },
      { time: '14:30 - 15:20', activity: 'Music' },
      { time: '15:30 - 17:00', activity: 'Club Activities' }
    ],
    wednesday: [
      { time: '08:30 - 08:45', activity: 'Homeroom' },
      { time: '08:50 - 09:40', activity: 'Japanese' },
      { time: '09:50 - 10:40', activity: 'Social Studies' },
      { time: '10:50 - 11:40', activity: 'Mathematics' },
      { time: '11:50 - 12:40', activity: 'English' },
      { time: '12:40 - 13:30', activity: 'Lunch Break' },
      { time: '13:30 - 14:20', activity: 'Science' },
      { time: '14:30 - 15:20', activity: 'Technical Arts' },
      { time: '15:30 - 17:00', activity: 'Club Activities' }
    ],
    thursday: [
      { time: '08:30 - 08:45', activity: 'Homeroom' },
      { time: '08:50 - 09:40', activity: 'English' },
      { time: '09:50 - 10:40', activity: 'Science' },
      { time: '10:50 - 11:40', activity: 'Japanese' },
      { time: '11:50 - 12:40', activity: 'Mathematics' },
      { time: '12:40 - 13:30', activity: 'Lunch Break' },
      { time: '13:30 - 14:20', activity: 'Social Studies' },
      { time: '14:30 - 15:20', activity: 'Physical Education' },
      { time: '15:30 - 17:00', activity: 'Club Activities' }
    ],
    friday: [
      { time: '08:30 - 08:45', activity: 'Homeroom' },
      { time: '08:50 - 09:40', activity: 'Mathematics' },
      { time: '09:50 - 10:40', activity: 'English' },
      { time: '10:50 - 11:40', activity: 'Japanese' },
      { time: '11:50 - 12:40', activity: 'Science' },
      { time: '12:40 - 13:30', activity: 'Lunch Break' },
      { time: '13:30 - 14:20', activity: 'Social Studies' },
      { time: '14:30 - 15:20', activity: 'Health Education' },
      { time: '15:30 - 17:00', activity: 'Club Activities' }
    ],
    saturday: [
      { time: '08:30 - 08:45', activity: 'Homeroom' },
      { time: '08:50 - 09:40', activity: 'Elective Course' },
      { time: '09:50 - 10:40', activity: 'Elective Course' },
      { time: '10:50 - 11:40', activity: 'Class Meeting' },
      { time: '11:50 - 12:40', activity: 'Cleaning Time' },
      { time: '12:40 - 13:00', activity: 'Weekly Assembly' }
    ],
    sunday: []
  };
};

// Generate a starting date for the school year
export const generateStartDate = (): string => {
  const currentYear = new Date().getFullYear();
  // April 10th of current year
  return `${currentYear}-04-10`;
};

// Generate default player character
export const generateDefaultPlayerCharacter = (name: string = "Player"): PlayerCharacter => {
  return {
    name,
    gender: "male", // All players are male
    year: 1, // First year student
    age: 15, // Starting age
    appearance: {
      height: 170, // cm
      build: "average",
      features: {}
    },
    stats: {
      academics: 50,
      athletics: 50,
      charm: 50,
      creativity: 50,
      reputation: 50
    },
    relationships: {}, // Relationship levels with other characters
    inventory: [],
    activities: {
      gym: 0,
      study: 0,
      club: "",
      clubTime: 0
    },
    achievements: [],
    status: {
      inSchool: true, // Can be expelled
      detention: 0, // Days in detention
      suspension: 0, // Days suspended
      isJailed: false, // Can be jailed for severe infractions
      health: 100,
      energy: 100,
      money: 1000 // Starting money (yen)
    },
    scheduleToday: [] // Today's class schedule
  };
};

// Generate default initial scene
export const generateInitialScene = (): GameScene => {
  return {
    location: 'entrance',
    time: '08:00', // Time in 24-hour format
    day: 1,
    date: generateStartDate(),
    characters: [],
    background: 'school_entrance.jpg',
    dialogue: [],
  };
};

// Create a new game state
export const createNewGame = (userId: number, playerName: string = "Player"): Game => {
  const schoolSchedule = generateDefaultSchedule();
  const playerCharacter = generateDefaultPlayerCharacter(playerName);
  const currentScene = generateInitialScene();
  
  // Set today's schedule based on the day of the week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dateObj = new Date(currentScene.date);
  const dayOfWeek = days[dateObj.getDay()];
  playerCharacter.scheduleToday = schoolSchedule[dayOfWeek as keyof SchoolSchedule] || [];
  
  return {
    id: 0, // Will be set by the server
    userId,
    currentPage: 0,
    totalPages: 50, // Starting with 50 free pages
    currentScene,
    playerCharacter,
    characters: [],
    gameYear: 1, // Academic year (1-3 for high school)
    gameMonth: 4, // Starting in April (Japanese school year starts in April)
    schoolSchedule,
    history: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Helper to get current day of week
export const getCurrentDayOfWeek = (date: string): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dateObj = new Date(date);
  return days[dateObj.getDay()];
};

// Get current activity based on time
export const getCurrentActivity = (gameState: Game): string => {
  const currentTime = gameState.currentScene.time;
  const schedule = gameState.playerCharacter.scheduleToday;
  
  for (const period of schedule) {
    const [startTime] = period.time.split(' - ');
    const [endTime] = period.time.split(' - ')[1] || '23:59';
    
    if (currentTime >= startTime && currentTime <= endTime) {
      return period.activity;
    }
  }
  
  // Outside of school hours
  if (currentTime < '08:00' || currentTime > '17:00') {
    return 'Free Time';
  }
  
  return 'Free Period';
};
