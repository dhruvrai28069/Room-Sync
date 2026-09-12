const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Smart Hostel database seeding...');

  // 1. Seed System Configuration
  console.log('...Seeding System Configuration');
  await prisma.systemConfig.upsert({
    where: { id: 'GLOBAL' },
    update: {},
    create: {
      id: 'GLOBAL',
      lifestyleWeight: 0.30,
      academicWeight: 0.20,
      goalsWeight: 0.15,
      personalityWeight: 0.10,
      interestsWeight: 0.10,
      growthWeight: 0.10,
      mutualPrefWeight: 0.05,
      groupAvgWeight: 0.70,
      groupMinWeight: 0.30
    }
  });

  // 2. Seed College
  console.log('...Seeding College');
  const college = await prisma.college.upsert({
    where: { code: 'APEX_TECH' },
    update: {},
    create: {
      name: 'Apex Institute of Technology',
      code: 'APEX_TECH',
      address: '100 University Avenue, Tech Park'
    }
  });

  // 3. Seed Hostels & Blocks
  console.log('...Seeding Hostels & Rooms');
  const boysHostel = await prisma.hostel.create({
    data: {
      name: 'Newton Hall (Boys)',
      genderType: 'MALE',
      collegeId: college.id,
      blocks: {
        create: [
          {
            name: 'Block A',
            rooms: {
              create: [
                { roomNumber: 'A-101', capacity: 2, status: 'AVAILABLE' },
                { roomNumber: 'A-102', capacity: 2, status: 'AVAILABLE' },
                { roomNumber: 'A-103', capacity: 2, status: 'AVAILABLE' },
                { roomNumber: 'A-104', capacity: 3, status: 'AVAILABLE' }
              ]
            }
          },
          {
            name: 'Block B',
            rooms: {
              create: [
                { roomNumber: 'B-201', capacity: 2, status: 'AVAILABLE' },
                { roomNumber: 'B-202', capacity: 2, status: 'AVAILABLE' },
                { roomNumber: 'B-203', capacity: 3, status: 'AVAILABLE' }
              ]
            }
          }
        ]
      }
    }
  });

  const girlsHostel = await prisma.hostel.create({
    data: {
      name: 'Curie Hall (Girls)',
      genderType: 'FEMALE',
      collegeId: college.id,
      blocks: {
        create: [
          {
            name: 'Block Alpha',
            rooms: {
              create: [
                { roomNumber: 'Alpha-101', capacity: 2, status: 'AVAILABLE' },
                { roomNumber: 'Alpha-102', capacity: 2, status: 'AVAILABLE' },
                { roomNumber: 'Alpha-103', capacity: 2, status: 'AVAILABLE' }
              ]
            }
          }
        ]
      }
    }
  });

  // 4. Seed Super Admin User
  console.log('...Seeding Users (Admin, Warden, Students)');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@smarthostel.edu' },
    update: {},
    create: {
      email: 'admin@smarthostel.edu',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      collegeId: college.id
    }
  });

  // 5. Seed Warden Users
  const wardenPasswordHash = await bcrypt.hash('warden123', 10);
  const wardenUser1 = await prisma.user.upsert({
    where: { email: 'warden.newton@smarthostel.edu' },
    update: {},
    create: {
      email: 'warden.newton@smarthostel.edu',
      passwordHash: wardenPasswordHash,
      role: 'WARDEN',
      collegeId: college.id,
      warden: {
        create: {
          name: 'Prof. Alan Turing',
          phone: '+1-555-0192',
          hostels: {
            create: [
              { hostelId: boysHostel.id }
            ]
          }
        }
      }
    }
  });

  const wardenUser2 = await prisma.user.upsert({
    where: { email: 'warden.curie@smarthostel.edu' },
    update: {},
    create: {
      email: 'warden.curie@smarthostel.edu',
      passwordHash: wardenPasswordHash,
      role: 'WARDEN',
      collegeId: college.id,
      warden: {
        create: {
          name: 'Dr. Margaret Hamilton',
          phone: '+1-555-0193',
          hostels: {
            create: [
              { hostelId: girlsHostel.id }
            ]
          }
        }
      }
    }
  });

  // 6. Seed Questionnaire & 36 Questions
  console.log('...Seeding Questionnaire & Questions');
  const questionnaire = await prisma.questionnaire.create({
    data: {
      title: 'Smart Hostel Roommate Compatibility Assessment 2026',
      description: 'Comprehensive 36-question assessment covering daily lifestyle, sleep, study habits, goals, and skill exchange.',
      isActive: true
    }
  });

  const questionDefs = [
    // A. BASIC / ACADEMIC
    {
      category: 'BASIC_ACADEMIC',
      questionText: 'What is your current degree course?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'MBA', 'Ph.D.']
    },
    {
      category: 'BASIC_ACADEMIC',
      questionText: 'What is your primary branch / major?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Computer Science', 'Electrical Eng', 'Mechanical Eng', 'Civil Eng', 'Business Admin', 'Data Science']
    },
    {
      category: 'BASIC_ACADEMIC',
      questionText: 'What is your current academic year?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['1st Year', '2nd Year', '3rd Year', '4th Year']
    },
    {
      category: 'BASIC_ACADEMIC',
      questionText: 'Where do you prefer to study most of the time?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Own Desk in Room', 'Hostel Reading Room / Library', 'Campus Central Library', 'Group Study Spaces']
    },
    {
      category: 'BASIC_ACADEMIC',
      questionText: 'What is your primary study time style?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE']
    },
    {
      category: 'BASIC_ACADEMIC',
      questionText: 'What study environment noise level do you require?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['SILENT', 'MODERATE', 'BACKGROUND_MUSIC']
    },

    // B. DAILY LIFESTYLE
    {
      category: 'DAILY_LIFESTYLE',
      questionText: 'What time do you usually sleep on weekdays?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['9:30 PM - 10:30 PM', '10:30 PM - 11:30 PM', '11:30 PM - 1:00 AM', '1:00 AM - 2:30 AM', 'After 2:30 AM']
    },
    {
      category: 'DAILY_LIFESTYLE',
      questionText: 'What time do you usually wake up on weekdays?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['5:30 AM - 6:30 AM', '6:30 AM - 7:30 AM', '7:30 AM - 8:30 AM', '8:30 AM - 9:30 AM', 'After 9:30 AM']
    },
    {
      category: 'DAILY_LIFESTYLE',
      questionText: 'How much time do you spend inside your room during daytime?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Mostly inside room', 'Only for sleep & quiet study', 'Rarely inside room except sleep']
    },
    {
      category: 'DAILY_LIFESTYLE',
      questionText: 'What lighting preference do you have when sleeping?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Complete Darkness', 'Night Lamp / Dim Light', 'Main Light On till late']
    },

    // C. SLEEP
    {
      category: 'SLEEP',
      questionText: 'How easily do you wake up due to light or minor room noise?',
      questionType: 'SCALE',
      isMandatory: true,
      options: ['1 - Deep Sleeper', '2', '3 - Moderate', '4', '5 - Light Sleeper']
    },
    {
      category: 'SLEEP',
      questionText: 'Do you snore or talk in your sleep?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['No', 'Occasional / Light', 'Yes / Heavy', 'Prefer not to say']
    },
    {
      category: 'SLEEP',
      questionText: 'How critical is 7-8 hours of uninterrupted sleep to your routine?',
      questionType: 'SCALE',
      isMandatory: true,
      options: ['1 - Low Importance', '2', '3 - Moderate', '4', '5 - Extremely Critical']
    },

    // D. NOISE
    {
      category: 'NOISE',
      questionText: 'How do you listen to music / media inside the room?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Always Headphones', 'Low Volume Speaker', 'High Volume Speaker']
    },
    {
      category: 'NOISE',
      questionText: 'How frequently do you play voice-chat games in room?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Never', 'Occasionally (Before 10 PM)', 'Frequently / Late Night']
    },
    {
      category: 'NOISE',
      questionText: 'Where do you prefer taking personal phone/voice calls?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Outside Room / Balcony', 'Inside Room (Quietly)', 'Inside Room (Normal conversation)']
    },
    {
      category: 'NOISE',
      questionText: 'What hours should be strictly observed as quiet hours in room?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['10 PM - 6 AM', '11 PM - 7 AM', '12 AM - 8 AM', 'Flexible']
    },

    // E. CLEANLINESS
    {
      category: 'CLEANLINESS',
      questionText: 'What is your personal room cleanliness standard?',
      questionType: 'SCALE',
      isMandatory: true,
      options: ['1 - Meticulous Spotless Daily', '2', '3 - Moderately Clean', '4', '5 - Casual / Relaxed']
    },
    {
      category: 'CLEANLINESS',
      questionText: 'How often do you clean and sweep your desk and bed area?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['Daily', 'Every 2-3 Days', 'Weekly', 'Monthly']
    },
    {
      category: 'CLEANLINESS',
      questionText: 'How do you keep your wardrobe and desk organized?',
      questionType: 'SCALE',
      isMandatory: true,
      options: ['1 - Super Organized', '2', '3 - Average', '4', '5 - Cluttered']
    },

    // F. SOCIAL PREFERENCES
    {
      category: 'SOCIAL_PREFERENCES',
      questionText: 'How would you describe your social energy in room environment?',
      questionType: 'SCALE',
      isMandatory: true,
      options: ['1 - Quiet / Introverted', '2', '3 - Ambivert', '4', '5 - High Energy / Extroverted']
    },
    {
      category: 'SOCIAL_PREFERENCES',
      questionText: 'How much personal space and quiet solitude do you need daily?',
      questionType: 'SCALE',
      isMandatory: true,
      options: ['1 - Low solitude needed', '2', '3 - Moderate', '4', '5 - Solitude essential']
    },
    {
      category: 'SOCIAL_PREFERENCES',
      questionText: 'What is your comfort level with having external friends visit room?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['No outside visitors', 'Daytime visitors okay', 'Anytime visitors okay']
    },

    // G. GOALS
    {
      category: 'GOALS',
      questionText: 'What is your primary post-graduation career goal?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      options: ['PLACEMENT', 'HIGHER_STUDIES', 'GATE_CAT', 'ENTREPRENEURSHIP', 'RESEARCH']
    },
    {
      category: 'GOALS',
      questionText: 'Which key preparation areas are you focusing on currently?',
      questionType: 'MULTI_CHOICE',
      isMandatory: false,
      options: ['Coding & DSA', 'Research Publications', 'Competitive Exams (GATE/CAT/GRE)', 'Product Development', 'Fitness & Health']
    },

    // H. HOBBIES & INTERESTS
    {
      category: 'HOBBIES_INTERESTS',
      questionText: 'Select your favorite hobbies & leisure activities:',
      questionType: 'MULTI_CHOICE',
      isMandatory: false,
      options: ['Coding', 'Music & Instruments', 'Photography', 'Gaming', 'Reading & Literature', 'Film & Cinema', 'Travelling', 'Fitness']
    },

    // I. SPORTS
    {
      category: 'SPORTS',
      questionText: 'Which sports do you play regularly?',
      questionType: 'MULTI_CHOICE',
      isMandatory: false,
      options: ['Football', 'Cricket', 'Basketball', 'Badminton', 'Chess', 'Running / Marathon', 'Gym / Powerlifting', 'None']
    },
    {
      category: 'SPORTS',
      questionText: 'How frequently do you engage in physical sports or workouts?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: false,
      options: ['Daily', '3-4 times a week', 'Weekends only', 'Rarely']
    },

    // J. EXTRACURRICULAR
    {
      category: 'EXTRACURRICULAR',
      questionText: 'Which campus clubs or organizations are you part of?',
      questionType: 'MULTI_CHOICE',
      isMandatory: false,
      options: ['Technical Club', 'Cultural / Music Society', 'NSS / Volunteering', 'Student Council', 'E-Cell / Entrepreneurship']
    },

    // K. SKILLS (GROWTH COMPATIBILITY)
    {
      category: 'SKILLS',
      questionText: 'Which skills can you teach or help a roommate learn?',
      questionType: 'MULTI_CHOICE',
      isMandatory: false,
      options: ['Python & Web Dev', 'Data Structures & Algorithms', 'Guitar & Music Theory', 'Video Editing & Graphics', 'Mathematics & Physics', 'Fitness Training & Nutrition']
    },
    {
      category: 'SKILLS',
      questionText: 'Which skills would you like to learn from a roommate?',
      questionType: 'MULTI_CHOICE',
      isMandatory: false,
      options: ['Python & Web Dev', 'Data Structures & Algorithms', 'Guitar & Music Theory', 'Video Editing & Graphics', 'Mathematics & Physics', 'Fitness Training & Nutrition']
    },

    // L. ROOMMATE PREFERENCES
    {
      category: 'ROOMMATE_PREFERENCES',
      questionText: 'Do you have a specific requested roommate?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: false,
      options: ['No Preference', 'Preferred Roommate']
    },
    {
      category: 'ROOMMATE_PREFERENCES',
      questionText: 'If requesting a roommate, enter their Student Roll No / ID:',
      questionType: 'TEXT',
      isMandatory: false,
      options: []
    },

    // M. DEAL BREAKERS & CRITICAL PREFERENCES
    {
      category: 'DEAL_BREAKERS',
      questionText: 'Do you require a strict Non-Smoking room?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: true,
      isHardConstraint: true,
      options: ['Strict Non-Smoker Room Required', 'Flexible']
    },
    {
      category: 'DEAL_BREAKERS',
      questionText: 'Do you have a strict dietary room preference?',
      questionType: 'SINGLE_CHOICE',
      isMandatory: false,
      options: ['Pure Vegetarian Room Preferred', 'No Preference']
    },
    {
      category: 'DEAL_BREAKERS',
      questionText: 'Any special medical or physical accessibility needs?',
      questionType: 'TEXT',
      isMandatory: false,
      options: []
    }
  ];

  for (let idx = 0; idx < questionDefs.length; idx++) {
    const q = questionDefs[idx];
    await prisma.question.create({
      data: {
        questionnaireId: questionnaire.id,
        category: q.category,
        questionText: q.questionText,
        questionType: q.questionType,
        isMandatory: q.isMandatory,
        isHardConstraint: q.isHardConstraint || false,
        orderIndex: idx + 1,
        options: {
          create: q.options.map(opt => ({
            optionText: opt,
            optionValue: opt
          }))
        }
      }
    });
  }

  // 7. Seed Diverse Student Users & Student Profiles
  console.log('...Seeding Students and Profiles');
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  const sampleStudentsData = [
    {
      email: 'alex.cs@smarthostel.edu',
      studentIdNo: 'STU202601',
      firstName: 'Alex',
      lastName: 'Rivera',
      gender: 'MALE',
      course: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: 2,
      profile: {
        sleepTimeMinutes: 1380, // 11:00 PM
        wakeTimeMinutes: 420,  // 7:00 AM
        sleepLightSensitivity: 2,
        cleanlinessScale: 2,    // Clean
        cleaningFrequency: 2,
        noiseTolerance: 2,      // Prefers quiet
        studyEnvironment: 'SILENT',
        studyTimePreference: 'NIGHT_OWL',
        socialPreference: 2,
        visitorPreference: 2,
        careerGoal: 'PLACEMENT',
        skills: [
          { skillName: 'Python & Web Dev', type: 'CAN_TEACH' },
          { skillName: 'Video Editing & Graphics', type: 'WANTS_TO_LEARN' }
        ],
        interests: [
          { category: 'HOBBY', name: 'Coding' },
          { category: 'HOBBY', name: 'Gaming' },
          { category: 'SPORT', name: 'Badminton' }
        ]
      }
    },
    {
      email: 'brian.ee@smarthostel.edu',
      studentIdNo: 'STU202602',
      firstName: 'Brian',
      lastName: 'Chen',
      gender: 'MALE',
      course: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: 2,
      profile: {
        sleepTimeMinutes: 1410, // 11:30 PM
        wakeTimeMinutes: 450,  // 7:30 AM
        sleepLightSensitivity: 3,
        cleanlinessScale: 2,    // Clean
        cleaningFrequency: 2,
        noiseTolerance: 2,      // Prefers quiet
        studyEnvironment: 'SILENT',
        studyTimePreference: 'NIGHT_OWL',
        socialPreference: 3,
        visitorPreference: 2,
        careerGoal: 'PLACEMENT',
        skills: [
          { skillName: 'Video Editing & Graphics', type: 'CAN_TEACH' },
          { skillName: 'Python & Web Dev', type: 'WANTS_TO_LEARN' }
        ],
        interests: [
          { category: 'HOBBY', name: 'Coding' },
          { category: 'HOBBY', name: 'Film & Cinema' },
          { category: 'SPORT', name: 'Badminton' }
        ]
      }
    },
    {
      email: 'carl.me@smarthostel.edu',
      studentIdNo: 'STU202603',
      firstName: 'Carl',
      lastName: 'Miller',
      gender: 'MALE',
      course: 'B.Tech',
      branch: 'Mechanical Eng',
      yearOfStudy: 2,
      profile: {
        sleepTimeMinutes: 1320, // 10:00 PM
        wakeTimeMinutes: 360,  // 6:00 AM
        sleepLightSensitivity: 5,
        cleanlinessScale: 4,    // Relaxed
        cleaningFrequency: 4,
        noiseTolerance: 4,      // Loud
        studyEnvironment: 'BACKGROUND_MUSIC',
        studyTimePreference: 'EARLY_BIRD',
        socialPreference: 5,
        visitorPreference: 4,
        careerGoal: 'GATE_CAT',
        skills: [
          { skillName: 'Fitness Training & Nutrition', type: 'CAN_TEACH' },
          { skillName: 'Python & Web Dev', type: 'WANTS_TO_LEARN' }
        ],
        interests: [
          { category: 'HOBBY', name: 'Fitness' },
          { category: 'SPORT', name: 'Football' },
          { category: 'SPORT', name: 'Gym / Powerlifting' }
        ]
      }
    },
    {
      email: 'david.ce@smarthostel.edu',
      studentIdNo: 'STU202604',
      firstName: 'David',
      lastName: 'Smith',
      gender: 'MALE',
      course: 'B.Tech',
      branch: 'Mechanical Eng',
      yearOfStudy: 2,
      profile: {
        sleepTimeMinutes: 1350, // 10:30 PM
        wakeTimeMinutes: 390,  // 6:30 AM
        sleepLightSensitivity: 4,
        cleanlinessScale: 4,    // Relaxed
        cleaningFrequency: 4,
        noiseTolerance: 4,      // Loud
        studyEnvironment: 'BACKGROUND_MUSIC',
        studyTimePreference: 'EARLY_BIRD',
        socialPreference: 4,
        visitorPreference: 4,
        careerGoal: 'GATE_CAT',
        skills: [
          { skillName: 'Guitar & Music Theory', type: 'CAN_TEACH' },
          { skillName: 'Fitness Training & Nutrition', type: 'WANTS_TO_LEARN' }
        ],
        interests: [
          { category: 'HOBBY', name: 'Music & Instruments' },
          { category: 'SPORT', name: 'Football' }
        ]
      }
    },
    // Girls Hostel Sample Students
    {
      email: 'emma.cs@smarthostel.edu',
      studentIdNo: 'STU202605',
      firstName: 'Emma',
      lastName: 'Watson',
      gender: 'FEMALE',
      course: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: 1,
      profile: {
        sleepTimeMinutes: 1380, // 11:00 PM
        wakeTimeMinutes: 420,  // 7:00 AM
        sleepLightSensitivity: 2,
        cleanlinessScale: 1,    // Spotless
        cleaningFrequency: 1,
        noiseTolerance: 2,
        studyEnvironment: 'SILENT',
        studyTimePreference: 'NIGHT_OWL',
        socialPreference: 3,
        visitorPreference: 2,
        careerGoal: 'HIGHER_STUDIES',
        skills: [
          { skillName: 'Mathematics & Physics', type: 'CAN_TEACH' },
          { skillName: 'Python & Web Dev', type: 'WANTS_TO_LEARN' }
        ],
        interests: [
          { category: 'HOBBY', name: 'Reading & Literature' },
          { category: 'SPORT', name: 'Chess' }
        ]
      }
    },
    {
      email: 'fiona.ee@smarthostel.edu',
      studentIdNo: 'STU202606',
      firstName: 'Fiona',
      lastName: 'Gallagher',
      gender: 'FEMALE',
      course: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: 1,
      profile: {
        sleepTimeMinutes: 1380, // 11:00 PM
        wakeTimeMinutes: 420,  // 7:00 AM
        sleepLightSensitivity: 2,
        cleanlinessScale: 1,    // Spotless
        cleaningFrequency: 1,
        noiseTolerance: 2,
        studyEnvironment: 'SILENT',
        studyTimePreference: 'NIGHT_OWL',
        socialPreference: 3,
        visitorPreference: 2,
        careerGoal: 'HIGHER_STUDIES',
        skills: [
          { skillName: 'Python & Web Dev', type: 'CAN_TEACH' },
          { skillName: 'Mathematics & Physics', type: 'WANTS_TO_LEARN' }
        ],
        interests: [
          { category: 'HOBBY', name: 'Reading & Literature' },
          { category: 'HOBBY', name: 'Coding' }
        ]
      }
    }
  ];

  for (const sData of sampleStudentsData) {
    const user = await prisma.user.upsert({
      where: { email: sData.email },
      update: {},
      create: {
        email: sData.email,
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        collegeId: college.id,
        student: {
          create: {
            studentIdNo: sData.studentIdNo,
            firstName: sData.firstName,
            lastName: sData.lastName,
            gender: sData.gender,
            course: sData.course,
            branch: sData.branch,
            yearOfStudy: sData.yearOfStudy,
            profile: {
              create: {
                sleepTimeMinutes: sData.profile.sleepTimeMinutes,
                wakeTimeMinutes: sData.profile.wakeTimeMinutes,
                sleepLightSensitivity: sData.profile.sleepLightSensitivity,
                cleanlinessScale: sData.profile.cleanlinessScale,
                cleaningFrequency: sData.profile.cleaningFrequency,
                noiseTolerance: sData.profile.noiseTolerance,
                studyEnvironment: sData.profile.studyEnvironment,
                studyTimePreference: sData.profile.studyTimePreference,
                socialPreference: sData.profile.socialPreference,
                visitorPreference: sData.profile.visitorPreference,
                careerGoal: sData.profile.careerGoal,
                isDataComplete: true,
                skills: {
                  create: sData.profile.skills
                },
                interests: {
                  create: sData.profile.interests
                }
              }
            },
            responses: {
              create: {
                isComplete: true,
                submittedAt: new Date()
              }
            }
          }
        }
      }
    });
  }

  console.log('✅ Smart Hostel database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
