import { DeepSeekService, CharacterSeed } from './DeepSeekService';

export class DefaultCharacters {
  static initializeTeachersAndStaff(deepSeekService: DeepSeekService): void {
    // Math Teacher - Mr. Tanaka
    deepSeekService.createCharacterSeed({
      id: 'teacher_tanaka',
      name: 'Hiroshi Tanaka',
      age: 42,
      gender: 'male',
      appearance: {
        hairColor: 'black with gray streaks',
        hairStyle: 'neat, professional cut',
        eyeColor: 'brown',
        height: 'average',
        bodyType: 'slightly overweight',
        distinctiveFeatures: ['glasses', 'gentle smile'],
        outfits: {
          schoolUniform: 'professional navy suit with Fukimori High School badge',
          casualWear: ['polo shirts and khakis'],
          specialOutfits: ['formal ceremony attire'],
          accessories: ['wire-rim glasses', 'calculator watch']
        },
        physicalMarks: ['small scar on left hand from a lab accident years ago']
      },
      personality: {
        traits: ['patient', 'methodical', 'encouraging', 'slightly strict'],
        likes: ['mathematics puzzles', 'teaching moments', 'coffee', 'organized classrooms'],
        dislikes: ['students not paying attention', 'messy work', 'being late'],
        fears: ['students failing because of his teaching', 'technology breaking down'],
        goals: ['help every student understand math', 'modernize teaching methods'],
        speechPattern: 'formal but warm, uses math analogies',
        coreValues: ['education', 'patience', 'fairness'],
        behaviorPatterns: ['always arrives 15 minutes early', 'double-checks calculations'],
        socialStyle: 'professional but approachable'
      },
      background: {
        family: {
          father: { name: 'Kenji Tanaka', occupation: 'retired engineer', personality: 'methodical' },
          mother: { name: 'Yuki Tanaka', occupation: 'librarian', personality: 'nurturing' },
          siblings: [{ name: 'Akiko Tanaka-Sato', age: 38, relationship: 'younger sister, also a teacher' }],
          familyWealth: 'upper middle class',
          familyReputation: 'respected educators'
        },
        homeAddress: '4-12-8 Sakura District, Fukimori City',
        roomDescription: 'home office filled with math textbooks and teaching materials',
        economicStatus: 'comfortable middle class',
        backstory: 'Former engineer who became passionate about teaching after tutoring his niece. Has been at Fukimori High for 8 years.',
        secrets: ['sometimes doubts his teaching abilities', 'writes math poetry in his spare time'],
        pastTrauma: 'lost a promising student to a car accident 3 years ago'
      },
      abilities: {
        academic: { subjects: ['Mathematics', 'Physics', 'Statistics'], averageGrade: 'Expert', studyHabits: 'constantly learning new teaching methods' },
        athletic: { sports: [], physicalStrength: 4, endurance: 3 },
        artistic: { talents: ['mathematical art', 'calligraphy'], skill_level: 'intermediate' },
        social: { reputation: 85, popularityLevel: 'well-respected', socialCircle: ['fellow teachers', 'math club advisors'] }
      },
      dailyRoutine: {
        morning: 'arrives early to prepare lessons and help struggling students',
        lunch: 'eats in the faculty room while grading papers',
        afterSchool: 'runs Math Club and provides tutoring',
        weekend: 'grades papers, prepares lessons, visits family'
      },
      reputationTags: ['strict but fair', 'math genius', 'student favorite']
    });

    // English Teacher - Ms. Anderson
    deepSeekService.createCharacterSeed({
      id: 'teacher_anderson',
      name: 'Sarah Anderson',
      age: 29,
      gender: 'female',
      appearance: {
        hairColor: 'auburn',
        hairStyle: 'shoulder-length with gentle waves',
        eyeColor: 'green',
        height: 'tall',
        bodyType: 'slim',
        distinctiveFeatures: ['bright smile', 'expressive eyes'],
        outfits: {
          schoolUniform: 'elegant blouses with cardigans and professional skirts',
          casualWear: ['flowing dresses', 'artistic scarves'],
          specialOutfits: ['vintage-inspired formal wear'],
          accessories: ['delicate jewelry', 'reading glasses on a chain']
        },
        physicalMarks: ['small beauty mark near left eye']
      },
      personality: {
        traits: ['creative', 'enthusiastic', 'empathetic', 'inspiring'],
        likes: ['literature', 'creative writing', 'theater', 'international culture'],
        dislikes: ['standardized testing', 'closed-minded thinking', 'plagiarism'],
        fears: ['stifling student creativity', 'losing passion for teaching'],
        goals: ['inspire students to love reading', 'start a school literary magazine'],
        speechPattern: 'animated and descriptive, uses literary references',
        coreValues: ['creativity', 'self-expression', 'cultural understanding'],
        behaviorPatterns: ['quotes literature in daily conversation', 'encourages student voice'],
        socialStyle: 'warm and engaging'
      },
      background: {
        family: {
          father: { name: 'Robert Anderson', occupation: 'university professor', personality: 'intellectual' },
          mother: { name: 'Margaret Anderson', occupation: 'novelist', personality: 'creative' },
          siblings: [{ name: 'James Anderson', age: 32, relationship: 'older brother, journalist' }],
          familyWealth: 'upper middle class',
          familyReputation: 'literary family'
        },
        homeAddress: '2-7-15 Arts District, Fukimori City',
        roomDescription: 'cozy apartment filled with books, plants, and art',
        economicStatus: 'comfortable middle class',
        backstory: 'Moved to Japan after college to experience different cultures. Fell in love with teaching and decided to stay.',
        secrets: ['writes romance novels under a pen name', 'once considered dropping teaching for writing'],
        pastTrauma: 'dealt with imposter syndrome as a young foreign teacher'
      },
      abilities: {
        academic: { subjects: ['English Literature', 'Creative Writing', 'Japanese Culture'], averageGrade: 'Expert', studyHabits: 'voracious reader and writer' },
        athletic: { sports: ['yoga'], physicalStrength: 3, endurance: 5 },
        artistic: { talents: ['writing', 'poetry', 'drama direction'], skill_level: 'expert' },
        social: { reputation: 90, popularityLevel: 'very popular', socialCircle: ['international community', 'literary circles'] }
      },
      dailyRoutine: {
        morning: 'reads poetry while drinking tea before school',
        lunch: 'discusses books with students and colleagues',
        afterSchool: 'runs Drama Club and Writing Workshop',
        weekend: 'visits bookstores, writes, explores Japanese culture'
      },
      reputationTags: ['inspiring teacher', 'cultural bridge', 'creative mentor']
    });

    // Principal - Mr. Yoshida
    deepSeekService.createCharacterSeed({
      id: 'principal_yoshida',
      name: 'Masaki Yoshida',
      age: 55,
      gender: 'male',
      appearance: {
        hairColor: 'gray',
        hairStyle: 'neat, traditional cut',
        eyeColor: 'dark brown',
        height: 'average',
        bodyType: 'stocky',
        distinctiveFeatures: ['commanding presence', 'kind eyes'],
        outfits: {
          schoolUniform: 'formal dark suits with school badge',
          casualWear: ['traditional Japanese clothing on weekends'],
          specialOutfits: ['ceremonial formal wear for school events'],
          accessories: ['school badge pin', 'traditional watch']
        },
        physicalMarks: []
      },
      personality: {
        traits: ['wise', 'firm but fair', 'traditional', 'protective of students'],
        likes: ['school traditions', 'student achievements', 'tea ceremony', 'classical music'],
        dislikes: ['disrespect', 'violence', 'students giving up on themselves'],
        fears: ['failing the students and community', 'losing school traditions'],
        goals: ['maintain Fukimori High\'s excellent reputation', 'support every student\'s success'],
        speechPattern: 'formal and measured, speaks with authority but warmth',
        coreValues: ['honor', 'tradition', 'educational excellence'],
        behaviorPatterns: ['walks the halls daily', 'knows every student by name'],
        socialStyle: 'dignified but approachable'
      },
      background: {
        family: {
          father: { name: 'Takeshi Yoshida', occupation: 'former school principal (deceased)', personality: 'strict disciplinarian' },
          mother: { name: 'Haruko Yoshida', occupation: 'tea ceremony instructor', personality: 'graceful' },
          siblings: [],
          familyWealth: 'middle class',
          familyReputation: 'respected educators'
        },
        homeAddress: '1-3-22 Traditional District, Fukimori City',
        roomDescription: 'traditional Japanese home with study full of educational philosophy books',
        economicStatus: 'comfortable middle class',
        backstory: 'Third-generation educator. Started as a history teacher, became vice principal, then principal. Dedicated his life to Fukimori High.',
        secrets: ['sometimes feels overwhelmed by modern educational challenges', 'practices calligraphy to relax'],
        pastTrauma: 'witnessed the school struggle during economic hardship 10 years ago'
      },
      abilities: {
        academic: { subjects: ['History', 'Educational Administration', 'Traditional Arts'], averageGrade: 'Expert', studyHabits: 'studies educational policy and history' },
        athletic: { sports: ['kendo'], physicalStrength: 6, endurance: 5 },
        artistic: { talents: ['calligraphy', 'tea ceremony'], skill_level: 'expert' },
        social: { reputation: 95, popularityLevel: 'highly respected', socialCircle: ['educational community', 'traditional arts practitioners'] }
      },
      dailyRoutine: {
        morning: 'arrives first, reviews school operations',
        lunch: 'eats with different classes on rotation',
        afterSchool: 'meets with teachers and handles administrative duties',
        weekend: 'attends community events and practices traditional arts'
      },
      reputationTags: ['respected leader', 'tradition keeper', 'student advocate']
    });

    // School Nurse - Ms. Kimura
    deepSeekService.createCharacterSeed({
      id: 'nurse_kimura',
      name: 'Yuki Kimura',
      age: 36,
      gender: 'female',
      appearance: {
        hairColor: 'dark brown',
        hairStyle: 'practical bob cut',
        eyeColor: 'dark brown',
        height: 'short',
        bodyType: 'petite',
        distinctiveFeatures: ['gentle hands', 'caring expression'],
        outfits: {
          schoolUniform: 'clean white nurse uniform with comfortable shoes',
          casualWear: ['soft sweaters and comfortable pants'],
          specialOutfits: ['medical conference attire'],
          accessories: ['stethoscope', 'watch with large numbers', 'small medical bag']
        },
        physicalMarks: ['vaccination scar on upper arm']
      },
      personality: {
        traits: ['nurturing', 'observant', 'calm under pressure', 'intuitive'],
        likes: ['helping students', 'herbal medicine', 'quiet moments', 'student recovery stories'],
        dislikes: ['students hiding injuries', 'being rushed', 'seeing pain'],
        fears: ['missing a serious condition', 'students not trusting her'],
        goals: ['keep all students healthy', 'promote wellness education'],
        speechPattern: 'soft and reassuring, asks gentle probing questions',
        coreValues: ['health', 'caring', 'confidentiality'],
        behaviorPatterns: ['notices changes in student behavior', 'keeps detailed health records'],
        socialStyle: 'quiet but deeply caring'
      },
      background: {
        family: {
          father: { name: 'Taro Kimura', occupation: 'doctor', personality: 'dedicated healer' },
          mother: { name: 'Sachiko Kimura', occupation: 'herbalist', personality: 'gentle wisdom' },
          siblings: [{ name: 'Kenji Kimura', age: 40, relationship: 'older brother, pediatrician' }],
          familyWealth: 'upper middle class',
          familyReputation: 'healing family'
        },
        homeAddress: '3-8-14 Medical District, Fukimori City',
        roomDescription: 'peaceful room with medical references and healing plants',
        economicStatus: 'comfortable middle class',
        backstory: 'Former hospital nurse who chose school nursing to focus on preventive care and adolescent health.',
        secrets: ['studies alternative healing methods', 'keeps a journal of student health patterns'],
        pastTrauma: 'lost a young patient during her hospital days'
      },
      abilities: {
        academic: { subjects: ['Health Science', 'Psychology', 'Nutrition'], averageGrade: 'Expert', studyHabits: 'constantly updates medical knowledge' },
        athletic: { sports: ['walking', 'yoga'], physicalStrength: 3, endurance: 6 },
        artistic: { talents: ['botanical illustration', 'meditation'], skill_level: 'intermediate' },
        social: { reputation: 88, popularityLevel: 'trusted confidante', socialCircle: ['medical professionals', 'health advocates'] }
      },
      dailyRoutine: {
        morning: 'prepares health office and reviews student medical files',
        lunch: 'available for student consultations',
        afterSchool: 'updates health records and contacts parents when needed',
        weekend: 'studies herbal medicine and visits family'
      },
      reputationTags: ['healing hands', 'student confidante', 'health advocate']
    });

    // PE Teacher - Coach Saito
    deepSeekService.createCharacterSeed({
      id: 'coach_saito',
      name: 'Takuya Saito',
      age: 34,
      gender: 'male',
      appearance: {
        hairColor: 'black',
        hairStyle: 'short athletic cut',
        eyeColor: 'dark brown',
        height: 'tall',
        bodyType: 'muscular',
        distinctiveFeatures: ['strong jawline', 'energetic posture'],
        outfits: {
          schoolUniform: 'Fukimori High PE tracksuit and athletic shoes',
          casualWear: ['sports wear and athletic gear'],
          specialOutfits: ['formal coaching attire for competitions'],
          accessories: ['whistle on lanyard', 'stopwatch', 'clipboard']
        },
        physicalMarks: ['old knee surgery scar', 'various small sports-related scars']
      },
      personality: {
        traits: ['energetic', 'motivational', 'competitive', 'protective of students'],
        likes: ['student improvement', 'team sports', 'healthy competition', 'outdoor activities'],
        dislikes: ['students giving up', 'poor sportsmanship', 'laziness'],
        fears: ['student injuries', 'losing team spirit'],
        goals: ['develop student athletic potential', 'teach life lessons through sports'],
        speechPattern: 'loud and encouraging, uses sports metaphors',
        coreValues: ['teamwork', 'perseverance', 'healthy lifestyle'],
        behaviorPatterns: ['demonstrates exercises personally', 'celebrates student achievements'],
        socialStyle: 'boisterous but caring'
      },
      background: {
        family: {
          father: { name: 'Hiroshi Saito', occupation: 'former professional baseball player', personality: 'competitive' },
          mother: { name: 'Emi Saito', occupation: 'nutritionist', personality: 'health-focused' },
          siblings: [{ name: 'Rika Saito-Tanaka', age: 31, relationship: 'younger sister, sports therapist' }],
          familyWealth: 'middle class',
          familyReputation: 'athletic family'
        },
        homeAddress: '5-2-9 Sports Complex Area, Fukimori City',
        roomDescription: 'home gym with sports memorabilia and training equipment',
        economicStatus: 'middle class',
        backstory: 'Former semi-professional athlete whose career ended due to knee injury. Found new purpose in teaching and coaching.',
        secrets: ['still struggles with his athletic career ending', 'studies sports psychology'],
        pastTrauma: 'career-ending knee injury at age 26'
      },
      abilities: {
        academic: { subjects: ['Physical Education', 'Sports Science', 'Health'], averageGrade: 'Expert', studyHabits: 'studies sports methodology and injury prevention' },
        athletic: { sports: ['baseball', 'basketball', 'track and field'], physicalStrength: 9, endurance: 8 },
        artistic: { talents: ['sports photography'], skill_level: 'beginner' },
        social: { reputation: 82, popularityLevel: 'popular with athletic students', socialCircle: ['sports community', 'fellow coaches'] }
      },
      dailyRoutine: {
        morning: 'sets up sports equipment and reviews training plans',
        lunch: 'often eats with sports team members',
        afterSchool: 'coaches various sports teams and supervises training',
        weekend: 'attends sports events and trains with local athletic clubs'
      },
      reputationTags: ['motivational coach', 'athletic mentor', 'team builder']
    });
  }
}