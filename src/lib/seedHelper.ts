import { prisma } from '@/lib/prisma';
import { DEMO_STUDENT_PROFILES, REALISTIC_RAW_NOTICES } from '@/lib/sampleNotices';
import { calculateRelevanceScore } from '@/lib/relevance';

// Pre-defined high-quality structured task data for instant zero-latency seeding
const PRESTRUCTURED_SAMPLE_TASKS = [
  {
    rawIndex: 0,
    title: 'Microsoft IDC Campus Recruitment Drive (SDE-1)',
    summary: 'On-campus recruitment and summer internship drive for SDE-1 roles by Microsoft India for 3rd and 4th year CSE, IT, ECE students.',
    category: 'PLACEMENT',
    deadline: new Date('2026-09-20T18:29:00.000Z'),
    deadlineFormatted: 'Sep 20, 2026, 11:59 PM IST',
    urgency: 'CRITICAL',
    eligibility: 'B.Tech CSE, IT, ECE with min 7.5 CGPA and 0 active backlogs',
    requiredActions: [
      'Register on Microsoft Careers Portal via ERP link',
      'Upload verified 1-page resume on Placement ERP',
      'Attend Online Coding Assessment on Sep 24, 10:00 AM'
    ],
    targetBranches: ['CSE', 'IT', 'ECE'],
    targetYears: [3, 4],
  },
  {
    rawIndex: 1,
    title: 'Mid-Semester Exam Registration & Hall Ticket Clearance',
    summary: 'Mandatory online exam form submission and fee clearance for mid-semester exams starting Oct 5, 2026.',
    category: 'EXAM',
    deadline: new Date('2026-09-28T11:30:00.000Z'),
    deadlineFormatted: 'Sep 28, 2026, 5:00 PM IST',
    urgency: 'HIGH',
    eligibility: 'All UG & PG Students (Min 75% attendance mandatory)',
    requiredActions: [
      'Clear pending semester dues on ERP portal',
      'Submit exam registration form online',
      'Submit attendance shortage dispensation if <75%',
      'Download and print hall ticket on Oct 1'
    ],
    targetBranches: ['ALL'],
    targetYears: [1, 2, 3, 4],
  },
  {
    rawIndex: 2,
    title: 'National Merit & Campus Merit-Cum-Means Scholarship 2026',
    summary: 'Applications invited for financial aid and annual fee concessions for meritorious and economically disadvantaged students.',
    category: 'SCHOLARSHIP',
    deadline: new Date('2026-10-15T11:30:00.000Z'),
    deadlineFormatted: 'Oct 15, 2026, 5:00 PM IST',
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
  {
    rawIndex: 3,
    title: 'Smart City Hackathon 2026: IoT, AI & Autonomous Solutions',
    summary: 'Annual inter-college hackathon offering INR 1,50,000 prize pool and pre-incubation grants at Campus Innovation Hub.',
    category: 'EVENT',
    deadline: new Date('2026-09-22T18:29:00.000Z'),
    deadlineFormatted: 'Sep 22, 2026, 11:59 PM IST',
    urgency: 'HIGH',
    eligibility: 'Interdisciplinary teams of 3-4 students (UG/PG)',
    requiredActions: [
      'Form team of 3-4 members (must include >=1 female student)',
      'Submit 3-page PPT project abstract on portal',
      'Register before Sep 22 deadline'
    ],
    targetBranches: ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
    targetYears: [1, 2, 3, 4],
  },
  {
    rawIndex: 4,
    title: 'Mandatory Major / Minor Capstone Project Stage-1 Review',
    summary: 'Stage-1 project review for Final Year B.Tech students covering literature survey, architecture diagram, and baseline prototype.',
    category: 'ACADEMIC',
    deadline: new Date('2026-09-30T10:30:00.000Z'),
    deadlineFormatted: 'Sep 30, 2026, 4:00 PM IST',
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
    rawIndex: 5,
    title: 'Elective Course Add/Drop & Section Allocation Deadline',
    summary: 'Final window to modify open electives and department electives for Odd Semester 2026.',
    category: 'REGISTRATION',
    deadline: new Date('2026-09-18T11:30:00.000Z'),
    deadlineFormatted: 'Sep 18, 2026, 5:00 PM IST',
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
];

export async function ensureDatabaseSeeded(): Promise<void> {
  const studentCount = await prisma.student.count();
  const taskCount = await prisma.extractedTask.count();

  if (studentCount > 0 && taskCount > 0) {
    return; // Already populated
  }

  // 1. Seed students
  for (const profile of DEMO_STUDENT_PROFILES) {
    await prisma.student.upsert({
      where: { id: profile.id },
      update: {},
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

  // 2. Seed notices and pre-structured tasks
  for (let i = 0; i < REALISTIC_RAW_NOTICES.length; i++) {
    const raw = REALISTIC_RAW_NOTICES[i];
    const taskData = PRESTRUCTURED_SAMPLE_TASKS[i] || PRESTRUCTURED_SAMPLE_TASKS[0];

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
        title: taskData.title,
        summary: taskData.summary,
        category: taskData.category as any,
        targetBranches: taskData.targetBranches,
        targetYears: taskData.targetYears,
        eligibility: taskData.eligibility,
      },
      activeStudent
    );

    await prisma.extractedTask.create({
      data: {
        noticeId: notice.id,
        title: taskData.title,
        summary: taskData.summary,
        category: taskData.category as any,
        deadline: taskData.deadline,
        deadlineFormatted: taskData.deadlineFormatted,
        urgency: taskData.urgency as any,
        eligibility: taskData.eligibility,
        requiredActions: JSON.stringify(taskData.requiredActions),
        targetBranches: JSON.stringify(taskData.targetBranches),
        targetYears: JSON.stringify(taskData.targetYears),
        relevanceScore,
        status: 'PENDING',
      },
    });
  }
}
