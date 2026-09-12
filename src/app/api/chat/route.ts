import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { answerStudentQuery } from '@/lib/groq';
import { StudentProfile, ExtractedTaskItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const whereClause: any = {};
    if (studentId) {
      whereClause.studentId = studentId;
    }

    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      citedNoticeIds: JSON.parse(m.citedNoticeIds || '[]'),
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error in /api/chat GET:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, studentId } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
    }

    // 1. Fetch Student Profile
    let student = null;
    if (studentId) {
      student = await prisma.student.findUnique({ where: { id: studentId } });
    }
    if (!student) {
      student = await prisma.student.findFirst();
    }

    if (!student) {
      return NextResponse.json(
        { error: 'No student profile found. Please initialize demo data.' },
        { status: 400 }
      );
    }

    const studentProfile: StudentProfile = {
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

    // 2. Fetch Tasks and Ingested Notices
    const tasks = await prisma.extractedTask.findMany({
      include: { notice: true },
      orderBy: [{ relevanceScore: 'desc' }, { createdAt: 'desc' }],
    });

    const formattedTasks: ExtractedTaskItem[] = tasks.map((t) => ({
      ...t,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      snoozedUntil: t.snoozedUntil ? t.snoozedUntil.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      category: t.category as any,
      urgency: t.urgency as any,
      status: t.status as any,
      requiredActions: JSON.parse(t.requiredActions || '[]'),
      targetBranches: JSON.parse(t.targetBranches || '["ALL"]'),
      targetYears: JSON.parse(t.targetYears || '[0]'),
      notice: t.notice
        ? {
            id: t.notice.id,
            title: t.notice.title,
            source: t.notice.source as any,
            sourceSender: t.notice.sourceSender,
            rawContent: t.notice.rawContent,
            receivedAt: t.notice.receivedAt.toISOString(),
          }
        : undefined,
    }));

    // 3. Save User Message
    await prisma.chatMessage.create({
      data: {
        studentId: student.id,
        role: 'user',
        content: query,
        citedNoticeIds: JSON.stringify([]),
      },
    });

    // 4. Generate Grounded AI Answer
    const { answer, citedNoticeIds } = await answerStudentQuery(
      query,
      studentProfile,
      formattedTasks
    );

    // 5. Save Assistant Message with Citations
    const assistantMsg = await prisma.chatMessage.create({
      data: {
        studentId: student.id,
        role: 'assistant',
        content: answer,
        citedNoticeIds: JSON.stringify(citedNoticeIds),
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: assistantMsg.id,
        role: 'assistant',
        content: answer,
        citedNoticeIds: citedNoticeIds,
        createdAt: assistantMsg.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/chat POST:', error);
    return NextResponse.json(
      { error: 'Failed to process student query' },
      { status: 500 }
    );
  }
}
