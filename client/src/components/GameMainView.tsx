import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useGameState } from "@/lib/useGameState";
import { ChevronRight, Rewind, History, Settings, Volume2 } from "lucide-react";

interface DialogueChoice {
  id: number;
  text: string;
}

interface GameMainViewProps {
  gameState: Game;
  onViewCharacter: (characterId: string) => void;
  onNeedMorePages: () => void;
}

// Japanese school locations with anime-style backgrounds
const BACKGROUNDS = {
  'entrance': 'https://i.imgur.com/w77Tsbk.jpg', // School entrance
  'classroom': 'https://i.imgur.com/1nOgYtz.jpg', // Classroom
  'cafeteria': 'https://i.imgur.com/9rrr9AD.jpg', // Cafeteria
  'gym': 'https://i.imgur.com/mMU3OQZ.jpg', // Gym
  'library': 'https://i.imgur.com/jVR52ly.jpg', // Library
  'rooftop': 'https://i.imgur.com/3mw7NN2.jpg', // Rooftop
  'courtyard': 'https://i.imgur.com/uUW3qN4.jpg', // Courtyard
  'hallway': 'https://i.imgur.com/AYBtBsf.jpg', // School hallway
};

export default function GameMainView({ gameState, onViewCharacter, onNeedMorePages }: GameMainViewProps) {
  const { toast } = useToast();
  const { updateGameState } = useGameState();
  const [isLoading, setIsLoading] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContinueIndicator, setShowContinueIndicator] = useState(false);
  
  // Dialogue choices (in a real implementation, these would come from the API)
  const [dialogueChoices, setDialogueChoices] = useState<DialogueChoice[]>([]);
  
  // Check if we have a valid game state with all required properties
  const isValidGameState = (): boolean => {
    return !!(
      gameState && 
      gameState.currentScene && 
      gameState.currentScene.dialogue
    );
  };
  
  // Get the current dialogue if any
  const getCurrentDialogue = () => {
    if (!isValidGameState() || !gameState.currentScene.dialogue) {
      return null;
    }
    
    return gameState.currentScene.dialogue.length > 0 
      ? gameState.currentScene.dialogue[gameState.currentScene.dialogue.length - 1] 
      : null;
  };
  
  // Get the current dialogue
  const currentDialogue = getCurrentDialogue();
  
  // Get the current character's name if any
  const currentCharacterName = currentDialogue?.character || "";
  
  // Typewriter effect for dialogue text
  useEffect(() => {
    if (!currentDialogue) {
      setTypewriterText("");
      return;
    }

    const text = currentDialogue.text || "Welcome to Fukimori High School...";
    setIsTyping(true);
    setShowContinueIndicator(false);
    setTypewriterText("");
    
    let i = 0;
    const speed = 30; // typing speed in ms
    
    const typeWriter = () => {
      if (i < text.length) {
        setTypewriterText(prev => prev + text.charAt(i));
        i++;
        setTimeout(typeWriter, speed);
      } else {
        setIsTyping(false);
        setShowContinueIndicator(true);
      }
    };
    
    typeWriter();
    
    return () => {
      // Cleanup on component unmount or dialogue change
      setIsTyping(false);
    };
  }, [currentDialogue]);
  
  // Background image based on location
  const getBackgroundImage = (): string => {
    if (!gameState || !gameState.currentScene || !gameState.currentScene.location) {
      return BACKGROUNDS['classroom'];
    }
    
    return BACKGROUNDS[gameState.currentScene.location as keyof typeof BACKGROUNDS] || BACKGROUNDS['classroom'];
  };
  
  // Get character image URL from the character name
  const getCharacterImage = (characterName: string): string => {
    // Simple mapping for the demo
    switch(characterName.toLowerCase()) {
      case 'aiko':
      case 'aiko tanaka':
        return 'https://i.imgur.com/5VwSnoZ.png';
      case 'takashi':
      case 'takashi sato':
        return 'https://i.imgur.com/6XGZkn7.png';
      case 'yumi':
      case 'yumi kimura':
        return 'https://i.imgur.com/YFi37nw.png';
      case 'sensei':
      case 'mr. tanaka':
        return 'https://i.imgur.com/RZRQDqt.png';
      default:
        return 'https://i.imgur.com/YFi37nw.png';
    }
  };
  
  const nextPageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/game/next-page", {
        gameId: gameState.id
      });
      return response.json();
    },
    onSuccess: (data) => {
      updateGameState(data.game);
      setDialogueChoices(data.dialogueChoices || []);
    },
    onError: (error) => {
      toast({
        title: "エラー", // "Error" in Japanese
        description: "進めることができませんでした。もう一度お試しください。", // "Failed to advance. Please try again"
        variant: "destructive"
      });
    }
  });
  
  const selectChoiceMutation = useMutation({
    mutationFn: async (choiceIndex: number) => {
      const response = await apiRequest("POST", "/api/game/select-choice", {
        gameId: gameState.id,
        choiceIndex
      });
      return response.json();
    },
    onSuccess: (data) => {
      updateGameState(data.game);
      setDialogueChoices(data.dialogueChoices || []);
    },
    onError: (error) => {
      toast({
        title: "選択エラー", // "Selection Error" in Japanese
        description: "選択を処理できませんでした。もう一度お試しください。", // "Could not process selection. Please try again"
        variant: "destructive"
      });
    }
  });
  
  const handleNextPage = async () => {
    // If we're still typing, show the full text immediately
    if (isTyping && currentDialogue) {
      setTypewriterText(currentDialogue.text || "");
      setIsTyping(false);
      setShowContinueIndicator(true);
      return;
    }
    
    if (gameState.currentPage >= gameState.totalPages) {
      onNeedMorePages();
      return;
    }
    
    nextPageMutation.mutate();
  };
  
  const handleSelectChoice = (choiceIndex: number) => {
    selectChoiceMutation.mutate(choiceIndex);
  };
  
  // If we don't have a valid game state, show a loading state
  if (!isValidGameState()) {
    return (
      <main className="w-full lg:w-3/4 h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-black">
        <div className="text-center p-6">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            <span className="text-primary">福</span>
            <span className="text-primary">森</span>
            高校
          </h2>
          <p className="text-neutral-light">物語を読み込んでいます...</p>
          <p className="text-neutral-light text-sm mt-1">Loading your story...</p>
        </div>
      </main>
    );
  }

  // Time of day to affect lighting
  const getTimeOfDayOverlay = (): string => {
    const time = gameState.currentScene?.time || "afternoon";
    
    switch(time) {
      case "morning":
        return "bg-blue-500/10"; // Light blue morning glow
      case "afternoon":
        return ""; // No overlay for afternoon
      case "evening":
        return "bg-orange-500/20"; // Orange sunset glow
      case "night":
        return "bg-indigo-900/40"; // Dark blue night overlay
      default:
        return "";
    }
  };

  return (
    <main className="w-full lg:w-3/4 h-full flex flex-col relative overflow-hidden bg-black">
      {/* Game Scene View */}
      <div className="flex-grow relative overflow-hidden">
        {/* Background Scene */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
        ></div>
        
        {/* Date/Time/Location Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center bg-black text-white px-4 py-2 text-sm z-10">
          <div className="text-left">{gameState.currentScene?.date || "2025-04-10"}</div>
          <div className="text-right">
            {gameState.currentScene?.time || "08:00"}
            <span className="ml-2">•</span>
            <span className="ml-2">Day {gameState.currentScene?.day || 1}</span>
          </div>
        </div>
        
        {/* Character in the scene */}
        {currentCharacterName && (
          <div className="absolute bottom-[180px] left-1/2 transform -translate-x-1/2 z-10">
            <img 
              src={getCharacterImage(currentCharacterName)} 
              alt={currentCharacterName} 
              className="max-h-[500px]"
            />
          </div>
        )}
        
        {/* Character Name Tab */}
        {currentCharacterName && (
          <div className="absolute bottom-[180px] left-8 z-20 bg-primary px-4 py-1 rounded-t">
            <span className="text-white">{currentCharacterName}</span>
          </div>
        )}
        
        {/* Simple Dialogue Box */}
        <div className="absolute bottom-0 left-0 right-0 bg-black border-t-2 border-primary p-5 min-h-[180px] z-20">
          <p className="text-white text-lg">
            {typewriterText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          
          {/* Dialogue Choices */}
          {dialogueChoices.length > 0 && (
            <div className="mt-6 space-y-2">
              {dialogueChoices.map((choice, index) => (
                <button 
                  key={choice.id}
                  className="block w-full text-left text-white bg-primary/10 hover:bg-primary/20 p-2 rounded"
                  onClick={() => handleSelectChoice(index)}
                  disabled={selectChoiceMutation.isPending}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
          
          {/* Continue Indicator */}
          {showContinueIndicator && !dialogueChoices.length && (
            <div className="absolute bottom-4 right-4 text-primary animate-bounce">
              ▶
            </div>
          )}
        </div>
      </div>
      
      {/* Game Navigation Bar */}
      <div className="bg-black border-t border-primary/20 py-2 px-4 flex justify-between items-center">
        <div className="flex items-center text-white/80">
          <button className="text-white mr-4">
            <Settings className="h-5 w-5" />
          </button>
          <div className="text-sm">
            {gameState.currentPage} / {gameState.totalPages}
          </div>
        </div>
        
        <button 
          onClick={handleNextPage}
          disabled={nextPageMutation.isPending}
          className="bg-primary px-4 py-1 rounded text-white"
        >
          {nextPageMutation.isPending ? "..." : "▶"}
        </button>
      </div>
    </main>
  );
}
