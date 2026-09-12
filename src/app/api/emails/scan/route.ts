import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_EMAIL_INBOX } from '@/lib/sampleNotices';
import { extractNoticeStructure } from '@/lib/groq';
import { calculateRelevanceScore } from '@/lib/relevance';
import { StudentProfile } from '@/types';

export async function GET(request: NextRequest) {
  // Returns list of emails in the connected inbox
  return NextResponse.json({
    connectedAccount: 'aarav.sharma@campus.edu',
    inboxCount: MOCK_EMAIL_INBOX.length,
    emails: MOCK_EMAIL_INBOX,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailIds, studentId } = body;

    // Fetch active student
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

    const targetEmails = Array.isArray(emailIds) && emailIds.length > 0
      ? MOCK_EMAIL_INBOX.filter((e) => emailIds.includes(e.id))
      : MOCK_EMAIL_INBOX;

    const importedTasks = [];

    for (const email of targetEmails) {
      const extracted = await extractNoticeStructure(
        `From: ${email.sender}\nSubject: ${email.subject}\n\n${email.body}`
      );

      const notice = await prisma.notice.create({
        data: {
          title: email.subject,
          rawContent: email.body,
          source: 'EMAIL',
          sourceSender: email.sender,
          fileType: 'EMAIL',
          receivedAt: new Date(),
        },
      });

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

      importedTasks.push(task);
    }

    return NextResponse.json({
      success: true,
      message: `Scanned and ingested ${importedTasks.length} email notices with Groq AI`,
      tasks: importedTasks,
    });
  } catch (error) {
    console.error('Error in /api/emails/scan:', error);
    return NextResponse.json(
      { error: 'Failed to scan inbox emails' },
      { status: 500 }
    );
  }
}
