import { DeepSeekService, LocationSeed } from './DeepSeekService';

export class DefaultLocations {
  static initializeSchoolLocations(deepSeekService: DeepSeekService): void {
    // Main Entrance
    deepSeekService.createLocationSeed({
      id: 'entrance',
      name: 'Fukimori High School Main Entrance',
      type: 'entrance',
      description: 'Grand entrance with traditional architecture mixed with modern elements. Cherry blossom trees line the pathway.',
      atmosphere: 'welcoming yet dignified',
      keyFeatures: ['bronze school nameplate', 'cherry blossom trees', 'stone pathway', 'traditional gates', 'school bulletin board'],
      connectedLocations: ['main_hallway', 'courtyard', 'parking_area'],
      typicalActivities: ['morning arrivals', 'afternoon departures', 'parent meetings', 'school events entrance']
    });

    // Main Hallway
    deepSeekService.createLocationSeed({
      id: 'main_hallway',
      name: 'Main Hallway',
      type: 'hallway',
      description: 'Wide, well-lit hallway with polished floors and trophy cases displaying school achievements.',
      atmosphere: 'busy and energetic during class changes, quiet during lessons',
      keyFeatures: ['trophy cases', 'school achievement displays', 'student artwork', 'notice boards', 'shoe lockers'],
      connectedLocations: ['entrance', 'classroom_1a', 'classroom_1b', 'classroom_1c', 'faculty_room', 'stairs_to_2f'],
      typicalActivities: ['class changes', 'student conversations', 'announcement viewing', 'trophy admiring']
    });

    // Classroom 1-A
    deepSeekService.createLocationSeed({
      id: 'classroom_1a',
      name: 'Classroom 1-A',
      type: 'classroom',
      description: 'Standard classroom with rows of desks facing a blackboard. Windows overlook the school courtyard.',
      atmosphere: 'studious and focused, warm afternoon sunlight',
      keyFeatures: ['blackboard', 'teacher\'s desk', 'student desks in rows', 'windows with courtyard view', 'class schedule', 'cleaning supplies'],
      connectedLocations: ['main_hallway'],
      typicalActivities: ['math lessons', 'homeroom', 'study periods', 'class meetings', 'after-school tutoring']
    });

    // School Cafeteria
    deepSeekService.createLocationSeed({
      id: 'cafeteria',
      name: 'School Cafeteria',
      type: 'dining',
      description: 'Large dining hall with long tables and benches. Serving area offers traditional Japanese school meals.',
      atmosphere: 'lively and social during lunch, echoing when empty',
      keyFeatures: ['serving counter', 'long dining tables', 'vending machines', 'menu board', 'large windows'],
      connectedLocations: ['main_hallway', 'kitchen', 'courtyard'],
      typicalActivities: ['lunch time', 'social gatherings', 'club meetings over meals', 'food committee meetings']
    });

    // Library
    deepSeekService.createLocationSeed({
      id: 'library',
      name: 'Fukimori High Library',
      type: 'academic',
      description: 'Quiet, well-organized library with tall bookshelves and study tables. Computer stations for research.',
      atmosphere: 'peaceful and scholarly, perfect for concentration',
      keyFeatures: ['tall bookshelves', 'reading tables', 'computer stations', 'librarian\'s desk', 'study carrels', 'magazine section'],
      connectedLocations: ['main_hallway', 'computer_lab'],
      typicalActivities: ['studying', 'research', 'reading', 'quiet conversations', 'book club meetings']
    });

    // Gymnasium
    deepSeekService.createLocationSeed({
      id: 'gymnasium',
      name: 'School Gymnasium',
      type: 'athletic',
      description: 'Large indoor gymnasium with basketball courts, volleyball nets, and athletic equipment storage.',
      atmosphere: 'energetic and echoing, smells of athletic equipment',
      keyFeatures: ['basketball hoops', 'volleyball nets', 'athletic equipment storage', 'bleachers', 'scoreboard'],
      connectedLocations: ['main_hallway', 'locker_rooms', 'equipment_storage'],
      typicalActivities: ['PE classes', 'basketball practice', 'volleyball practice', 'school assemblies', 'sports events']
    });

    // School Courtyard
    deepSeekService.createLocationSeed({
      id: 'courtyard',
      name: 'Central Courtyard',
      type: 'outdoor',
      description: 'Beautiful central courtyard with benches, trees, and a small garden. Popular spot for lunch and relaxation.',
      atmosphere: 'peaceful and natural, changes with seasons',
      keyFeatures: ['wooden benches', 'large trees', 'flower garden', 'stone pathways', 'water fountain'],
      connectedLocations: ['entrance', 'cafeteria', 'main_hallway', 'club_building'],
      typicalActivities: ['outdoor lunch', 'relaxation', 'studying outdoors', 'club activities', 'seasonal festivals']
    });

    // Rooftop
    deepSeekService.createLocationSeed({
      id: 'rooftop',
      name: 'School Rooftop',
      type: 'outdoor',
      description: 'Accessible rooftop with safety railings and benches. Offers panoramic view of Fukimori City.',
      atmosphere: 'open and windy, peaceful with city views',
      keyFeatures: ['safety railings', 'benches', 'city panorama view', 'water tanks', 'antenna equipment'],
      connectedLocations: ['stairs_to_3f'],
      typicalActivities: ['quiet contemplation', 'private conversations', 'lunch breaks', 'sunset viewing', 'confession scenes']
    });

    // Music Room
    deepSeekService.createLocationSeed({
      id: 'music_room',
      name: 'Music Room',
      type: 'creative',
      description: 'Soundproofed room with various musical instruments, piano, and music stands.',
      atmosphere: 'creative and inspiring, acoustically optimized',
      keyFeatures: ['grand piano', 'music stands', 'various instruments', 'sound equipment', 'music sheets storage'],
      connectedLocations: ['main_hallway'],
      typicalActivities: ['music classes', 'choir practice', 'band practice', 'individual practice', 'music club meetings']
    });

    // Science Laboratory
    deepSeekService.createLocationSeed({
      id: 'science_lab',
      name: 'Science Laboratory',
      type: 'academic',
      description: 'Well-equipped laboratory with experiment tables, chemical storage, and safety equipment.',
      atmosphere: 'clinical and precise, slight chemical smell',
      keyFeatures: ['experiment tables', 'chemical storage cabinets', 'microscopes', 'safety equipment', 'periodic table chart'],
      connectedLocations: ['main_hallway', 'preparation_room'],
      typicalActivities: ['science experiments', 'chemistry classes', 'biology dissections', 'science club activities']
    });

    // Faculty Room
    deepSeekService.createLocationSeed({
      id: 'faculty_room',
      name: 'Faculty Room',
      type: 'administrative',
      description: 'Teachers\' workspace with desks, filing cabinets, and a small kitchen area for staff.',
      atmosphere: 'professional and busy, coffee aroma',
      keyFeatures: ['teacher desks', 'filing cabinets', 'copy machine', 'small kitchen', 'meeting table', 'bulletin board'],
      connectedLocations: ['main_hallway', 'principal_office'],
      typicalActivities: ['lesson planning', 'grading', 'teacher meetings', 'coffee breaks', 'student consultations']
    });

    // Principal's Office
    deepSeekService.createLocationSeed({
      id: 'principal_office',
      name: 'Principal\'s Office',
      type: 'administrative',
      description: 'Formal office with traditional Japanese elements, awards, and a large desk overlooking the courtyard.',
      atmosphere: 'formal and dignified, inspiring respect',
      keyFeatures: ['large wooden desk', 'awards and certificates', 'traditional decorations', 'bookshelf', 'tea set'],
      connectedLocations: ['faculty_room', 'main_hallway'],
      typicalActivities: ['disciplinary meetings', 'parent conferences', 'administrative work', 'student counseling']
    });

    // Health Office
    deepSeekService.createLocationSeed({
      id: 'health_office',
      name: 'Health Office',
      type: 'medical',
      description: 'Clean, white room with medical equipment, examination bed, and medicine cabinet.',
      atmosphere: 'sterile and calming, reassuring presence',
      keyFeatures: ['examination bed', 'medical equipment', 'medicine cabinet', 'health records', 'privacy screen'],
      connectedLocations: ['main_hallway'],
      typicalActivities: ['health checkups', 'injury treatment', 'medication dispensing', 'health consultations', 'rest periods']
    });

    // Club Building
    deepSeekService.createLocationSeed({
      id: 'club_building',
      name: 'Club Activities Building',
      type: 'extracurricular',
      description: 'Separate building housing various club rooms for different student activities.',
      atmosphere: 'creative and energetic, sounds of various activities',
      keyFeatures: ['multiple club rooms', 'storage areas', 'bulletin boards', 'activity equipment'],
      connectedLocations: ['courtyard', 'art_room', 'drama_room', 'computer_club'],
      typicalActivities: ['club meetings', 'project work', 'skill development', 'competitions preparation']
    });

    // Art Room
    deepSeekService.createLocationSeed({
      id: 'art_room',
      name: 'Art Room',
      type: 'creative',
      description: 'Bright room with easels, art supplies, and natural lighting perfect for artistic creation.',
      atmosphere: 'inspiring and messy, paint and creativity in the air',
      keyFeatures: ['easels', 'art supply storage', 'large windows', 'student artwork displays', 'pottery wheel'],
      connectedLocations: ['club_building'],
      typicalActivities: ['art classes', 'painting', 'pottery', 'art club meetings', 'exhibition preparation']
    });

    // Drama Room
    deepSeekService.createLocationSeed({
      id: 'drama_room',
      name: 'Drama Room',
      type: 'creative',
      description: 'Flexible space with mirrors, costume storage, and a small stage area for theatrical activities.',
      atmosphere: 'dramatic and expressive, echoing with performances',
      keyFeatures: ['mirrors', 'small stage', 'costume storage', 'lighting equipment', 'script library'],
      connectedLocations: ['club_building'],
      typicalActivities: ['drama practice', 'acting classes', 'costume fittings', 'script readings', 'performance preparation']
    });

    // Student Council Room
    deepSeekService.createLocationSeed({
      id: 'student_council',
      name: 'Student Council Room',
      type: 'administrative',
      description: 'Meeting room for student government with conference table and school planning materials.',
      atmosphere: 'serious and organized, leadership energy',
      keyFeatures: ['conference table', 'planning boards', 'filing system', 'school calendars', 'voting box'],
      connectedLocations: ['main_hallway'],
      typicalActivities: ['student council meetings', 'event planning', 'policy discussions', 'leadership activities']
    });
  }
}