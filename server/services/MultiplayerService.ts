import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { DeepSeekService } from './DeepSeekService';
import { AchievementSystem } from './AchievementSystem';

export interface OnlinePlayer {
  id: string;
  username: string;
  characterName: string;
  currentLocation: string;
  reputation: {
    popularity: number;
    respect: number;
    fear: number;
    attractiveness: number;
    currentTitle: string;
  };
  isActive: boolean;
  lastSeen: Date;
  websocket?: WebSocket;
}

export interface PlayerInteraction {
  id: string;
  fromPlayer: string;
  toPlayer: string;
  interactionType: 'chat' | 'challenge' | 'help' | 'compete' | 'trade' | 'prank';
  message: string;
  location: string;
  timestamp: Date;
  consequences?: {
    reputationChange: number;
    relationshipChange: number;
    achievementTriggered?: string;
  };
}

export interface MultiplayerEvent {
  type: 'player_joined' | 'player_left' | 'location_change' | 'interaction' | 'achievement_unlocked' | 'reputation_change';
  playerId: string;
  data: any;
  timestamp: Date;
}

export class MultiplayerService {
  private wss: WebSocketServer;
  private onlinePlayers: Map<string, OnlinePlayer> = new Map();
  private recentInteractions: PlayerInteraction[] = [];
  private deepSeekService: DeepSeekService;
  private achievementSystem: AchievementSystem;
  
  // School locations where players can meet
  private schoolLocations = [
    'classroom_1a', 'classroom_1b', 'classroom_2a', 'classroom_2b',
    'courtyard', 'library', 'cafeteria', 'gymnasium', 'rooftop',
    'student_council_room', 'music_room', 'art_room', 'science_lab',
    'teachers_lounge', 'principal_office', 'hallway_1f', 'hallway_2f',
    'bathroom', 'storage_room', 'club_rooms'
  ];

  constructor(server: Server, deepSeekService: DeepSeekService) {
    this.deepSeekService = deepSeekService;
    this.achievementSystem = new AchievementSystem();
    
    // Create WebSocket server
    this.wss = new WebSocketServer({ 
      server,
      path: '/multiplayer'
    });

    this.setupWebSocketHandlers();
    this.startCleanupInterval();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New multiplayer connection established');

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handlePlayerMessage(ws, message);
        } catch (error) {
          console.error('Error parsing multiplayer message:', error);
        }
      });

      ws.on('close', () => {
        this.handlePlayerDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handlePlayerMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'join_game':
        this.handlePlayerJoin(ws, message.data);
        break;
      case 'change_location':
        this.handleLocationChange(message.playerId, message.data.location);
        break;
      case 'player_interaction':
        this.handlePlayerInteraction(message.data);
        break;
      case 'get_nearby_players':
        this.sendNearbyPlayers(ws, message.data.location);
        break;
      case 'send_chat':
        this.handleChatMessage(message.data);
        break;
      default:
        console.log('Unknown multiplayer message type:', message.type);
    }
  }

  private handlePlayerJoin(ws: WebSocket, playerData: {
    playerId: string;
    username: string;
    characterName: string;
    location: string;
  }) {
    const player: OnlinePlayer = {
      id: playerData.playerId,
      username: playerData.username,
      characterName: playerData.characterName,
      currentLocation: playerData.location,
      reputation: {
        popularity: 50,
        respect: 50,
        fear: 0,
        attractiveness: 50,
        currentTitle: "New Student"
      },
      isActive: true,
      lastSeen: new Date(),
      websocket: ws
    };

    this.onlinePlayers.set(playerData.playerId, player);
    
    // Notify other players in the same location
    this.broadcastToLocation(playerData.location, {
      type: 'player_joined',
      playerId: playerData.playerId,
      data: {
        characterName: playerData.characterName,
        reputation: player.reputation
      },
      timestamp: new Date()
    }, playerData.playerId);

    // Send welcome message to new player
    this.sendToPlayer(playerData.playerId, {
      type: 'join_success',
      data: {
        playersInLocation: this.getPlayersInLocation(playerData.location),
        locationInfo: this.getLocationInfo(playerData.location)
      }
    });

    console.log(`Player ${playerData.characterName} joined the game at ${playerData.location}`);
  }

  private handleLocationChange(playerId: string, newLocation: string) {
    const player = this.onlinePlayers.get(playerId);
    if (!player) return;

    const oldLocation = player.currentLocation;
    player.currentLocation = newLocation;
    player.lastSeen = new Date();

    // Notify players in old location that player left
    this.broadcastToLocation(oldLocation, {
      type: 'player_left',
      playerId,
      data: { characterName: player.characterName },
      timestamp: new Date()
    }, playerId);

    // Notify players in new location that player arrived
    this.broadcastToLocation(newLocation, {
      type: 'player_joined',
      playerId,
      data: { 
        characterName: player.characterName,
        reputation: player.reputation 
      },
      timestamp: new Date()
    }, playerId);

    // Send updated location info to the moving player
    this.sendToPlayer(playerId, {
      type: 'location_changed',
      data: {
        newLocation,
        playersInLocation: this.getPlayersInLocation(newLocation),
        locationInfo: this.getLocationInfo(newLocation)
      }
    });
  }

  private handlePlayerInteraction(interactionData: {
    fromPlayer: string;
    toPlayer: string;
    interactionType: PlayerInteraction['interactionType'];
    message: string;
    location: string;
  }) {
    const fromPlayer = this.onlinePlayers.get(interactionData.fromPlayer);
    const toPlayer = this.onlinePlayers.get(interactionData.toPlayer);
    
    if (!fromPlayer || !toPlayer) return;

    // Create interaction record
    const interaction: PlayerInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromPlayer: interactionData.fromPlayer,
      toPlayer: interactionData.toPlayer,
      interactionType: interactionData.interactionType,
      message: interactionData.message,
      location: interactionData.location,
      timestamp: new Date()
    };

    // Generate AI response and consequences
    this.processInteractionConsequences(interaction, fromPlayer, toPlayer);

    // Store interaction
    this.recentInteractions.push(interaction);
    if (this.recentInteractions.length > 100) {
      this.recentInteractions = this.recentInteractions.slice(-50);
    }

    // Notify both players and nearby observers
    this.broadcastToLocation(interactionData.location, {
      type: 'interaction',
      playerId: interactionData.fromPlayer,
      data: {
        interaction,
        fromCharacter: fromPlayer.characterName,
        toCharacter: toPlayer.characterName
      },
      timestamp: new Date()
    });
  }

  private processInteractionConsequences(
    interaction: PlayerInteraction, 
    fromPlayer: OnlinePlayer, 
    toPlayer: OnlinePlayer
  ) {
    // Use AI to determine realistic consequences
    const prompt = `Two male students at a Japanese high school are interacting:
    ${fromPlayer.characterName} (popularity: ${fromPlayer.reputation.popularity}, respect: ${fromPlayer.reputation.respect}) 
    is ${interaction.interactionType}ing ${toPlayer.characterName} (popularity: ${toPlayer.reputation.popularity}, respect: ${toPlayer.reputation.respect})
    
    Message: "${interaction.message}"
    Location: ${interaction.location}
    
    Determine realistic consequences:
    1. How does this affect both players' reputations?
    2. What do nearby students think?
    3. Could this trigger any achievements?
    
    Respond with reputation changes and social consequences.`;

    // For now, use simple logic (can be enhanced with AI later)
    const consequences = this.calculateSimpleConsequences(interaction, fromPlayer, toPlayer);
    interaction.consequences = consequences;

    // Apply reputation changes
    if (consequences.reputationChange) {
      fromPlayer.reputation.popularity += consequences.reputationChange;
      fromPlayer.reputation.popularity = Math.max(0, Math.min(100, fromPlayer.reputation.popularity));
    }

    // Check for achievements
    if (consequences.achievementTriggered) {
      const achievement = this.achievementSystem.triggerAchievement(consequences.achievementTriggered);
      if (achievement) {
        this.sendToPlayer(fromPlayer.id, {
          type: 'achievement_unlocked',
          data: achievement
        });
      }
    }
  }

  private calculateSimpleConsequences(
    interaction: PlayerInteraction,
    fromPlayer: OnlinePlayer,
    toPlayer: OnlinePlayer
  ) {
    let reputationChange = 0;
    let relationshipChange = 0;
    let achievementTriggered = undefined;

    switch (interaction.interactionType) {
      case 'help':
        reputationChange = 2;
        relationshipChange = 5;
        break;
      case 'challenge':
        reputationChange = fromPlayer.reputation.respect > toPlayer.reputation.respect ? 3 : -2;
        relationshipChange = -3;
        break;
      case 'prank':
        reputationChange = interaction.location === 'classroom_1a' ? -5 : 1; // Teachers see = bad
        relationshipChange = -2;
        if (fromPlayer.reputation.popularity > 80) {
          achievementTriggered = 'prank_master';
        }
        break;
      case 'compete':
        reputationChange = Math.random() > 0.5 ? 3 : -1;
        relationshipChange = 1;
        break;
      case 'trade':
        reputationChange = 1;
        relationshipChange = 2;
        break;
      case 'chat':
        reputationChange = 0;
        relationshipChange = 1;
        break;
    }

    return { reputationChange, relationshipChange, achievementTriggered };
  }

  private handleChatMessage(chatData: {
    fromPlayer: string;
    message: string;
    location: string;
    isPrivate?: boolean;
    targetPlayer?: string;
  }) {
    const fromPlayer = this.onlinePlayers.get(chatData.fromPlayer);
    if (!fromPlayer) return;

    const chatMessage = {
      type: 'chat_message',
      playerId: chatData.fromPlayer,
      data: {
        characterName: fromPlayer.characterName,
        message: chatData.message,
        isPrivate: chatData.isPrivate || false,
        timestamp: new Date()
      },
      timestamp: new Date()
    };

    if (chatData.isPrivate && chatData.targetPlayer) {
      // Private message
      this.sendToPlayer(chatData.targetPlayer, chatMessage);
      this.sendToPlayer(chatData.fromPlayer, { ...chatMessage, data: { ...chatMessage.data, isEcho: true } });
    } else {
      // Public message to location
      this.broadcastToLocation(chatData.location, chatMessage);
    }
  }

  private handlePlayerDisconnect(ws: WebSocket) {
    // Find player by websocket
    const disconnectedPlayer = Array.from(this.onlinePlayers.values())
      .find(player => player.websocket === ws);

    if (disconnectedPlayer) {
      disconnectedPlayer.isActive = false;
      disconnectedPlayer.websocket = undefined;

      // Notify other players in the same location
      this.broadcastToLocation(disconnectedPlayer.currentLocation, {
        type: 'player_left',
        playerId: disconnectedPlayer.id,
        data: { characterName: disconnectedPlayer.characterName },
        timestamp: new Date()
      }, disconnectedPlayer.id);

      console.log(`Player ${disconnectedPlayer.characterName} disconnected`);
    }
  }

  private getPlayersInLocation(location: string): OnlinePlayer[] {
    return Array.from(this.onlinePlayers.values())
      .filter(player => player.currentLocation === location && player.isActive);
  }

  private getLocationInfo(location: string) {
    const locationData: { [key: string]: any } = {
      'classroom_1a': { 
        name: 'First Year Class A', 
        description: 'Your homeroom classroom',
        allowedActions: ['study', 'chat', 'help', 'compete'],
        teacherPresent: Math.random() > 0.7
      },
      'courtyard': { 
        name: 'School Courtyard', 
        description: 'Open area perfect for socializing',
        allowedActions: ['chat', 'challenge', 'compete', 'prank'],
        teacherPresent: false
      },
      'rooftop': { 
        name: 'School Rooftop', 
        description: 'Secret meeting spot (if you can access it)',
        allowedActions: ['chat', 'challenge', 'trade'],
        teacherPresent: false,
        special: 'Requires achievement to access'
      }
    };

    return locationData[location] || { 
      name: location, 
      description: 'School location',
      allowedActions: ['chat'],
      teacherPresent: false
    };
  }

  private broadcastToLocation(location: string, event: MultiplayerEvent, excludePlayerId?: string) {
    const playersInLocation = this.getPlayersInLocation(location);
    
    playersInLocation.forEach(player => {
      if (player.id !== excludePlayerId && player.websocket) {
        player.websocket.send(JSON.stringify(event));
      }
    });
  }

  private sendToPlayer(playerId: string, data: any) {
    const player = this.onlinePlayers.get(playerId);
    if (player && player.websocket) {
      player.websocket.send(JSON.stringify(data));
    }
  }

  private sendNearbyPlayers(ws: WebSocket, location: string) {
    const playersInLocation = this.getPlayersInLocation(location);
    ws.send(JSON.stringify({
      type: 'nearby_players',
      data: {
        players: playersInLocation.map(p => ({
          id: p.id,
          characterName: p.characterName,
          reputation: p.reputation
        })),
        location: location
      }
    }));
  }

  // Cleanup inactive players every 5 minutes
  private startCleanupInterval() {
    setInterval(() => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      for (const [playerId, player] of this.onlinePlayers.entries()) {
        if (!player.isActive && player.lastSeen < fiveMinutesAgo) {
          this.onlinePlayers.delete(playerId);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Public methods for getting multiplayer status
  getOnlinePlayersCount(): number {
    return Array.from(this.onlinePlayers.values()).filter(p => p.isActive).length;
  }

  getLocationPopulation(): { [location: string]: number } {
    const locationCounts: { [location: string]: number } = {};
    
    Array.from(this.onlinePlayers.values())
      .filter(p => p.isActive)
      .forEach(player => {
        locationCounts[player.currentLocation] = (locationCounts[player.currentLocation] || 0) + 1;
      });

    return locationCounts;
  }

  getRecentInteractions(limit: number = 10): PlayerInteraction[] {
    return this.recentInteractions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}