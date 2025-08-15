import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
}

interface MusicPlayerProps {
  currentLocation?: string;
  mood?: string;
  timeOfDay?: string;
  charactersPresent?: string[];
  eventType?: string;
  className?: string;
}

export const FukimoriMusicPlayer: React.FC<MusicPlayerProps> = ({
  currentLocation = 'entrance',
  mood = 'neutral',
  timeOfDay = 'day',
  charactersPresent = [],
  eventType,
  className = ''
}) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch music when location or context changes
  useEffect(() => {
    fetchDynamicPlaylist();
  }, [currentLocation, mood, timeOfDay, eventType]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const fetchDynamicPlaylist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/music/dynamic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: currentLocation,
          mood,
          timeOfDay,
          charactersPresent,
          eventType
        }),
      });

      const data = await response.json();
      if (data.success && data.playlist.tracks.length > 0) {
        setTracks(data.playlist.tracks);
        setCurrentTrackIndex(0);
        setCurrentTime(0);
      }
    } catch (error) {
      console.error('Error fetching music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTrack = (): SpotifyTrack | null => {
    return tracks[currentTrackIndex] || null;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    const currentTrack = getCurrentTrack();
    
    if (!audio || !currentTrack || !currentTrack.preview_url) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // If this is a new track, load it first
      if (audio.src !== currentTrack.preview_url) {
        audio.src = currentTrack.preview_url;
      }
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    
    const nextTrack = tracks[nextIndex];
    if (audioRef.current && nextTrack.preview_url) {
      audioRef.current.src = nextTrack.preview_url;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const previousTrack = () => {
    if (tracks.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentTime(0);
    
    const prevTrack = tracks[prevIndex];
    if (audioRef.current && prevTrack.preview_url) {
      audioRef.current.src = prevTrack.preview_url;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLocationDisplayName = (location: string): string => {
    const locationNames: { [key: string]: string } = {
      'classroom_1a': 'Classroom 1-A',
      'cafeteria': 'Cafeteria',
      'library': 'Library',
      'courtyard': 'Courtyard',
      'rooftop': 'School Rooftop',
      'gymnasium': 'Gymnasium',
      'music_room': 'Music Room',
      'art_room': 'Art Room',
      'entrance': 'Main Entrance',
      'main_hallway': 'Main Hallway'
    };
    return locationNames[location] || location.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const currentTrack = getCurrentTrack();

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className="bg-purple-600/20 border-purple-400 text-purple-200 hover:bg-purple-600/30"
        >
          <Music className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-80 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-md border-purple-400/30 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-purple-200">
            <div className="font-medium">🎵 Fukimori High Radio</div>
            <div className="text-xs opacity-75">{getLocationDisplayName(currentLocation)}</div>
          </div>
          <Button
            onClick={() => setIsMinimized(true)}
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:text-purple-100 p-1"
          >
            ─
          </Button>
        </div>

        {/* Current Track Info */}
        {currentTrack && !isLoading ? (
          <div className="mb-4">
            <div className="text-sm font-medium text-white truncate">
              {currentTrack.name}
            </div>
            <div className="text-xs text-purple-300 truncate">
              {currentTrack.artists.join(', ')}
            </div>
            <div className="text-xs text-purple-400 mt-1">
              Mood: {mood} • {timeOfDay}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-sm text-purple-300">
              {isLoading ? 'Loading soundtrack...' : 'No music available'}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {currentTrack && (
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 30}
              step={1}
              className="w-full"
              onValueChange={(value) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = value[0];
                  setCurrentTime(value[0]);
                }
              }}
            />
            <div className="flex justify-between text-xs text-purple-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || 30)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={previousTrack}
              variant="ghost"
              size="sm"
              disabled={tracks.length === 0}
              className="text-purple-300 hover:text-purple-100"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              variant="ghost"
              size="sm"
              disabled={!currentTrack || !currentTrack.preview_url}
              className="text-purple-300 hover:text-purple-100"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={nextTrack}
              variant="ghost"
              size="sm"
              disabled={tracks.length === 0}
              className="text-purple-300 hover:text-purple-100"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-purple-300 hover:text-purple-100"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={5}
              className="w-16"
              onValueChange={(value) => {
                const newVolume = value[0] / 100;
                setVolume(newVolume);
                setIsMuted(newVolume === 0);
              }}
            />
          </div>
        </div>

        {/* Track Count */}
        {tracks.length > 0 && (
          <div className="text-xs text-purple-400 mt-2 text-center">
            Track {currentTrackIndex + 1} of {tracks.length}
          </div>
        )}

        {/* Open in Spotify */}
        {currentTrack && (
          <div className="mt-3 text-center">
            <a
              href={currentTrack.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 hover:text-green-300 underline"
            >
              Listen on Spotify
            </a>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </Card>
  );
};