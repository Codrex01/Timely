import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentProfile } from '@/types';
import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId } = body;

    let student = null;
    if (studentId) {
      student = await prisma.student.findUnique({ where: { id: studentId } });
    }
    if (!student) {
      student = await prisma.student.findFirst();
    }

    const tasks = await prisma.extractedTask.findMany({
      where: { status: 'PENDING' },
      orderBy: [{ urgency: 'asc' }, { relevanceScore: 'desc' }],
      take: 8,
    });

    if (tasks.length === 0) {
      return NextResponse.json({
        digest: 'No pending tasks found. You are completely caught up!',
      });
    }

    const taskList = tasks.map((t) => `- [${t.category}] ${t.title} (Deadline: ${t.deadlineFormatted || t.deadline || 'Ongoing'}, Urgency: ${t.urgency})`).join('\n');

    const prompt = `You are an executive campus advisor. Generate a concise, high-impact "Weekly Action Digest" for ${student?.name || 'the student'} (${student?.department || 'Engineering'}, Year ${student?.year || 3}).

Current Pending Notices:
${taskList}

Format the response strictly with:
1. 🎯 Top 3 Immediate Action Priorities for this week (with exact deadlines)
2. ⚠️ Critical Warnings / Eligibility Checks
3. 💡 High-Value Opportunities (Placements, Scholarships, Hackathons)

Keep it crisp, professional, bulleted, and ultra-actionable. No fluff.`;

    if (!groq) {
      return NextResponse.json({
        digest: `### 🎯 Weekly Action Briefing for ${student?.name || 'Student'}\n\n**Immediate Priorities:**\n1. Review your high-urgency deadlines (${tasks.filter(t => t.urgency === 'CRITICAL').length} critical items)\n2. Verify course registration and exam fees on the student ERP.\n3. Upload your verified resume for campus placement drives.\n\n**Key Deadlines This Week:**\n${tasks.slice(0, 3).map(t => `• ${t.title} (${t.deadlineFormatted || 'Upcoming'})`).join('\n')}`,
      });
    }

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are an elite academic chief of staff generating executive briefings.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const digest = response.choices[0]?.message?.content || 'Failed to generate digest.';

    return NextResponse.json({ success: true, digest });
  } catch (err: any) {
    console.error('Error generating digest:', err);
    return NextResponse.json({ error: 'Failed to generate weekly briefing' }, { status: 500 });
  }
}
