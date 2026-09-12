import { prisma } from '@/lib/prisma';
import { DEMO_STUDENT_PROFILES, REALISTIC_RAW_NOTICES } from '@/lib/sampleNotices';
import { calculateRelevanceScore } from '@/lib/relevance';

// Helper to format deadline nicely
function getRelativeDate(daysFromNow: number, hours = 17, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function formatReadableDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function ensureDatabaseSeeded(forceReset = false): Promise<void> {
  const studentCount = await prisma.student.count();
  const taskCount = await prisma.extractedTask.count();

  if (!forceReset && studentCount > 0 && taskCount > 0) {
    return; // Already populated
  }

  // 1. Seed students
  for (const profile of DEMO_STUDENT_PROFILES) {
    await prisma.student.upsert({
      where: { id: profile.id },
      update: {
        name: profile.name,
        email: profile.email,
        rollNo: profile.rollNo,
        department: profile.department,
        branchCode: profile.branchCode,
        year: profile.year,
        semester: profile.semester,
        gpa: profile.gpa,
        academicInterests: JSON.stringify(profile.academicInterests),
        careerInterests: JSON.stringify(profile.careerInterests),
        extracurriculars: JSON.stringify(profile.extracurriculars),
      },
      create: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        rollNo: profile.rollNo,
        department: profile.department,
        branchCode: profile.branchCode,
        year: profile.year,
        semester: profile.semester,
        gpa: profile.gpa,
        academicInterests: JSON.stringify(profile.academicInterests),
        careerInterests: JSON.stringify(profile.careerInterests),
        extracurriculars: JSON.stringify(profile.extracurriculars),
      },
    });
  }

  const activeStudent = DEMO_STUDENT_PROFILES[0];

  // Dynamic relative deadlines so the 7-day timeline is ALWAYS populated
  const sampleTaskDefinitions = [
    {
      title: 'Elective Course Add/Drop & Section Allocation Deadline',
      summary: 'Final window to modify open electives and department electives for Odd Semester on the Academic ERP.',
      category: 'REGISTRATION',
      deadlineDays: 1, // Tomorrow
      urgency: 'CRITICAL',
      eligibility: '2nd, 3rd, and 4th Year B.Tech Students',
      requiredActions: [
        'Review remaining elective seats on Academic ERP',
        'Submit swap request signed by Academic Advisor',
        'Verify updated timetable in student dashboard'
      ],
      targetBranches: ['ALL'],
      targetYears: [2, 3, 4],
    },
    {
      title: 'Microsoft IDC Campus Recruitment Drive (SDE-1)',
      summary: 'On-campus recruitment and summer internship drive for SDE-1 roles by Microsoft India for 3rd and 4th year CSE, IT, ECE students.',
      category: 'PLACEMENT',
      deadlineDays: 2, // In 2 days
      urgency: 'CRITICAL',
      eligibility: 'B.Tech CSE, IT, ECE with min 7.5 CGPA and 0 active backlogs',
      requiredActions: [
        'Register on Microsoft Careers Portal via ERP link',
        'Upload verified 1-page resume on Placement ERP',
        'Attend Online Coding Assessment on Campus Lab-3'
      ],
      targetBranches: ['CSE', 'IT', 'ECE'],
      targetYears: [3, 4],
    },
    {
      title: 'Smart City Hackathon 2026: AI & Autonomous Solutions',
      summary: 'Annual inter-college hackathon offering INR 1,50,000 prize pool and pre-incubation grants at Campus Innovation Hub.',
      category: 'EVENT',
      deadlineDays: 3, // In 3 days
      urgency: 'HIGH',
      eligibility: 'Interdisciplinary teams of 3-4 students (UG/PG)',
      requiredActions: [
        'Form team of 3-4 members (must include >=1 female student)',
        'Submit 3-page PPT project abstract on portal',
        'Complete registration on HackCampus portal'
      ],
      targetBranches: ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
      targetYears: [1, 2, 3, 4],
    },
    {
      title: 'Mid-Semester Exam Registration & Hall Ticket Clearance',
      summary: 'Mandatory online exam form submission and fee clearance for mid-semester exams.',
      category: 'EXAM',
      deadlineDays: 5, // In 5 days
      urgency: 'HIGH',
      eligibility: 'All UG & PG Students (Min 75% attendance mandatory)',
      requiredActions: [
        'Clear pending semester dues on ERP portal',
        'Submit exam registration form online',
        'Submit attendance shortage dispensation if <75%',
        'Download and print hall ticket on Exam Portal'
      ],
      targetBranches: ['ALL'],
      targetYears: [1, 2, 3, 4],
    },
    {
      title: 'Mandatory Major / Minor Capstone Project Stage-1 Review',
      summary: 'Stage-1 project review for Final Year B.Tech students covering literature survey, architecture diagram, and baseline prototype.',
      category: 'ACADEMIC',
      deadlineDays: 6, // In 6 days
      urgency: 'HIGH',
      eligibility: '4th Year B.Tech Students (All Branches)',
      requiredActions: [
        'Get Project Synopsis approved by Faculty Guide',
        'Upload IEEE formatted report on Project Portal',
        'Prepare 10-slide presentation for evaluation panel'
      ],
      targetBranches: ['ALL'],
      targetYears: [4],
    },
    {
      title: 'National Merit & Campus Merit-Cum-Means Scholarship 2026',
      summary: 'Applications invited for financial aid and annual fee concessions for meritorious and economically disadvantaged students.',
      category: 'SCHOLARSHIP',
      deadlineDays: 14, // In 2 weeks
      urgency: 'MEDIUM',
      eligibility: 'Annual family income < 6 LPA and CGPA >= 7.5 (>=8.0 for Merit)',
      requiredActions: [
        'Fill Scholarship Application Form (Annexure-B)',
        'Attach Income Certificate verified by Revenue Officer',
        'Submit physical dossier to Student Welfare Section (Admin Block)'
      ],
      targetBranches: ['ALL'],
      targetYears: [1, 2, 3, 4],
    },
  ];

  // 2. Seed notices and pre-structured tasks
  for (let i = 0; i < sampleTaskDefinitions.length; i++) {
    const raw = REALISTIC_RAW_NOTICES[i] || REALISTIC_RAW_NOTICES[0];
    const taskDef = sampleTaskDefinitions[i];
    const deadlineDate = getRelativeDate(taskDef.deadlineDays);
    const deadlineFormatted = formatReadableDate(deadlineDate);

    const notice = await prisma.notice.create({
      data: {
        title: raw.title,
        rawContent: raw.rawContent,
        source: raw.source,
        sourceSender: raw.sourceSender,
        fileType: 'TXT',
        receivedAt: new Date(),
      },
    });

    const relevanceScore = calculateRelevanceScore(
      {
        title: taskDef.title,
        summary: taskDef.summary,
        category: taskDef.category as any,
        targetBranches: taskDef.targetBranches,
        targetYears: taskDef.targetYears,
        eligibility: taskDef.eligibility,
      },
      activeStudent
    );

    await prisma.extractedTask.create({
      data: {
        noticeId: notice.id,
        title: taskDef.title,
        summary: taskDef.summary,
        category: taskDef.category as any,
        deadline: deadlineDate,
        deadlineFormatted: deadlineFormatted,
        urgency: taskDef.urgency as any,
        eligibility: taskDef.eligibility,
        requiredActions: JSON.stringify(taskDef.requiredActions),
        targetBranches: JSON.stringify(taskDef.targetBranches),
        targetYears: JSON.stringify(taskDef.targetYears),
        relevanceScore,
        status: 'PENDING',
      },
    });
  }
}
