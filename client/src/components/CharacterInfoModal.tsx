import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Character } from "@shared/schema";
import { X, ArrowLeft, UserRound, Heart, Ruler, Clock, BookOpen, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Anime-style character images - these will be used as fallbacks if no image is available
const CHARACTER_IMAGES = {
  'Aiko': 'https://i.imgur.com/5VwSnoZ.png', // Female student with blue hair
  'Takashi': 'https://i.imgur.com/6XGZkn7.png', // Male student with black hair
  'Yumi': 'https://i.imgur.com/YFi37nw.png', // Female student with brown hair
  'Sensei': 'https://i.imgur.com/RZRQDqt.png', // Male teacher
  'default_female': 'https://i.imgur.com/YFi37nw.png',
  'default_male': 'https://i.imgur.com/6XGZkn7.png'
};

interface CharacterInfoModalProps {
  characterId: string;
  onClose: () => void;
}

export default function CharacterInfoModal({ characterId, onClose }: CharacterInfoModalProps) {
  // For the characters list view
  const [isListView, setIsListView] = useState(characterId === 'characters');
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  
  // Fetch character data
  const { data: character, isLoading } = useQuery({
    queryKey: [isListView ? '/api/game/characters' : `/api/game/character/${selectedCharacterId || characterId}`],
    enabled: !isListView || !!selectedCharacterId
  });
  
  // Fetch all characters for list view
  const { data: charactersList } = useQuery({
    queryKey: ['/api/game/characters'],
    enabled: isListView
  });
  
  // Handle character selection from list
  const handleSelectCharacter = (id: number) => {
    setSelectedCharacterId(id);
    setIsListView(false);
  };
  
  // Handle back to list
  const handleBackToList = () => {
    setIsListView(true);
    setSelectedCharacterId(null);
  };

  // Get default character image
  const getCharacterImage = (char: Character): string => {
    if (char.imageUrl) return char.imageUrl;
    
    // Try to find a match by first name
    const firstName = char.name.split(' ')[0];
    if (CHARACTER_IMAGES[firstName as keyof typeof CHARACTER_IMAGES]) {
      return CHARACTER_IMAGES[firstName as keyof typeof CHARACTER_IMAGES];
    }
    
    // Default based on gender
    return char.gender.toLowerCase() === 'female' 
      ? CHARACTER_IMAGES.default_female 
      : CHARACTER_IMAGES.default_male;
  };

  // Relationship level description
  const getRelationshipLevel = (value: number): string => {
    if (value >= 90) return "親密 (Intimate)";
    if (value >= 75) return "最高の友達 (Best Friends)";
    if (value >= 60) return "親友 (Close Friends)";
    if (value >= 45) return "友達 (Friends)";
    if (value >= 30) return "知り合い (Acquaintances)";
    if (value >= 15) return "顔見知り (Familiar)";
    return "他人 (Strangers)";
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-primary rounded w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="p-2 bg-primary flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">
            {isListView ? "Characters" : "Character Profile"}
          </h2>
          <button 
            className="text-white hover:text-white/70"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {isListView ? (
          // Characters List View
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {charactersList && Array.isArray(charactersList) ? (
                charactersList.map((char: Character) => (
                  <div 
                    key={char.id}
                    className="flex items-center p-2 border border-primary/20 hover:border-primary cursor-pointer"
                    onClick={() => handleSelectCharacter(char.id)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mr-3">
                      <img 
                        src={getCharacterImage(char)} 
                        alt={char.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="text-white">{char.name}</h3>
                      <p className="text-xs text-white/70">{char.role || "Student"}</p>
                      <div className="mt-1 flex items-center">
                        <Progress 
                          value={char.relationships?.player || 0} 
                          className="h-1.5 bg-black/40 w-20" 
                          indicatorClassName="bg-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-white/60 col-span-2 text-center p-4">
                  <p>No characters found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Character Detail View
          <div className="relative">
            {isLoading ? (
              <div className="w-full flex items-center justify-center p-8">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : character ? (
              <div className="p-4 flex flex-col md:flex-row gap-4">
                {/* Character Image */}
                <div className="w-full md:w-1/3">
                  <img 
                    src={getCharacterImage(character)} 
                    alt={character.name} 
                    className="w-full object-cover" 
                  />
                  
                  {/* Relationship Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 text-sm">Relationship</span>
                      <span className="text-white text-sm">{character.relationships?.player || 0}/100</span>
                    </div>
                    <div className="stat-bar">
                      <div 
                        className="stat-bar-fill" 
                        style={{width: `${character.relationships?.player || 0}%`}}
                      ></div>
                    </div>
                    <p className="text-white/70 text-xs mt-1 text-center">
                      {getRelationshipLevel(character.relationships?.player || 0)}
                    </p>
                  </div>
                </div>
                
                {/* Character Details */}
                <div className="w-full md:w-2/3">
                  <h3 className="text-white text-xl mb-3">{character.name}</h3>
                  
                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white/60">Age</p>
                      <p className="text-white">{character.age}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Gender</p>
                      <p className="text-white">{character.gender}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Height</p>
                      <p className="text-white">{character.appearance?.height || 'Unknown'} cm</p>
                    </div>
                    <div>
                      <p className="text-white/60">Hair</p>
                      <p className="text-white">
                        {character.appearance?.hair ? `${character.appearance.hair.color} ${character.appearance.hair.style}` : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {character.personality && character.personality.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/60 mb-1">Personality</p>
                      <div className="flex flex-wrap gap-1">
                        {character.personality.map((trait, index) => (
                          <Badge key={index} className="bg-primary/20 text-white">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-white/60 mb-1">Background</p>
                    <ScrollArea className="max-h-28">
                      <p className="text-white text-sm">
                        {character.background || "No background information available."}
                      </p>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/60 w-full text-center p-6">
                <p>Character not found</p>
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="p-2 bg-black flex justify-between border-t border-primary/20">
          {!isListView && characterId !== 'characters' && (
            <button 
              onClick={handleBackToList}
              className="text-white text-sm flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </button>
          )}
          <div className="ml-auto">
            <button 
              onClick={onClose}
              className="bg-primary px-3 py-1 text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
