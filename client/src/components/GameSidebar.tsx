import { useState } from "react";
import { Game, ScheduleItem } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Book,
  GraduationCap,
  MapPin,
  ShoppingBag,
  Users,
  Heart,
  Dumbbell,
  Palette,
  Calendar,
  Clock,
  MessageSquare,
  Star
} from "lucide-react";

// Japanese days of week with English translation
const DAYS_OF_WEEK = {
  sunday: { ja: '日曜日', en: 'Sunday' },
  monday: { ja: '月曜日', en: 'Monday' },
  tuesday: { ja: '火曜日', en: 'Tuesday' },
  wednesday: { ja: '水曜日', en: 'Wednesday' },
  thursday: { ja: '木曜日', en: 'Thursday' },
  friday: { ja: '金曜日', en: 'Friday' },
  saturday: { ja: '土曜日', en: 'Saturday' }
};

interface GameSidebarProps {
  gameState: Game;
  onViewCharacter: (characterId: string) => void;
}

export default function GameSidebar({ gameState, onViewCharacter }: GameSidebarProps) {
  // Check if we have a valid game state with all required properties
  const isValidGameState = (): boolean => {
    return !!(
      gameState && 
      gameState.currentScene && 
      gameState.playerCharacter &&
      gameState.playerCharacter.scheduleToday
    );
  };

  // Helper to get day of the week
  const getCurrentDayOfWeek = (): { ja: string; en: string } => {
    if (!gameState || !gameState.currentScene || !gameState.currentScene.date) {
      return DAYS_OF_WEEK.monday; // Default fallback
    }
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    try {
      const dateObj = new Date(gameState.currentScene.date);
      const dayKey = days[dateObj.getDay()];
      return DAYS_OF_WEEK[dayKey as keyof typeof DAYS_OF_WEEK];
    } catch (error) {
      console.error("Error parsing date:", error);
      return DAYS_OF_WEEK.monday; // Fallback
    }
  };

  // Get current activity based on time
  const getCurrentActivity = (): string => {
    if (!isValidGameState()) {
      return "Free Time"; 
    }
    
    const currentTime = gameState.currentScene.time;
    const schedule = gameState.playerCharacter.scheduleToday || [];
    
    for (const period of schedule) {
      if (!period || !period.time) continue;
      
      const timeParts = period.time.split(' - ');
      if (timeParts.length < 2) continue;
      
      const startTime = timeParts[0];
      const endTime = timeParts[1] || '23:59';
      
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
  
  // Function to determine if a schedule item is active
  const isActiveScheduleItem = (item: ScheduleItem): boolean => {
    if (!isValidGameState() || !item || !item.time || !gameState.currentScene.time) {
      return false;
    }
    
    const currentTime = gameState.currentScene.time;
    const timeParts = item.time.split(' - ');
    if (timeParts.length < 2) return false;
    
    const startTime = timeParts[0];
    const endTime = timeParts[1] || '23:59';
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Get the icon for a stat
  const getStatIcon = (statName: string) => {
    switch(statName.toLowerCase()) {
      case 'academics':
        return <GraduationCap className="h-3 w-3 text-primary/70" />;
      case 'athletics':
        return <Dumbbell className="h-3 w-3 text-primary/70" />;
      case 'charm':
        return <Heart className="h-3 w-3 text-primary/70" />;
      case 'creativity':
        return <Palette className="h-3 w-3 text-primary/70" />;
      default:
        return <Star className="h-3 w-3 text-primary/70" />;
    }
  };

  // If we don't have valid game state, show a loading state
  if (!isValidGameState()) {
    return (
      <aside className="w-full lg:w-1/4 bg-black border-r border-primary/20 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-1/4 bg-black border-r border-primary/20 flex flex-col h-full overflow-hidden">
      {/* Player Info */}
      <div className="p-4 border-b border-primary/20">
        {/* Player Character */}
        <div className="mb-4">
          <h3 className="font-bold text-white">
            {gameState.playerCharacter.name || "Player"}
          </h3>
          <p className="text-sm text-white/60">
            Year {gameState.playerCharacter.year || 1} Student
          </p>
        </div>
        
        {/* Status Bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/60">Health</span>
              <span className="text-white">{gameState.playerCharacter.status?.health || 100}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill" 
                style={{width: `${gameState.playerCharacter.status?.health || 100}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/60">Energy</span>
              <span className="text-white">{gameState.playerCharacter.status?.energy || 100}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill" 
                style={{width: `${gameState.playerCharacter.status?.energy || 100}%`}}
              ></div>
            </div>
          </div>
          
          <div className="text-white text-sm">
            <ShoppingBag className="h-4 w-4 inline mr-1.5" />
            ¥{gameState.playerCharacter.status?.money || 0}
          </div>
        </div>
        
        {/* Player Stats */}
        {gameState.playerCharacter.stats && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-white/60">Academics</span>
                <span className="text-white">{gameState.playerCharacter.stats.academics}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill" 
                  style={{width: `${gameState.playerCharacter.stats.academics}%`}}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-white/60">Athletics</span>
                <span className="text-white">{gameState.playerCharacter.stats.athletics}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill" 
                  style={{width: `${gameState.playerCharacter.stats.athletics}%`}}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-white/60">Charm</span>
                <span className="text-white">{gameState.playerCharacter.stats.charm}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill" 
                  style={{width: `${gameState.playerCharacter.stats.charm}%`}}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-white/60">Creativity</span>
                <span className="text-white">{gameState.playerCharacter.stats.creativity}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill" 
                  style={{width: `${gameState.playerCharacter.stats.creativity}%`}}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Date & Time */}
      {gameState.currentScene && (
        <div className="p-4 border-b border-primary/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white text-sm">Current Time</h3>
            <span className="text-white font-medium">
              {gameState.currentScene.time || "08:00"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">
                {getCurrentDayOfWeek().en}
              </p>
              <p className="text-white text-sm">
                {gameState.currentScene.date || "2025-04-10"}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-white/60 text-sm">
                Day {gameState.currentScene.day || 1}
              </p>
              <p className="text-white text-sm">
                {getCurrentActivity()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Schedule */}
      <div className="p-4 overflow-hidden flex-grow border-b border-primary/20">
        <h3 className="text-white mb-3">Today's Schedule</h3>
        
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-2">
            {gameState.playerCharacter.scheduleToday && gameState.playerCharacter.scheduleToday.length > 0 ? (
              gameState.playerCharacter.scheduleToday.map((period, index) => (
                <div 
                  key={index}
                  className={`flex justify-between items-center p-2 border-l-2 ${
                    isActiveScheduleItem(period) ? 'border-l-primary bg-primary/5' : 'border-l-transparent'
                  } text-sm`}
                >
                  <div>
                    <p className="text-white">{period.activity}</p>
                    <p className="text-white/60 text-xs">{period.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-sm p-2">
                No scheduled activities
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-primary/20">
        <button 
          onClick={() => onViewCharacter('characters')}
          className="w-full p-2 text-white text-sm hover:bg-primary/10 transition border border-primary/20 mb-2"
        >
          <Users className="h-4 w-4 inline mr-2" /> 
          Characters
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2 text-white text-sm hover:bg-primary/10 transition border border-primary/20">
            <Book className="h-4 w-4 inline mr-1" /> Journal
          </button>
          
          <button className="p-2 text-white text-sm hover:bg-primary/10 transition border border-primary/20">
            <MapPin className="h-4 w-4 inline mr-1" /> Map
          </button>
        </div>
      </div>
    </aside>
  );
}
