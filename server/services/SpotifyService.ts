import axios from 'axios';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
}

export interface MoodPlaylist {
  mood: string;
  location?: string;
  tracks: SpotifyTrack[];
  description: string;
}

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = '6ea4c2c4b8c540d2948cf432973f2076';
    this.clientSecret = 'd3e1c9d2d85b4355bfd638d80422f659';
  }

  /**
   * Get Spotify access token using client credentials
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  /**
   * Search for tracks by query
   */
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit,
          market: 'US'
        }
      });

      return response.data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => artist.name),
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms
      }));
    } catch (error) {
      console.error('Error searching Spotify tracks:', error);
      return [];
    }
  }

  /**
   * Get the perfect soundtrack for a location and mood
   */
  async getLocationSoundtrack(location: string, mood: string = 'neutral', timeOfDay: string = 'day'): Promise<MoodPlaylist> {
    const musicQueries = this.getMusicQueriesForLocation(location, mood, timeOfDay);
    const tracks: SpotifyTrack[] = [];

    // Search for multiple queries and combine results
    for (const query of musicQueries) {
      const searchResults = await this.searchTracks(query, 5);
      tracks.push(...searchResults);
    }

    // Remove duplicates and limit to 15 tracks
    const uniqueTracks = tracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    ).slice(0, 15);

    return {
      mood: mood,
      location: location,
      tracks: uniqueTracks,
      description: this.getPlaylistDescription(location, mood, timeOfDay)
    };
  }

  /**
   * Get music queries based on location, mood, and time
   */
  private getMusicQueriesForLocation(location: string, mood: string, timeOfDay: string): string[] {
    const baseQueries: { [key: string]: string[] } = {
      // School locations
      'classroom_1a': ['studying music', 'focus instrumental', 'lo-fi study beats'],
      'library': ['quiet ambient', 'peaceful piano', 'study atmosphere'],
      'cafeteria': ['upbeat pop', 'social gathering music', 'happy indie'],
      'gymnasium': ['energetic workout', 'pump up music', 'sports anthems'],
      'courtyard': ['peaceful nature', 'acoustic guitar', 'spring vibes'],
      'rooftop': ['emotional indie', 'sunset vibes', 'contemplative music'],
      'music_room': ['classical piano', 'beautiful melodies', 'instrumental music'],
      'art_room': ['creative inspiration', 'artistic ambient', 'indie creativity'],
      'science_lab': ['electronic ambient', 'futuristic sounds', 'concentration music'],
      'entrance': ['welcome music', 'morning energy', 'new beginnings'],
      'main_hallway': ['school life', 'youth energy', 'transition music'],
      'health_office': ['calming music', 'healing vibes', 'peaceful ambient'],
      'faculty_room': ['professional ambient', 'work music', 'background instrumental'],
      'principal_office': ['serious classical', 'formal atmosphere', 'traditional music'],

      // Mood-based additions
      'happy': ['upbeat J-pop', 'feel good music', 'positive vibes'],
      'sad': ['emotional ballads', 'melancholy indie', 'sad piano'],
      'excited': ['high energy pop', 'celebration music', 'party vibes'],
      'romantic': ['love songs', 'romantic indie', 'sweet melodies'],
      'tense': ['dramatic instrumental', 'suspense music', 'intense ambient'],
      'peaceful': ['zen music', 'meditation sounds', 'calm nature'],
      'nostalgic': ['nostalgic indie', '90s vibes', 'memory lane music'],

      // Time-based additions
      'morning': ['morning coffee music', 'sunrise vibes', 'gentle wake up'],
      'afternoon': ['afternoon energy', 'midday vibes', 'productive music'],
      'evening': ['sunset chill', 'evening relaxation', 'golden hour'],
      'night': ['nighttime ambient', 'late night vibes', 'dreamy music']
    };

    let queries: string[] = [];

    // Add location-specific queries
    if (baseQueries[location]) {
      queries.push(...baseQueries[location]);
    }

    // Add mood-specific queries
    if (baseQueries[mood]) {
      queries.push(...baseQueries[mood]);
    }

    // Add time-specific queries
    if (baseQueries[timeOfDay]) {
      queries.push(...baseQueries[timeOfDay]);
    }

    // Add Japanese/anime music for authentic high school atmosphere
    queries.push('japanese indie', 'anime soundtrack', 'j-rock', 'japanese pop');

    // Fallback queries
    if (queries.length === 0) {
      queries = ['chill indie', 'ambient music', 'peaceful instrumental'];
    }

    return queries;
  }

  /**
   * Get playlist description based on context
   */
  private getPlaylistDescription(location: string, mood: string, timeOfDay: string): string {
    const locationDescriptions: { [key: string]: string } = {
      'classroom_1a': 'Focus and learning vibes for classroom sessions',
      'library': 'Quiet study atmosphere for deep concentration',
      'cafeteria': 'Social energy for lunch and conversations',
      'gymnasium': 'High energy tracks for physical activities',
      'courtyard': 'Peaceful outdoor vibes for relaxation',
      'rooftop': 'Emotional and contemplative music with city views',
      'music_room': 'Beautiful melodies and instrumental pieces',
      'art_room': 'Creative inspiration for artistic expression',
      'science_lab': 'Focused ambient music for experiments',
      'entrance': 'Welcome energy for arrivals and departures'
    };

    const baseDescription = locationDescriptions[location] || 'Atmospheric music for your school experience';
    const moodAddition = mood !== 'neutral' ? ` with ${mood} vibes` : '';
    const timeAddition = timeOfDay !== 'day' ? ` perfect for ${timeOfDay}time` : '';

    return `${baseDescription}${moodAddition}${timeAddition} at Fukimori High School`;
  }

  /**
   * Get music for character interactions
   */
  async getCharacterInteractionMusic(characterName: string, emotion: string, relationship: string): Promise<SpotifyTrack[]> {
    let query = '';

    // Base character interaction music
    if (relationship === 'romantic' || relationship.includes('date')) {
      query = 'romantic japanese indie love songs';
    } else if (relationship === 'friendship') {
      query = 'friendship upbeat happy indie';
    } else if (relationship === 'teacher-student') {
      query = 'respectful classical instrumental';
    } else {
      query = 'social interaction background music';
    }

    // Modify based on emotion
    if (emotion === 'happy' || emotion === 'excited') {
      query += ' upbeat positive';
    } else if (emotion === 'sad' || emotion === 'melancholy') {
      query += ' emotional melancholy';
    } else if (emotion === 'angry' || emotion === 'tense') {
      query += ' dramatic intense';
    } else if (emotion === 'surprised') {
      query += ' mysterious unexpected';
    }

    return await this.searchTracks(query, 10);
  }

  /**
   * Get music for special events
   */
  async getEventMusic(eventType: string): Promise<SpotifyTrack[]> {
    const eventQueries: { [key: string]: string } = {
      'school_festival': 'japanese festival music celebration',
      'sports_day': 'energetic sports anthems competition',
      'cultural_festival': 'cultural celebration japanese traditional',
      'graduation': 'graduation ceremony emotional japanese',
      'club_activities': 'youth energy club music japanese',
      'exam_time': 'study focus concentration instrumental',
      'confession_scene': 'romantic confession japanese emotional',
      'conflict': 'dramatic tension conflict music',
      'victory': 'victory celebration triumph music',
      'mystery': 'mysterious investigation ambient',
      'supernatural': 'supernatural mysterious magical music',
      'friendship': 'friendship bonds heartwarming music',
      'family': 'family warmth emotional japanese',
      'nostalgia': 'nostalgic memories bittersweet music'
    };

    const query = eventQueries[eventType] || 'atmospheric background music';
    return await this.searchTracks(query, 8);
  }

  /**
   * Get seasonal music for the school year
   */
  async getSeasonalMusic(season: string, month: number): Promise<SpotifyTrack[]> {
    let query = '';

    if (month >= 3 && month <= 5) { // Spring
      query = 'spring cherry blossom japanese new beginnings';
    } else if (month >= 6 && month <= 8) { // Summer
      query = 'summer vacation youth energy japanese';
    } else if (month >= 9 && month <= 11) { // Autumn
      query = 'autumn fall nostalgic japanese seasonal';
    } else { // Winter
      query = 'winter peaceful quiet japanese contemplative';
    }

    return await this.searchTracks(query, 12);
  }

  /**
   * Create a dynamic playlist based on multiple factors
   */
  async createDynamicPlaylist(context: {
    location: string;
    mood: string;
    timeOfDay: string;
    charactersPresent: string[];
    eventType?: string;
    season?: string;
    playerLevel?: number;
  }): Promise<MoodPlaylist> {
    const tracks: SpotifyTrack[] = [];

    // Get location-based music (primary)
    const locationMusic = await this.getLocationSoundtrack(context.location, context.mood, context.timeOfDay);
    tracks.push(...locationMusic.tracks.slice(0, 8));

    // Add event music if there's a special event
    if (context.eventType) {
      const eventMusic = await this.getEventMusic(context.eventType);
      tracks.push(...eventMusic.slice(0, 4));
    }

    // Add seasonal music
    if (context.season) {
      const month = new Date().getMonth() + 1;
      const seasonalMusic = await this.getSeasonalMusic(context.season, month);
      tracks.push(...seasonalMusic.slice(0, 3));
    }

    // Add character interaction music if characters are present
    if (context.charactersPresent.length > 0) {
      const interactionMusic = await this.getCharacterInteractionMusic(
        context.charactersPresent[0], 
        context.mood, 
        'friendship'
      );
      tracks.push(...interactionMusic.slice(0, 2));
    }

    // Remove duplicates and shuffle
    const uniqueTracks = tracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    );

    // Shuffle for variety
    const shuffledTracks = uniqueTracks.sort(() => Math.random() - 0.5).slice(0, 15);

    return {
      mood: context.mood,
      location: context.location,
      tracks: shuffledTracks,
      description: `Dynamic soundtrack for ${context.location} - ${this.getPlaylistDescription(context.location, context.mood, context.timeOfDay)}`
    };
  }
}