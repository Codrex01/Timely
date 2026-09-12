import { StudentProfile, ExtractedTaskItem } from '@/types';

/**
 * Calculates a 0-100 relevance score for a task relative to a student's profile.
 * - 80-100: Highly Relevant (Target branch + year + matching interests)
 * - 50-79: Generally Relevant (General campus circular, multi-branch, or elective)
 * - 0-49: Low Relevance / Deprioritized (Different branch or ineligible year)
 */
export function calculateRelevanceScore(
  task: {
    title: string;
    summary: string;
    category: string;
    targetBranches: string[] | string;
    targetYears: number[] | string;
    eligibility?: string;
  },
  student: StudentProfile
): number {
  let score = 50; // base score

  // Normalize branches and years
  const branches: string[] = Array.isArray(task.targetBranches)
    ? task.targetBranches.map((b) => b.toUpperCase())
    : typeof task.targetBranches === 'string'
    ? JSON.parse(task.targetBranches || '["ALL"]').map((b: string) => b.toUpperCase())
    : ['ALL'];

  const years: number[] = Array.isArray(task.targetYears)
    ? task.targetYears
    : typeof task.targetYears === 'string'
    ? JSON.parse(task.targetYears || '[0]')
    : [0];

  const studentBranch = student.branchCode.toUpperCase();
  const studentYear = student.year;

  // 1. Branch Match Logic
  const isBranchAll = branches.includes('ALL') || branches.includes('ANY') || branches.length === 0;
  const isBranchDirectMatch = branches.includes(studentBranch);

  if (isBranchDirectMatch) {
    score += 25;
  } else if (isBranchAll) {
    score += 10;
  } else {
    // Specifically targeted to other branch
    score -= 35;
  }

  // 2. Year Match Logic
  const isYearAll = years.includes(0) || years.length === 0;
  const isYearDirectMatch = years.includes(studentYear);

  if (isYearDirectMatch) {
    score += 20;
  } else if (isYearAll) {
    score += 5;
  } else {
    // Specifically targeted to different year (e.g. 1st year notice for a 4th year student)
    score -= 25;
  }

  // 3. Category & Interest Synergy
  const fullText = `${task.title} ${task.summary} ${task.eligibility || ''}`.toLowerCase();

  // Placement category synergy
  if (task.category === 'PLACEMENT') {
    if (studentYear >= 3) {
      score += 15;
    } else {
      score -= 10;
    }
  }

  // Academic interests keyword matches
  student.academicInterests.forEach((interest) => {
    if (fullText.includes(interest.toLowerCase())) {
      score += 8;
    }
  });

  // Career interests keyword matches
  student.careerInterests.forEach((interest) => {
    if (fullText.includes(interest.toLowerCase())) {
      score += 8;
    }
  });

  // Extracurricular matches
  student.extracurriculars.forEach((club) => {
    if (fullText.includes(club.toLowerCase())) {
      score += 5;
    }
  });

  // Clamp score between 5 and 99
  return Math.min(99, Math.max(5, Math.round(score)));
}
