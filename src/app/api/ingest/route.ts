import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractNoticeStructure } from '@/lib/groq';
import { calculateRelevanceScore } from '@/lib/relevance';
import { StudentProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText, title, sourceSender, source = 'PASTE', studentId } = body;

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide valid notice text (at least 10 characters).' },
        { status: 400 }
      );
    }

    // 1. Fetch active student for relevance scoring
    let student = null;
    if (studentId) {
      student = await prisma.student.findUnique({ where: { id: studentId } });
    }
    if (!student) {
      student = await prisma.student.findFirst();
    }

    let studentProfile: StudentProfile | null = null;
    if (student) {
      studentProfile = {
        id: student.id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        department: student.department,
        branchCode: student.branchCode,
        year: student.year,
        semester: student.semester,
        gpa: student.gpa,
        academicInterests: JSON.parse(student.academicInterests || '[]'),
        careerInterests: JSON.parse(student.careerInterests || '[]'),
        extracurriculars: JSON.parse(student.extracurriculars || '[]'),
      };
    }

    // 2. Call Groq AI to extract strict structured JSON
    const extracted = await extractNoticeStructure(rawText);

    // 3. Persist raw Notice
    const notice = await prisma.notice.create({
      data: {
        title: title || extracted.title,
        rawContent: rawText,
        source: source,
        sourceSender: sourceSender || null,
        fileType: 'TXT',
        receivedAt: new Date(),
      },
    });

    // 4. Calculate personalized relevance score
    let relevanceScore = 75;
    if (studentProfile) {
      relevanceScore = calculateRelevanceScore(
        {
          title: extracted.title,
          summary: extracted.summary,
          category: extracted.category,
          targetBranches: extracted.targetBranches,
          targetYears: extracted.targetYears,
          eligibility: extracted.eligibility,
        },
        studentProfile
      );
    }

    // 5. Persist Extracted Task
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

    return NextResponse.json({
      success: true,
      task: {
        ...task,
        requiredActions: JSON.parse(task.requiredActions),
        targetBranches: JSON.parse(task.targetBranches),
        targetYears: JSON.parse(task.targetYears),
        notice: {
          id: notice.id,
          title: notice.title,
          source: notice.source,
          sourceSender: notice.sourceSender,
          rawContent: notice.rawContent,
          receivedAt: notice.receivedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error in /api/ingest:', error);
    return NextResponse.json(
      { error: 'Failed to process and extract notice with Groq AI' },
      { status: 500 }
    );
  }
}
