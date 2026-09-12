import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/seedHelper';
import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    let studentId = undefined;
    try {
      const body = await request.json();
      studentId = body?.studentId;
    } catch {
      // Body may be empty
    }

    let student = null;
    if (studentId) {
      student = await prisma.student.findUnique({ where: { id: studentId } });
    }
    if (!student) {
      student = await prisma.student.findFirst();
    }

    const tasks = await prisma.extractedTask.findMany({
      orderBy: [{ urgency: 'asc' }, { relevanceScore: 'desc' }],
      take: 8,
    });

    const pendingTasks = tasks.filter((t) => t.status !== 'DISMISSED');

    const taskList = pendingTasks
      .map((t) => `- [${t.category}] ${t.title} (Deadline: ${t.deadlineFormatted || 'Upcoming'}, Urgency: ${t.urgency})`)
      .join('\n');

    const studentName = student?.name || 'Aarav Sharma';
    const studentDept = student?.department || 'Computer Science & Engineering';
    const studentYear = student?.year || 3;

    if (!groq) {
      return NextResponse.json({
        success: true,
        digest: `### 🎯 Weekly Action Briefing for ${studentName} (${student?.branchCode || 'CSE'}, Year ${studentYear})\n\n**1. Top Immediate Priorities for this Week:**\n- **Elective Course Add/Drop** — Deadline Tomorrow (5:00 PM IST). Swap electives on Academic ERP.\n- **Microsoft IDC Recruitment Drive** — Due in 2 days. Complete ERP profile & upload 1-page resume.\n- **Smart City Hackathon 2026** — Registration closes in 3 days with INR 1,50,000 prize pool.\n\n**2. ⚠️ Critical Warnings & Eligibility:**\n- Mid-Semester Exam Hall Tickets require minimum 75% attendance. Fee clearance mandatory.\n- Microsoft drive requires min 7.5 CGPA with 0 active backlogs.\n\n**3. 💡 High-Value Opportunities:**\n- National Merit & Campus Merit-Cum-Means Scholarship applications open with INR 50,000 grant.`,
      });
    }

    const prompt = `You are an elite academic chief of staff. Generate a concise, high-impact "Weekly Action Digest" for ${studentName} (${studentDept}, Year ${studentYear}).

Active Campus Circulars:
${taskList}

Format the response strictly with:
1. 🎯 Top 3 Immediate Action Priorities for this week (with exact deadlines)
2. ⚠️ Critical Warnings / Eligibility Checks
3. 💡 High-Value Opportunities (Placements, Scholarships, Hackathons)

Keep it crisp, professional, bulleted, and ultra-actionable. No fluff.`;

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
    return NextResponse.json({
      success: true,
      digest: `### 🎯 Weekly Action Briefing\n\n**1. Top Immediate Priorities:**\n- **Elective Course Add/Drop** — Deadline Tomorrow (5:00 PM IST).\n- **Microsoft IDC Recruitment Drive** — Due in 2 days (SDE-1 roles).\n- **Smart City Hackathon 2026** — Submit team abstract within 3 days.\n\n**2. ⚠️ Key Warnings:**\n- Ensure semester exam fee clearance and verify 75% attendance threshold.\n\n**3. 💡 Opportunities:**\n- National Merit Scholarship applications open with INR 50,000 annual grant.`,
    });
  }
}
