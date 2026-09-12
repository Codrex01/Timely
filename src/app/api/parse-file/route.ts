import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseDocumentBuffer } from '@/lib/fileParser';
import { extractNoticeStructure } from '@/lib/groq';
import { calculateRelevanceScore } from '@/lib/relevance';
import { ensureDatabaseSeeded } from '@/lib/seedHelper';
import { StudentProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const studentId = formData.get('studentId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for ingestion' }, { status: 400 });
    }

    // Fetch active student with fallback
    let student = null;
    if (studentId) {
      student = await prisma.student.findUnique({ where: { id: studentId } });
    }
    if (!student) {
      student = await prisma.student.findFirst();
    }

    const studentProfile: StudentProfile = {
      id: student?.id || 'student-cse-3rd-yr',
      name: student?.name || 'Aarav Sharma',
      email: student?.email || 'aarav.sharma@campus.edu',
      rollNo: student?.rollNo || '22CS084',
      department: student?.department || 'Computer Science & Engineering',
      branchCode: student?.branchCode || 'CSE',
      year: student?.year || 3,
      semester: student?.semester || 6,
      gpa: student?.gpa || 8.92,
      academicInterests: JSON.parse(student?.academicInterests || '["Software Engineering"]'),
      careerInterests: JSON.parse(student?.careerInterests || '["Software Engineering"]'),
      extracurriculars: JSON.parse(student?.extracurriculars || '["Coding Club"]'),
    };

    const processedTasks = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = file.name;
      const mimeType = file.type;

      // Extract raw text from file using robust multi-strategy parser
      let rawContent = await parseDocumentBuffer(buffer, filename, mimeType);

      if (!rawContent || rawContent.trim().length < 5) {
        rawContent = `Uploaded Campus Document: ${filename}\nFile Size: ${(buffer.length / 1024).toFixed(1)} KB\nPlease review the attached official PDF circular on the college notice portal.`;
      }

      // Structure with Groq AI (or heuristic fallback)
      const extracted = await extractNoticeStructure(rawContent);

      const notice = await prisma.notice.create({
        data: {
          title: extracted.title || filename.replace(/\.[^/.]+$/, ''),
          rawContent: rawContent,
          source: 'UPLOAD',
          sourceSender: 'Uploaded Document',
          fileType: filename.split('.').pop()?.toUpperCase() || 'PDF',
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
        studentProfile
      );

      const task = await prisma.extractedTask.create({
        data: {
          noticeId: notice.id,
          title: extracted.title || filename.replace(/\.[^/.]+$/, ''),
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

      processedTasks.push({
        ...task,
        deadline: task.deadline ? task.deadline.toISOString() : null,
        requiredActions: JSON.parse(task.requiredActions || '[]'),
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: processedTasks.length,
      tasks: processedTasks,
    });
  } catch (error: any) {
    console.error('Error in /api/parse-file:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process and parse uploaded file(s)' },
      { status: 500 }
    );
  }
}
