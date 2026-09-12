import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@/types';
import { ensureDatabaseSeeded } from '@/lib/seedHelper';

export async function GET(request: NextRequest) {
  try {
    // Automatically seed rich demo data if database is empty (e.g. on fresh Render deployment)
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const minRelevance = searchParams.get('minRelevance');

    const whereClause: any = {};

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (urgency && urgency !== 'ALL') {
      whereClause.urgency = urgency;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    } else {
      // By default, hide dismissed tasks unless explicitly requested
      whereClause.status = { not: 'DISMISSED' };
    }

    if (search && search.trim().length > 0) {
      whereClause.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { eligibility: { contains: search } },
      ];
    }

    if (minRelevance) {
      whereClause.relevanceScore = { gte: parseFloat(minRelevance) };
    }

    const tasks = await prisma.extractedTask.findMany({
      where: whereClause,
      include: {
        notice: true,
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const formattedTasks = tasks.map((t) => ({
      ...t,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      snoozedUntil: t.snoozedUntil ? t.snoozedUntil.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
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

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Error in /api/tasks GET:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, snoozedUntil } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing task id or status' }, { status: 400 });
    }

    const updatedTask = await prisma.extractedTask.update({
      where: { id },
      data: {
        status: status as TaskStatus,
        snoozedUntil: snoozedUntil ? new Date(snoozedUntil) : null,
      },
      include: {
        notice: true,
      },
    });

    return NextResponse.json({
      success: true,
      task: {
        ...updatedTask,
        deadline: updatedTask.deadline ? updatedTask.deadline.toISOString() : null,
        snoozedUntil: updatedTask.snoozedUntil ? updatedTask.snoozedUntil.toISOString() : null,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
        requiredActions: JSON.parse(updatedTask.requiredActions || '[]'),
        targetBranches: JSON.parse(updatedTask.targetBranches || '["ALL"]'),
        targetYears: JSON.parse(updatedTask.targetYears || '[0]'),
      },
    });
  } catch (error) {
    console.error('Error in /api/tasks PATCH:', error);
    return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    await prisma.extractedTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error in /api/tasks DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
