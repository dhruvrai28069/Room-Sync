const prisma = require('../config/db');

exports.getActiveQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await prisma.questionnaire.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: true
          }
        }
      }
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: 'No active questionnaire found' });
    }

    res.json({ success: true, questionnaire });
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitQuestionnaire = async (req, res) => {
  try {
    const student = req.user.student;
    if (!student) {
      return res.status(403).json({ success: false, message: 'Only students can submit questionnaire' });
    }

    const { answers } = req.body; // Map of questionId -> answerValue (or array of values for MULTI_CHOICE)
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid questionnaire payload' });
    }

    // Upsert QuestionnaireResponse
    const existingResponse = await prisma.questionnaireResponse.findUnique({
      where: { studentId: student.id }
    });

    if (existingResponse) {
      await prisma.questionnaireResponseItem.deleteMany({
        where: { responseId: existingResponse.id }
      });
    }

    const response = await prisma.questionnaireResponse.upsert({
      where: { studentId: student.id },
      update: {
        submittedAt: new Date(),
        isComplete: true
      },
      create: {
        studentId: student.id,
        isComplete: true
      }
    });

    // Create Response Items
    const itemData = Object.entries(answers).map(([qId, val]) => ({
      responseId: response.id,
      questionId: qId,
      answerValue: typeof val === 'object' ? JSON.stringify(val) : String(val)
    }));

    await prisma.questionnaireResponseItem.createMany({
      data: itemData
    });

    // Extract structured StudentProfile attributes from answers
    await syncStudentProfileFromAnswers(student.id, answers);

    res.json({ success: true, message: 'Questionnaire submitted successfully!' });
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).json({ success: false, message: 'Failed to submit questionnaire' });
  }
};

exports.getMyResponse = async (req, res) => {
  try {
    const student = req.user.student;
    if (!student) {
      return res.status(403).json({ success: false, message: 'Not a student' });
    }

    const response = await prisma.questionnaireResponse.findUnique({
      where: { studentId: student.id },
      include: {
        items: true
      }
    });

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

async function syncStudentProfileFromAnswers(studentId, answers) {
  // Helper to parse bedtime
  let sleepTimeMinutes = 1380; // 11:00 PM
  let wakeTimeMinutes = 420;  // 7:00 AM
  let cleanlinessScale = 3;
  let noiseTolerance = 3;
  let studyEnvironment = 'SILENT';
  let studyTimePreference = 'NIGHT_OWL';
  let socialPreference = 3;
  let visitorPreference = 3;
  let careerGoal = 'PLACEMENT';

  const skillsToCreate = [];
  const interestsToCreate = [];

  const questions = await prisma.question.findMany();
  const qMap = new Map(questions.map(q => [q.id, q]));

  for (const [qId, rawVal] of Object.entries(answers)) {
    const q = qMap.get(qId);
    if (!q) continue;

    const strVal = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal);

    if (q.category === 'DAILY_LIFESTYLE' && q.questionText.includes('sleep')) {
      if (strVal.includes('9:30')) sleepTimeMinutes = 1320;
      else if (strVal.includes('10:30')) sleepTimeMinutes = 1380;
      else if (strVal.includes('11:30')) sleepTimeMinutes = 1410;
      else if (strVal.includes('1:00 AM')) sleepTimeMinutes = 60;
      else if (strVal.includes('After 2:30')) sleepTimeMinutes = 180;
    }

    if (q.category === 'DAILY_LIFESTYLE' && q.questionText.includes('wake')) {
      if (strVal.includes('5:30')) wakeTimeMinutes = 360;
      else if (strVal.includes('6:30')) wakeTimeMinutes = 420;
      else if (strVal.includes('7:30')) wakeTimeMinutes = 480;
      else if (strVal.includes('8:30')) wakeTimeMinutes = 540;
      else if (strVal.includes('After 9:30')) wakeTimeMinutes = 600;
    }

    if (q.category === 'CLEANLINESS' && q.questionType === 'SCALE') {
      const match = strVal.match(/\d+/);
      if (match) cleanlinessScale = parseInt(match[0]);
    }

    if (q.category === 'NOISE' && q.questionText.includes('listen')) {
      if (strVal.includes('Headphones')) noiseTolerance = 1;
      else if (strVal.includes('Low Volume')) noiseTolerance = 3;
      else if (strVal.includes('High Volume')) noiseTolerance = 5;
    }

    if (q.category === 'BASIC_ACADEMIC' && q.questionText.includes('study time')) {
      if (strVal.includes('EARLY_BIRD')) studyTimePreference = 'EARLY_BIRD';
      else if (strVal.includes('NIGHT_OWL')) studyTimePreference = 'NIGHT_OWL';
      else studyTimePreference = 'FLEXIBLE';
    }

    if (q.category === 'BASIC_ACADEMIC' && q.questionText.includes('noise level')) {
      if (strVal.includes('SILENT')) studyEnvironment = 'SILENT';
      else if (strVal.includes('BACKGROUND_MUSIC')) studyEnvironment = 'BACKGROUND_MUSIC';
      else studyEnvironment = 'MODERATE';
    }

    if (q.category === 'SOCIAL_PREFERENCES' && q.questionType === 'SCALE') {
      const match = strVal.match(/\d+/);
      if (match) socialPreference = parseInt(match[0]);
    }

    if (q.category === 'GOALS' && q.questionText.includes('career')) {
      careerGoal = strVal;
    }

    // Skills
    if (q.category === 'SKILLS') {
      const skillList = Array.isArray(rawVal) ? rawVal : [rawVal];
      const isTeach = q.questionText.includes('teach');
      const type = isTeach ? 'CAN_TEACH' : 'WANTS_TO_LEARN';
      skillList.forEach(name => {
        if (name) skillsToCreate.push({ skillName: String(name), type });
      });
    }

    // Hobbies / Sports
    if (['HOBBY', 'HOBBIES_INTERESTS', 'SPORTS', 'EXTRACURRICULAR'].includes(q.category)) {
      const list = Array.isArray(rawVal) ? rawVal : [rawVal];
      list.forEach(name => {
        if (name && name !== 'None') interestsToCreate.push({ category: q.category, name: String(name) });
      });
    }
  }

  // Create or update StudentProfile
  const profile = await prisma.studentProfile.upsert({
    where: { studentId },
    update: {
      sleepTimeMinutes,
      wakeTimeMinutes,
      cleanlinessScale,
      noiseTolerance,
      studyEnvironment,
      studyTimePreference,
      socialPreference,
      visitorPreference,
      careerGoal,
      isDataComplete: true
    },
    create: {
      studentId,
      sleepTimeMinutes,
      wakeTimeMinutes,
      cleanlinessScale,
      noiseTolerance,
      studyEnvironment,
      studyTimePreference,
      socialPreference,
      visitorPreference,
      careerGoal,
      isDataComplete: true
    }
  });

  // Re-create skills & interests
  await prisma.studentSkill.deleteMany({ where: { studentProfileId: profile.id } });
  if (skillsToCreate.length > 0) {
    await prisma.studentSkill.createMany({
      data: skillsToCreate.map(s => ({ ...s, studentProfileId: profile.id }))
    });
  }

  await prisma.studentInterest.deleteMany({ where: { studentProfileId: profile.id } });
  if (interestsToCreate.length > 0) {
    await prisma.studentInterest.createMany({
      data: interestsToCreate.map(i => ({ ...i, studentProfileId: profile.id }))
    });
  }
}
