import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    bgmVolume: 70,
    sfxVolume: 80,
    autoAdvance: false,
    showCharacterLabels: true,
    textSpeed: "normal"
  });
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleTextSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      textSpeed: e.target.value
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      await apiRequest("POST", "/api/game/settings", settings);
      toast({
        title: "Settings Saved",
        description: "Your game settings have been updated."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleResetDefaults = () => {
    setSettings({
      bgmVolume: 70,
      sfxVolume: 80,
      autoAdvance: false,
      showCharacterLabels: true,
      textSpeed: "normal"
    });
    toast({
      title: "Settings Reset",
      description: "Game settings have been reset to defaults."
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center">
      <div className="bg-neutral-dark border border-primary-500 rounded-xl w-full max-w-md overflow-hidden">
        <div className="p-4 bg-primary-600 flex justify-between items-center">
          <h2 className="text-white font-heading font-bold text-xl">Game Settings</h2>
          <button className="text-white hover:text-gray-300" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-heading font-medium text-white mb-3">Audio Settings</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="bgmVolume" className="text-gray-300">BGM Volume</Label>
                  <span className="text-white">{settings.bgmVolume}%</span>
                </div>
                <input
                  id="bgmVolume"
                  name="bgmVolume"
                  type="range"
                  min="0"
                  max="100"
                  value={settings.bgmVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="sfxVolume" className="text-gray-300">SFX Volume</Label>
                  <span className="text-white">{settings.sfxVolume}%</span>
                </div>
                <input
                  id="sfxVolume"
                  name="sfxVolume"
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-heading font-medium text-white mb-3">Display Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoAdvance" className="text-gray-300">Auto-Advance Text</Label>
                <Switch
                  id="autoAdvance"
                  checked={settings.autoAdvance}
                  onCheckedChange={(checked) => handleSwitchChange("autoAdvance", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showCharacterLabels" className="text-gray-300">Show Character Name Labels</Label>
                <Switch
                  id="showCharacterLabels"
                  checked={settings.showCharacterLabels}
                  onCheckedChange={(checked) => handleSwitchChange("showCharacterLabels", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="textSpeed" className="text-gray-300">Text Speed</Label>
                <select
                  id="textSpeed"
                  value={settings.textSpeed}
                  onChange={handleTextSpeedChange}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                  <option value="instant">Instant</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600"
            >
              Reset to Default
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
