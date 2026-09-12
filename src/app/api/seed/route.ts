import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEMO_STUDENT_PROFILES, REALISTIC_RAW_NOTICES } from '@/lib/sampleNotices';
import { extractNoticeStructure } from '@/lib/groq';
import { calculateRelevanceScore } from '@/lib/relevance';

export async function POST() {
  try {
    // 1. Clear existing records for fresh clean state
    await prisma.chatMessage.deleteMany({});
    await prisma.extractedTask.deleteMany({});
    await prisma.notice.deleteMany({});
    await prisma.student.deleteMany({});

    // 2. Insert Student Profiles
    for (const profile of DEMO_STUDENT_PROFILES) {
      await prisma.student.create({
        data: {
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

    // Default active student is the first one (Aarav - CSE 3rd Year)
    const activeStudent = DEMO_STUDENT_PROFILES[0];

    // 3. Ingest and extract sample notices
    const createdTasks = [];
    for (const rawNotice of REALISTIC_RAW_NOTICES) {
      const extracted = await extractNoticeStructure(rawNotice.rawContent);

      const notice = await prisma.notice.create({
        data: {
          title: rawNotice.title,
          rawContent: rawNotice.rawContent,
          source: rawNotice.source,
          sourceSender: rawNotice.sourceSender,
          fileType: 'TXT',
          receivedAt: new Date(),
        },
      });

      const relevanceScore = calculateRelevanceScore(
        {
          title: extracted.title,
          summary: extracted.summary,
          category: extracted.category,
          targetBranches: extracted.targetBranches,
          targetYears: extracted.targetYears,
          eligibility: extracted.eligibility,
        },
        activeStudent
      );

      const task = await prisma.extractedTask.create({
        data: {
          noticeId: notice.id,
          title: extracted.title,
          summary: extracted.summary,
          category: extracted.category,
          deadline: extracted.deadline ? new Date(extracted.deadline) : null,
          deadlineFormatted: extracted.deadlineFormatted,
          urgency: extracted.urgency,
          eligibility: extracted.eligibility,
          requiredActions: JSON.stringify(extracted.requiredActions),
          targetBranches: JSON.stringify(extracted.targetBranches),
          targetYears: JSON.stringify(extracted.targetYears),
          relevanceScore,
          status: 'PENDING',
        },
      });

      createdTasks.push(task);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo dataset initialized successfully',
      studentsCount: DEMO_STUDENT_PROFILES.length,
      noticesCount: REALISTIC_RAW_NOTICES.length,
      tasksCount: createdTasks.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
