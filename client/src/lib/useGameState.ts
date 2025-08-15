import React, { createContext, useState, useContext, ReactNode } from "react";
import { Game } from "@shared/schema";

// Define the structure of our context
interface GameStateContextType {
  gameState: Game | null;
  isLoading: boolean;
  fetchGameState: () => Promise<void>;
  updateGameState: (newState: Game) => void;
  resetGame: () => Promise<void>;
  createNewGameState: (playerName: string) => Promise<void>;
}

// Create a default context value
const defaultContextValue: GameStateContextType = {
  gameState: null,
  isLoading: false,
  fetchGameState: async () => {},
  updateGameState: () => {},
  resetGame: async () => {},
  createNewGameState: async () => {}
};

// Create the context
const GameStateContext = createContext<GameStateContextType>(defaultContextValue);

// Provider component
export function GameStateProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch the current game state from the server
  const fetchGameState = async () => {
    try {
      // Don't fetch if we're already loading or if we have a game
      if (isLoading || gameState) {
        console.log('Already loading or game state exists, skipping fetch');
        return gameState;
      }
      
      console.log('Fetching game state...');
      setIsLoading(true);
      
      // First try to get the current game
      const response = await fetch('/api/game/current', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Game state fetched successfully');
        setGameState(data.game);
        return data.game;
      }
      
      // If the user doesn't have a game yet, we'll create one
      if (response.status === 404) {
        console.log('Game not found, creating default game');
        return await createDefaultGame();
      } else {
        console.error('Error fetching game state:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a default game if the user doesn't have one
  const createDefaultGame = async () => {
    try {
      console.log('Creating default game...');
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          playerName: 'Player',
          gender: 'male'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Default game created successfully');
        setGameState(data.game);
        return data.game;
      } else {
        console.error('Error creating default game:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error creating default game:', error);
      return null;
    }
  };
  
  // Update the game state locally
  const updateGameState = (newState: Game) => {
    setGameState(newState);
  };
  
  // Reset the game on the server
  const resetGame = async () => {
    try {
      setIsLoading(true);
      console.log('Resetting game...');
      
      const response = await fetch('/api/game/reset', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Game reset successfully');
        setGameState(data.game);
        return data.game;
      } else {
        console.error('Error resetting game:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error resetting game:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new game with custom player settings
  const createNewGameState = async (playerName: string) => {
    try {
      setIsLoading(true);
      console.log('Creating new game with player name:', playerName);
      
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          playerName,
          gender: 'male' // Default, could be made configurable
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('New game created successfully');
        setGameState(data.game);
        return data.game;
      } else {
        console.error('Error creating new game:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error creating new game:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return React.createElement(
    GameStateContext.Provider,
    { value: {
        gameState,
        isLoading,
        fetchGameState,
        updateGameState,
        resetGame,
        createNewGameState
      }
    },
    children
  );
}

// Custom hook to use the context
export function useGameState() {
  return useContext(GameStateContext);
}