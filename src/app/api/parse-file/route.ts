import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseDocumentBuffer } from '@/lib/fileParser';
import { extractNoticeStructure } from '@/lib/groq';
import { calculateRelevanceScore } from '@/lib/relevance';
import { StudentProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const studentId = formData.get('studentId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for ingestion' }, { status: 400 });
    }

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

    const processedTasks = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = file.name;
      const mimeType = file.type;

      // Extract raw text from file
      const rawContent = await parseDocumentBuffer(buffer, filename, mimeType);

      if (!rawContent || rawContent.trim().length < 10) {
        continue;
      }

      // Structure with Groq AI
      const extracted = await extractNoticeStructure(rawContent);

      const notice = await prisma.notice.create({
        data: {
          title: extracted.title || filename,
          rawContent: rawContent,
          source: 'UPLOAD',
          fileType: filename.split('.').pop()?.toUpperCase() || 'FILE',
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

      processedTasks.push(task);
    }

    return NextResponse.json({
      success: true,
      processedCount: processedTasks.length,
      tasks: processedTasks,
    });
  } catch (error) {
    console.error('Error in /api/parse-file:', error);
    return NextResponse.json(
      { error: 'Failed to process and parse uploaded file(s)' },
      { status: 500 }
    );
  }
}
