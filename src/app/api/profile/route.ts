import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRelevanceScore } from '@/lib/relevance';
import { StudentProfile } from '@/types';
import { ensureDatabaseSeeded } from '@/lib/seedHelper';

export async function GET(request: NextRequest) {
  try {
    // Automatically seed rich demo data if database is empty (e.g. on fresh Render deployment)
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    let student = null;
    if (studentId) {
      student = await prisma.student.findUnique({ where: { id: studentId } });
    }

    if (!student) {
      student = await prisma.student.findFirst();
    }

    if (!student) {
      return NextResponse.json({ error: 'No student profiles found. Please seed data first.' }, { status: 404 });
    }

    const allStudents = await prisma.student.findMany();

    const formattedActive: StudentProfile = {
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

    const formattedAll: StudentProfile[] = allStudents.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      rollNo: s.rollNo,
      department: s.department,
      branchCode: s.branchCode,
      year: s.year,
      semester: s.semester,
      gpa: s.gpa,
      academicInterests: JSON.parse(s.academicInterests || '[]'),
      careerInterests: JSON.parse(s.careerInterests || '[]'),
      extracurriculars: JSON.parse(s.extracurriculars || '[]'),
    }));

    return NextResponse.json({
      activeStudent: formattedActive,
      availableProfiles: formattedAll,
    });
  } catch (error) {
    console.error('Error in /api/profile GET:', error);
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, department, branchCode, year, semester, gpa, academicInterests, careerInterests, extracurriculars } = body;

    let student;
    if (id) {
      student = await prisma.student.upsert({
        where: { id },
        update: {
          name,
          email,
          department,
          branchCode,
          year: Number(year),
          semester: Number(semester || 1),
          gpa: Number(gpa || 8.0),
          academicInterests: JSON.stringify(academicInterests || []),
          careerInterests: JSON.stringify(careerInterests || []),
          extracurriculars: JSON.stringify(extracurriculars || []),
        },
        create: {
          id,
          name,
          email,
          department,
          branchCode,
          year: Number(year),
          semester: Number(semester || 1),
          gpa: Number(gpa || 8.0),
          academicInterests: JSON.stringify(academicInterests || []),
          careerInterests: JSON.stringify(careerInterests || []),
          extracurriculars: JSON.stringify(extracurriculars || []),
        },
      });
    }

    // Recompute relevance score for all existing tasks against this student!
    const activeStudentProfile: StudentProfile = {
      id: student?.id || id,
      name: name || student?.name,
      email: email || student?.email,
      department: department || student?.department,
      branchCode: branchCode || student?.branchCode,
      year: Number(year || student?.year),
      semester: Number(semester || student?.semester || 1),
      gpa: Number(gpa || student?.gpa || 8.0),
      academicInterests: academicInterests || JSON.parse(student?.academicInterests || '[]'),
      careerInterests: careerInterests || JSON.parse(student?.careerInterests || '[]'),
      extracurriculars: extracurriculars || JSON.parse(student?.extracurriculars || '[]'),
    };

    const tasks = await prisma.extractedTask.findMany();
    for (const t of tasks) {
      const score = calculateRelevanceScore(
        {
          title: t.title,
          summary: t.summary,
          category: t.category,
          targetBranches: t.targetBranches,
          targetYears: t.targetYears,
          eligibility: t.eligibility,
        },
        activeStudentProfile
      );

      await prisma.extractedTask.update({
        where: { id: t.id },
        data: { relevanceScore: score },
      });
    }

    return NextResponse.json({ success: true, student: activeStudentProfile });
  } catch (error) {
    console.error('Error in /api/profile POST:', error);
    return NextResponse.json({ error: 'Failed to update student profile' }, { status: 500 });
  }
}
