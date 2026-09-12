import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_EMAIL_INBOX } from '@/lib/sampleNotices';
import { extractNoticeStructure } from '@/lib/groq';
import { calculateRelevanceScore } from '@/lib/relevance';
import { StudentProfile, SampleEmailNotice } from '@/types';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('gmail_access_token')?.value;
  const userEmail = cookieStore.get('gmail_user_email')?.value;

  // If real Gmail is connected via OAuth
  if (accessToken) {
    try {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: 'v1', auth });

      // Search real emails with notice-related query keywords
      const q = 'subject:(notice OR circular OR placement OR exam OR deadline OR scholarship OR fee OR hackathon)';
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: q,
        maxResults: 8,
      });

      const messageList = listRes.data.messages || [];
      const realEmails: SampleEmailNotice[] = [];

      for (const msg of messageList) {
        if (!msg.id) continue;
        const msgDetail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'snippet',
        });

        const headers = msgDetail.data.payload?.headers || [];
        const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || 'Campus Circular';
        const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || 'administration@campus.edu';
        const date = headers.find((h) => h.name?.toLowerCase() === 'date')?.value || 'Recent';

        realEmails.push({
          id: msg.id,
          sender: from,
          subject: subject,
          receivedAt: new Date(date).toLocaleDateString() || 'Today',
          body: msgDetail.data.snippet || subject,
          tag: 'Real Gmail',
          unread: true,
        });
      }

      return NextResponse.json({
        isRealGmailConnected: true,
        connectedAccount: userEmail || 'Connected Gmail User',
        inboxCount: realEmails.length,
        emails: realEmails.length > 0 ? realEmails : MOCK_EMAIL_INBOX,
      });
    } catch (err: any) {
      console.warn('Could not pull live Gmail messages (token may be expired):', err.message);
    }
  }

  // Fallback to Demo Inbox
  return NextResponse.json({
    isRealGmailConnected: false,
    connectedAccount: 'aarav.sharma@campus.edu (Demo Mode)',
    inboxCount: MOCK_EMAIL_INBOX.length,
    emails: MOCK_EMAIL_INBOX,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailIds, studentId } = body;

    const cookieStore = cookies();
    const accessToken = cookieStore.get('gmail_access_token')?.value;

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

    let emailsToProcess: { sender: string; subject: string; body: string }[] = [];

    // If real Gmail access token is active
    if (accessToken && Array.isArray(emailIds) && emailIds.length > 0) {
      try {
        const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth });

        for (const id of emailIds) {
          try {
            const detail = await gmail.users.messages.get({
              userId: 'me',
              id: id,
              format: 'snippet',
            });
            const headers = detail.data.payload?.headers || [];
            const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || 'Notice';
            const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || 'campus@edu';
            const body = detail.data.snippet || subject;

            emailsToProcess.push({ sender: from, subject, body });
          } catch {
            // fallback if id not in real gmail
          }
        }
      } catch (err) {
        console.warn('Error fetching individual Gmail messages:', err);
      }
    }

    // Fallback to mock inbox selection if real pull was empty
    if (emailsToProcess.length === 0) {
      const targetMock = Array.isArray(emailIds) && emailIds.length > 0
        ? MOCK_EMAIL_INBOX.filter((e) => emailIds.includes(e.id))
        : MOCK_EMAIL_INBOX;
      emailsToProcess = targetMock.map((e) => ({
        sender: e.sender,
        subject: e.subject,
        body: e.body,
      }));
    }

    const importedTasks = [];

    for (const email of emailsToProcess) {
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
      message: `Extracted ${importedTasks.length} actionable tasks with Groq AI`,
      tasks: importedTasks,
    });
  } catch (error) {
    console.error('Error in /api/emails/scan POST:', error);
    return NextResponse.json(
      { error: 'Failed to process email notice batch' },
      { status: 500 }
    );
  }
}
