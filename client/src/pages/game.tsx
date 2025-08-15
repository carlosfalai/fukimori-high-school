import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGameState } from "@/lib/useGameState";
import GameHeader from "@/components/GameHeader";
import GameSidebar from "@/components/GameSidebar";
import GameMainView from "@/components/GameMainView";
import CharacterInfoModal from "@/components/CharacterInfoModal";
import PurchaseModal from "@/components/PurchaseModal";
import SettingsModal from "@/components/SettingsModal";
import { FukimoriMusicPlayer } from "@/components/FukimoriMusicPlayer";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const [, setLocation] = useLocation();
  const { gameState, fetchGameState, createNewGameState, isLoading } = useGameState();
  const { toast } = useToast();
  
  // Modal states
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [creatingGame, setCreatingGame] = useState(false);
  
  // Auth check - fetch user
  const { data: user, isLoading: isUserLoading, error: userError } = useQuery({ 
    queryKey: ['/api/auth/me'] 
  });
  
  useEffect(() => {
    if (userError) {
      toast({
        title: "Authentication Error",
        description: "Please login to play the game",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [userError, setLocation, toast]);
  
  useEffect(() => {
    const loadGame = async () => {
      // Only fetch game if we have a user and no game state yet
      if (user && !gameState && !isLoading && !creatingGame) {
        try {
          // Make sure we're safely accessing properties on user which could be undefined
          const userName = typeof user === 'object' && user !== null && 'username' in user
            ? user.username
            : "unknown";
            
          console.log("Loading game for user:", userName);
          await fetchGameState();
        } catch (error) {
          console.error("Failed to load game:", error);
          toast({
            title: "Game Load Error",
            description: "Failed to load your game state. Creating a new game for you.",
            variant: "destructive",
          });
          
          // If game loading fails, try to create a new game
          try {
            setCreatingGame(true);
            await createNewGameState("Player");
          } catch (createError) {
            console.error("Failed to create new game:", createError);
            toast({
              title: "Game Creation Error",
              description: "Unable to create a new game. Please try again later.",
              variant: "destructive",
            });
          } finally {
            setCreatingGame(false);
          }
        }
      }
    };
    
    loadGame();
  }, [user, gameState, isLoading, creatingGame, fetchGameState, createNewGameState, toast]);
  
  const handleViewCharacter = (characterId: string) => {
    setSelectedCharacter(characterId);
    setShowCharacterModal(true);
  };
  
  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };
  
  const handleOpenPurchase = () => {
    setShowPurchaseModal(true);
  };
  
  const handleCreateNewGame = async () => {
    try {
      setCreatingGame(true);
      await createNewGameState("Player");
      toast({
        title: "Game Created",
        description: "New game has been created successfully!",
      });
    } catch (error) {
      console.error("Failed to create new game:", error);
      toast({
        title: "Error",
        description: "Failed to create a new game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingGame(false);
    }
  };
  
  if (isUserLoading || isLoading || creatingGame) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-heading font-bold text-white">
            {creatingGame ? "Creating Your New Game..." : "Loading Fukimori High..."}
          </h2>
        </div>
      </div>
    );
  }
  
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-dark">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Game Not Found</h2>
          <p className="text-neutral-light mb-6">
            We couldn't find a game for your account. Would you like to start a new game at Fukimori High?
          </p>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleCreateNewGame}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              Start New Game
            </button>
            <button 
              onClick={() => setLocation("/")}
              className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen h-screen bg-neutral-dark">
      <GameHeader 
        gameState={gameState}
        onOpenSettings={handleOpenSettings}
        onOpenPurchase={handleOpenPurchase}
      />
      
      <div className="game-container flex flex-col lg:flex-row flex-grow">
        <GameSidebar 
          gameState={gameState}
          onViewCharacter={handleViewCharacter}
        />
        
        <GameMainView 
          gameState={gameState}
          onViewCharacter={handleViewCharacter}
          onNeedMorePages={() => setShowPurchaseModal(true)}
        />
      </div>
      
      {/* Modals */}
      {showCharacterModal && selectedCharacter && (
        <CharacterInfoModal
          characterId={selectedCharacter}
          onClose={() => setShowCharacterModal(false)}
        />
      )}
      
      {showPurchaseModal && (
        <PurchaseModal
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
      
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}
      
      {/* Fukimori High Music Player */}
      <FukimoriMusicPlayer
        currentLocation={gameState?.currentScene?.location || 'entrance'}
        mood="neutral"
        timeOfDay={gameState?.currentScene?.time ? 
          (parseInt(gameState.currentScene.time.split(':')[0]) < 12 ? 'morning' : 
           parseInt(gameState.currentScene.time.split(':')[0]) < 18 ? 'afternoon' : 'evening') : 'day'}
        charactersPresent={gameState?.currentScene?.characters || []}
      />
    </div>
  );
}
