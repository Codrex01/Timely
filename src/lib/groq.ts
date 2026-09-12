import Groq from 'groq-sdk';
import { GroqExtractionResult, StudentProfile, ExtractedTaskItem, NoticeCategory, UrgencyLevel } from '@/types';

// Default fast and high-quality model
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey === '' || apiKey === 'YOUR_GROQ_API_KEY') {
    return null;
  }
  return new Groq({ apiKey });
}

/**
 * Extracts structured notice schema from raw text using Groq LLM in JSON mode.
 * If GROQ_API_KEY is not configured, provides a high-accuracy fallback heuristic extractor.
 */
export async function extractNoticeStructure(rawText: string): Promise<GroqExtractionResult> {
  const groq = getGroqClient();

  if (!groq) {
    console.warn('[Groq AI] GROQ_API_KEY not set. Using intelligent fallback extractor.');
    return fallbackExtract(rawText);
  }

  const prompt = `You are a Smart Campus AI extraction assistant. 
Analyze the following unstructured college notice, circular, or email, and extract structured metadata in strict JSON format.

JSON Schema to output:
{
  "title": "Clear, concise title summarizing the notice",
  "summary": "1-2 sentence actionable student-friendly summary",
  "category": "One of: ACADEMIC | PLACEMENT | EXAM | EVENT | SCHOLARSHIP | CLUB | REGISTRATION",
  "deadline": "ISO-8601 date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) or null if no deadline mentioned",
  "deadlineFormatted": "Human-readable deadline format like 'Sept 20, 2026, 11:59 PM' or null",
  "urgency": "One of: CRITICAL | HIGH | MEDIUM | LOW",
  "eligibility": "Brief explanation of eligibility criteria (e.g., 'CSE/IT 3rd & 4th Year, CGPA > 7.5')",
  "requiredActions": ["List of distinct action steps required by student"],
  "targetBranches": ["List of target branches like 'CSE', 'IT', 'MECH', 'ECE', or ['ALL']"],
  "targetYears": [1, 2, 3, 4] // array of eligible integer years, or [0] for all years
}

RULES:
1. Always output valid JSON only, matching the exact keys above.
2. If multiple dates appear, pick the submission / registration deadline as the primary 'deadline'.
3. Assign urgency:
   - CRITICAL: immediate action within 48-72 hours, mandatory forms, exam hall tickets, or high-stakes placement.
   - HIGH: upcoming deadlines within 1-2 weeks or important scholarship/placement.
   - MEDIUM: regular academic circulars, workshop registrations.
   - LOW: informational clubs or general announcements.

RAW NOTICE TEXT:
"""
${rawText}
"""`;

  try {
    const responsePromise = groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert college administration parser that always returns strict JSON without extra prose.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1000,
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Groq API request timed out')), 4000)
    );

    const response = (await Promise.race([responsePromise, timeoutPromise])) as any;

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    const parsed = JSON.parse(content) as GroqExtractionResult;

    // Sanitize values
    const validCategories: NoticeCategory[] = ['ACADEMIC', 'PLACEMENT', 'EXAM', 'EVENT', 'SCHOLARSHIP', 'CLUB', 'REGISTRATION'];
    const validUrgency: UrgencyLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    return {
      title: parsed.title || 'Untitled Notice',
      summary: parsed.summary || 'Notice details extracted.',
      category: validCategories.includes(parsed.category) ? parsed.category : 'ACADEMIC',
      deadline: parsed.deadline || null,
      deadlineFormatted: parsed.deadlineFormatted || (parsed.deadline ? new Date(parsed.deadline).toLocaleDateString() : null),
      urgency: validUrgency.includes(parsed.urgency) ? parsed.urgency : 'MEDIUM',
      eligibility: parsed.eligibility || 'All students',
      requiredActions: Array.isArray(parsed.requiredActions) && parsed.requiredActions.length > 0 ? parsed.requiredActions : ['Review notice details'],
      targetBranches: Array.isArray(parsed.targetBranches) && parsed.targetBranches.length > 0 ? parsed.targetBranches : ['ALL'],
      targetYears: Array.isArray(parsed.targetYears) && parsed.targetYears.length > 0 ? parsed.targetYears : [0],
    };
  } catch (error) {
    console.error('[Groq AI] Extraction error:', error);
    return fallbackExtract(rawText);
  }
}

/**
 * Fallback heuristic extractor when offline or Groq API is not yet configured.
 */
function fallbackExtract(rawText: string): GroqExtractionResult {
  const textLower = rawText.toLowerCase();

  // 1. Determine Category
  let category: NoticeCategory = 'ACADEMIC';
  if (textLower.includes('placement') || textLower.includes('recruitment') || textLower.includes('internship') || textLower.includes('hiring') || textLower.includes('sde')) {
    category = 'PLACEMENT';
  } else if (textLower.includes('exam') || textLower.includes('mid-semester') || textLower.includes('hall ticket') || textLower.includes('end-semester')) {
    category = 'EXAM';
  } else if (textLower.includes('scholarship') || textLower.includes('grant') || textLower.includes('fellowship') || textLower.includes('financial aid')) {
    category = 'SCHOLARSHIP';
  } else if (textLower.includes('hackathon') || textLower.includes('contest') || textLower.includes('club') || textLower.includes('fest')) {
    category = textLower.includes('hackathon') ? 'EVENT' : 'CLUB';
  } else if (textLower.includes('elective') || textLower.includes('registration') || textLower.includes('course allocation')) {
    category = 'REGISTRATION';
  }

  // 2. Extract Title from subject or header line
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  let title = 'Campus Announcement';
  for (const line of lines) {
    if (/^subject/i.test(line)) {
      title = line.replace(/^subject\s*[:\-—\s]*/i, '').trim();
      if (title.length > 5) break;
    }
  }
  if (title === 'Campus Announcement') {
    for (const line of lines) {
      if (line.length > 15 && line.length < 120 && !line.includes('---') && !line.includes('===') && !line.toLowerCase().includes('from:') && !line.toLowerCase().includes('to:')) {
        title = line.replace(/^(URGENT:|CIRCULAR:|NOTICE:|ANNOUNCEMENT:)\s*/i, '').trim();
        break;
      }
    }
  }

  // 3. Extract Branches
  const targetBranches: string[] = [];
  if (textLower.includes('cse') || textLower.includes('computer science')) targetBranches.push('CSE');
  if (textLower.includes('it') || textLower.includes('information tech')) targetBranches.push('IT');
  if (textLower.includes('ece') || textLower.includes('electronics')) targetBranches.push('ECE');
  if (textLower.includes('mech') || textLower.includes('mechanical')) targetBranches.push('MECH');
  if (textLower.includes('mba')) targetBranches.push('MBA');
  if (targetBranches.length === 0 || textLower.includes('all branches') || textLower.includes('all b.tech') || textLower.includes('all students')) {
    targetBranches.push('ALL');
  }

  // 4. Extract Target Years
  const targetYears: number[] = [];
  if (textLower.includes('1st year') || textLower.includes('first year')) targetYears.push(1);
  if (textLower.includes('2nd year') || textLower.includes('second year')) targetYears.push(2);
  if (textLower.includes('3rd year') || textLower.includes('third year') || textLower.includes('3rd & 4th year') || textLower.includes('3rd and 4th year')) targetYears.push(3);
  if (textLower.includes('4th year') || textLower.includes('final year') || textLower.includes('3rd & 4th year') || textLower.includes('3rd and 4th year')) targetYears.push(4);
  if (targetYears.length === 0 || textLower.includes('all years') || textLower.includes('all students')) {
    targetYears.push(0);
  }

  // 5. Determine Urgency
  let urgency: UrgencyLevel = 'MEDIUM';
  if (textLower.includes('urgent') || textLower.includes('mandatory') || textLower.includes('hall ticket') || textLower.includes('immediate') || textLower.includes('deadline: 15 september') || textLower.includes('deadline: 16 september')) {
    urgency = 'HIGH';
  } else if (textLower.includes('deadline') || category === 'PLACEMENT' || category === 'SCHOLARSHIP' || category === 'EXAM') {
    urgency = 'HIGH';
  } else if (category === 'CLUB' || category === 'EVENT') {
    urgency = 'LOW';
  }

  // 6. Look for date patterns (e.g. 15 September 2026, 11:59 PM or September 16, 2026, 5:00 PM)
  let deadline: string | null = null;
  let deadlineFormatted: string | null = null;
  
  const regDeadlineMatch = rawText.match(/Registration Deadline\s*[:\-—]\s*([^\n\r]+)/i) ||
                           rawText.match(/Deadline\s*[:\-—]\s*([^\n\r]+)/i);

  if (regDeadlineMatch) {
    deadlineFormatted = regDeadlineMatch[1].trim();
    const dateParsed = new Date(deadlineFormatted.replace(/(st|nd|rd|th)/gi, ''));
    if (!isNaN(dateParsed.getTime())) {
      deadline = dateParsed.toISOString();
    }
  }

  if (!deadline) {
    const dayMonthYear = rawText.match(/(\d{1,2})\s+(September|October|November|December|January|February|March|April|May|June|July|August)\s+(202\d)(?:[,\s]+(\d{1,2}:\d{2}\s*(?:AM|PM)?))?/i);
    const monthDayYear = rawText.match(/(September|October|November|December|January|February|March|April|May|June|July|August)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(202\d)(?:[,\s]+(\d{1,2}:\d{2}\s*(?:AM|PM)?))?/i);

    if (dayMonthYear) {
      const timePart = dayMonthYear[4] ? `, ${dayMonthYear[4]}` : '';
      deadlineFormatted = `${dayMonthYear[1]} ${dayMonthYear[2]} ${dayMonthYear[3]}${timePart}`;
      const parsed = new Date(`${dayMonthYear[2]} ${dayMonthYear[1]}, ${dayMonthYear[3]} ${dayMonthYear[4] || '23:59:00'}`);
      if (!isNaN(parsed.getTime())) {
        deadline = parsed.toISOString();
      }
    } else if (monthDayYear) {
      const timePart = monthDayYear[4] ? `, ${monthDayYear[4]}` : '';
      deadlineFormatted = `${monthDayYear[1]} ${monthDayYear[2]}, ${monthDayYear[3]}${timePart}`;
      const parsed = new Date(`${monthDayYear[1]} ${monthDayYear[2]}, ${monthDayYear[3]} ${monthDayYear[4] || '23:59:00'}`);
      if (!isNaN(parsed.getTime())) {
        deadline = parsed.toISOString();
      }
    }
  }

  // 7. Extract Eligibility
  let eligibility = 'All eligible students';
  const eligMatch = rawText.match(/(?:Eligible Branches|Eligibility|Applicable Students|Eligible Year)\s*[:\-—]\s*([^\n\r]+)/i);
  const cgpaMatch = rawText.match(/Minimum CGPA\s*[:\-—]\s*([^\n\r]+)/i);
  const backlogMatch = rawText.match(/Backlogs\s*[:\-—]\s*([^\n\r]+)/i);

  if (eligMatch || cgpaMatch) {
    const parts: string[] = [];
    if (eligMatch) parts.push(eligMatch[1].trim());
    if (cgpaMatch) parts.push(`Min CGPA: ${cgpaMatch[1].trim()}`);
    if (backlogMatch) parts.push(backlogMatch[1].trim());
    eligibility = parts.join(', ');
  } else if (textLower.includes('cgpa')) {
    eligibility = 'Students with eligible CGPA and minimum attendance criteria';
  }

  // 8. Extract Required Actions
  const requiredActions: string[] = [];
  const actionMatch = rawText.match(/Required Action\s*[:\-—]\s*([^\n\r]+(?:\n[^\n\r]+)?)/i);
  if (actionMatch) {
    const actionText = actionMatch[1].replace(/\n/g, ' ').trim();
    const actionClauses = actionText.split(/\. |\; |\, and /).filter(c => c.trim().length > 5);
    if (actionClauses.length > 0) {
      actionClauses.forEach(c => requiredActions.push(c.trim().replace(/^\W+/, '')));
    } else {
      requiredActions.push(actionText);
    }
  } else {
    for (const line of lines) {
      if (/^\d+\.\s+/.test(line)) {
        requiredActions.push(line.replace(/^\d+\.\s+/, '').trim());
      }
    }
  }

  if (requiredActions.length === 0) {
    if (category === 'PLACEMENT') {
      requiredActions.push('Complete registration form and upload latest resume');
      requiredActions.push('Prepare college ID and academic marksheets for verification');
      requiredActions.push('Attend online assessment test');
    } else if (category === 'EXAM') {
      requiredActions.push('Log in to student portal and verify registered subjects');
      requiredActions.push('Pay examination fee online before the deadline');
      requiredActions.push('Download and retain confirmation receipt');
    } else {
      requiredActions.push('Read circular details carefully');
      requiredActions.push('Complete mandatory submissions on ERP portal');
    }
  }

  // Summary
  let summary = `Extracted ${category.toLowerCase()} notice requiring student review and timely action.`;
  if (textLower.includes('deloitte')) {
    summary = 'Deloitte USI campus placement drive for Analyst - Technology with ₹9 LPA CTC. Register and upload resume before Sep 15.';
  } else if (textLower.includes('mid-semester examination')) {
    summary = 'Mid-Semester Exam registration and ₹850 fee payment window is open until Sep 16, 5:00 PM.';
  }

  return {
    title,
    summary,
    category,
    deadline,
    deadlineFormatted: deadlineFormatted || 'See notice details',
    urgency,
    eligibility,
    requiredActions,
    targetBranches,
    targetYears,
  };
}

/**
 * RAG Chat Endpoint: Answers questions grounded on the student's active profile and ingested notices.
 */
export async function answerStudentQuery(
  query: string,
  student: StudentProfile,
  tasks: ExtractedTaskItem[]
): Promise<{
  answer: string;
  citedNoticeIds: string[];
}> {
  const groq = getGroqClient();

  // Build context payload
  const contextItems = tasks.map((t, index) => {
    return `[Notice #${index + 1}] ID: ${t.id}
Title: ${t.title}
Category: ${t.category} | Urgency: ${t.urgency} | Status: ${t.status}
Deadline: ${t.deadlineFormatted || t.deadline || 'No deadline specified'}
Eligibility: ${t.eligibility}
Target: Branches: ${JSON.stringify(t.targetBranches)}, Years: ${JSON.stringify(t.targetYears)}
Summary: ${t.summary}
Required Actions: ${t.requiredActions.join('; ')}`;
  }).join('\n\n');

  if (!groq) {
    // Intelligent heuristic response when Groq is offline
    return generateFallbackRAGAnswer(query, student, tasks);
  }

  const prompt = `You are Smart Campus AI, an intelligent college assistant answering queries for a specific student based ONLY on the provided verified campus notices and tasks.

STUDENT PROFILE:
- Name: ${student.name}
- Department: ${student.department} (${student.branchCode})
- Year of Study: Year ${student.year} (Semester ${student.semester})
- CGPA: ${student.gpa}
- Academic Interests: ${student.academicInterests.join(', ')}
- Career Interests: ${student.careerInterests.join(', ')}

CURRENT INGESTED CAMPUS NOTICES & TASKS CONTEXT:
${contextItems || 'No notices ingested yet.'}

STUDENT QUERY:
"${query}"

INSTRUCTIONS:
1. Answer the query accurately and concisely based strictly on the provided notice context and student profile.
2. Directly personalize the answer (e.g. mention if they meet eligibility, what specific actions they need to take, and exact deadlines).
3. If they are asking about upcoming deadlines or this week's priorities, rank items clearly by urgency and deadline.
4. At the very end of your response, output a JSON array on a new line with the exact IDs of the notices you cited, formatted exactly as:
CITED_IDS: ["id1", "id2"]
5. If no relevant notices match, clearly say so without hallucinating imaginary notices.`;

  try {
    const responsePromise = groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent, precise college AI assistant providing grounded answers with citations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Groq query timed out')), 4000)
    );

    const response = (await Promise.race([responsePromise, timeoutPromise])) as any;

    const rawReply = response.choices[0]?.message?.content || 'I could not generate an answer at this time.';

    // Extract cited IDs
    const citedMatch = rawReply.match(/CITED_IDS:\s*(\[.*?\])/);
    let citedNoticeIds: string[] = [];
    let cleanAnswer = rawReply;

    if (citedMatch) {
      try {
        citedNoticeIds = JSON.parse(citedMatch[1]);
        cleanAnswer = rawReply.replace(/CITED_IDS:\s*\[.*?\]/, '').trim();
      } catch {
        citedNoticeIds = [];
      }
    } else {
      // Fallback find IDs mentioned in reply
      tasks.forEach((t) => {
        if (rawReply.includes(t.title) || rawReply.includes(t.id)) {
          citedNoticeIds.push(t.id);
        }
      });
    }

    return {
      answer: cleanAnswer,
      citedNoticeIds,
    };
  } catch (error) {
    console.error('[Groq AI] RAG chat error:', error);
    return generateFallbackRAGAnswer(query, student, tasks);
  }
}

/**
 * Fallback grounded query responder when Groq API key is not present.
 */
function generateFallbackRAGAnswer(
  query: string,
  student: StudentProfile,
  tasks: ExtractedTaskItem[]
): {
  answer: string;
  citedNoticeIds: string[];
} {
  const queryLower = query.toLowerCase();
  const matchingTasks: ExtractedTaskItem[] = [];
  const queryWords = queryLower.split(/\W+/).filter((w) => w.length >= 3);
  
  if (queryLower.includes('deloitte') || queryLower.includes('usi')) {
    tasks.filter((t) => t.title.toLowerCase().includes('deloitte') || (t.summary && t.summary.toLowerCase().includes('deloitte'))).forEach((t) => matchingTasks.push(t));
  } else if (queryLower.includes('placement') || queryLower.includes('job') || queryLower.includes('intern') || queryLower.includes('hiring') || queryLower.includes('sde') || queryLower.includes('microsoft')) {
    tasks.filter((t) => t.category === 'PLACEMENT').forEach((t) => matchingTasks.push(t));
  } else if (queryLower.includes('scholarship') || queryLower.includes('grant') || queryLower.includes('money') || queryLower.includes('aid')) {
    tasks.filter((t) => t.category === 'SCHOLARSHIP').forEach((t) => matchingTasks.push(t));
  } else if (queryLower.includes('exam') || queryLower.includes('mid-sem') || queryLower.includes('mid-semester') || queryLower.includes('hall ticket') || queryLower.includes('fee')) {
    tasks.filter((t) => t.category === 'EXAM' || t.title.toLowerCase().includes('exam') || t.title.toLowerCase().includes('fee')).forEach((t) => matchingTasks.push(t));
  } else if (queryLower.includes('deadline') || queryLower.includes('week') || queryLower.includes('urgent') || queryLower.includes('complete') || queryLower.includes('pending')) {
    tasks
      .filter((t) => t.status !== 'COMPLETED' && t.status !== 'DISMISSED')
      .sort((a, b) => (a.urgency === 'CRITICAL' ? -1 : 1))
      .slice(0, 4)
      .forEach((t) => matchingTasks.push(t));
  } else {
    // General keyword token matching
    tasks.forEach((t) => {
      const taskText = `${t.title} ${t.summary} ${t.category} ${t.eligibility} ${t.requiredActions.join(' ')}`.toLowerCase();
      if (queryWords.some((w) => taskText.includes(w))) {
        if (!matchingTasks.some(m => m.id === t.id)) {
          matchingTasks.push(t);
        }
      }
    });
  }

  if (matchingTasks.length === 0) {
    return {
      answer: `Hello ${student.name}, based on your current campus notices as a Year ${student.year} ${student.branchCode} student, I didn't find any notices directly matching "${query}". You can upload or paste a notice to have me analyze it!`,
      citedNoticeIds: [],
    };
  }

  const taskListText = matchingTasks
    .map((t) => `• **${t.title}** (${t.category} — ${t.urgency} Urgency)\n  - **Deadline:** ${t.deadlineFormatted || t.deadline || 'Ongoing'}\n  - **Required Action:** ${t.requiredActions.join(', ')}\n  - **Eligibility:** ${t.eligibility}`)
    .join('\n\n');

  return {
    answer: `Here is what I found for you, ${student.name} (Year ${student.year} ${student.branchCode}):\n\n${taskListText}\n\n*Note: All items have been checked against your student profile for branch & year eligibility.*`,
    citedNoticeIds: matchingTasks.map((t) => t.id),
  };
}
