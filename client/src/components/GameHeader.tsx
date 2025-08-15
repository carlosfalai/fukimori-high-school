import { useState } from "react";
import { useLocation } from "wouter";
import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, Settings, Menu, User, BookOpen, ShoppingCart, LogOut, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GameHeaderProps {
  gameState: Game;
  onOpenSettings: () => void;
  onOpenPurchase: () => void;
}

export default function GameHeader({ gameState, onOpenSettings, onOpenPurchase }: GameHeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveGame = async () => {
    setIsSaving(true);
    try {
      const response = await apiRequest("POST", "/api/game/save", { gameId: gameState.id });
      if (response.ok) {
        toast({
          title: "保存完了", // "Game Saved" in Japanese
          description: "ゲームの進行状況が保存されました。", // "Your progress has been saved"
        });
      }
    } catch (error) {
      toast({
        title: "保存失敗", // "Save Failed" in Japanese
        description: "ゲームを保存できませんでした。もう一度お試しください。", // "Failed to save your game. Please try again."
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setLocation("/");
      toast({
        title: "ログアウト", // "Logged Out" in Japanese
        description: "ログアウトしました。", // "You have been logged out"
      });
    } catch (error) {
      toast({
        title: "ログアウト失敗", // "Logout Failed" in Japanese
        description: "ログアウトできませんでした。もう一度お試しください。", // "Failed to log out. Please try again."
        variant: "destructive"
      });
    }
  };
  
  return (
    <header className="bg-black border-b border-primary/20 py-2 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-white font-bold">
          Fukimori High
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Pages Counter */}
        <div className="text-sm text-white/80 mr-2">
          {gameState.currentPage}/{gameState.totalPages} pages
        </div>
        
        {/* Save Button */}
        <button 
          onClick={handleSaveGame} 
          disabled={isSaving}
          className="text-white"
        >
          {isSaving ? (
            <div className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
        </button>
        
        {/* Settings Button */}
        <button 
          onClick={onOpenSettings}
          className="text-white"
        >
          <Settings className="h-4 w-4" />
        </button>
        
        {/* Game Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-white">
              <Menu className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black border border-primary/20 text-white">
            <DropdownMenuLabel>Game Menu</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            
            <DropdownMenuItem onClick={onOpenPurchase} className="cursor-pointer">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span>Buy Pages</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setLocation("/")} className="cursor-pointer">
              <Home className="h-4 w-4 mr-2" />
              <span>Main Menu</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-primary/20" />
            
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
