import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/seedHelper';

export async function POST() {
  try {
    // 1. Clear existing records for fresh clean reset
    await prisma.chatMessage.deleteMany({});
    await prisma.extractedTask.deleteMany({});
    await prisma.notice.deleteMany({});
    await prisma.student.deleteMany({});

    // 2. Run instant deterministic auto-seeder
    await ensureDatabaseSeeded();

    const studentsCount = await prisma.student.count();
    const noticesCount = await prisma.notice.count();
    const tasksCount = await prisma.extractedTask.count();

    return NextResponse.json({
      success: true,
      message: 'Demo dataset initialized successfully',
      studentsCount,
      noticesCount,
      tasksCount,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
