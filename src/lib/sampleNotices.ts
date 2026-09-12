import { StudentProfile, SampleEmailNotice } from '@/types';

export const DEMO_STUDENT_PROFILES: StudentProfile[] = [
  {
    id: 'student-cse-3rd-yr',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    rollNo: '22CS084',
    department: 'Computer Science & Engineering',
    branchCode: 'CSE',
    year: 3,
    semester: 6,
    gpa: 8.92,
    academicInterests: ['Distributed Systems', 'Machine Learning', 'Computer Vision', 'Web Architecture'],
    careerInterests: ['Software Engineering', 'AI Engineer', 'Product Management', 'Tier 1 Tech'],
    extracurriculars: ['Coding Club', 'Open Source Community', 'Hackathons'],
  },
  {
    id: 'student-mech-1st-yr',
    name: 'Priya Mukherjee',
    email: 'priya.mukherjee@campus.edu',
    rollNo: '24ME019',
    department: 'Mechanical Engineering',
    branchCode: 'MECH',
    year: 1,
    semester: 2,
    gpa: 8.4,
    academicInterests: ['Engineering Mechanics', 'CAD Modeling', 'Thermodynamics', 'Robotics'],
    careerInterests: ['Automotive Engineering', 'Core Mechanical', 'Renewable Energy'],
    extracurriculars: ['Robotics Club', 'Formula Student Team', 'Music Society'],
  },
  {
    id: 'student-ece-4th-yr',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@campus.edu',
    rollNo: '21EC112',
    department: 'Electronics & Communication',
    branchCode: 'ECE',
    year: 4,
    semester: 8,
    gpa: 9.15,
    academicInterests: ['VLSI Design', 'Embedded Systems', 'IoT', 'Signal Processing'],
    careerInterests: ['Semiconductor Industry', 'Hardware Engineering', 'Firmware Developer'],
    extracurriculars: ['IEEE Student Chapter', 'Electronics Hobby Club'],
  }
];

export const REALISTIC_RAW_NOTICES = [
  {
    title: 'URGENT: Microsoft IDC Campus Recruitment Drive 2026 for SDE-1 Internships & Full-Time',
    source: 'EMAIL' as const,
    sourceSender: 'placement.cell@campus.edu',
    rawContent: `TRAINING AND PLACEMENT CELL
CAMPUS RECRUITMENT NOTICE — REF NO: TPC/2026/MSFT-09

To: 3rd & 4th Year B.Tech / M.Tech Students (CSE, IT, ECE Only)
Date: September 14, 2026

Subject: Microsoft India Development Centre (IDC) - Software Development Engineer (SDE) Hiring 2026

We are pleased to announce that Microsoft India is conducting an on-campus placement and summer internship hiring drive for graduating 2027 (3rd year intern) and 2026 (4th year FTE) batches.

ELIGIBILITY CRITERIA:
- Branches: B.Tech in CSE, IT, ECE with minimum CGPA of 7.5 and no active backlogs.
- Strong proficiency in Data Structures, Algorithms, OS, and System Design.

MANDATORY ACTION STEPS:
1. Register on the Microsoft Careers portal using the campus-specific link shared on the ERP portal.
2. Upload your verified 1-page resume and latest grade card on the Placement ERP by September 20, 2026, 11:59 PM IST.
3. The Online Coding Assessment (OA) will take place on Saturday, September 24, 2026 from 10:00 AM to 12:30 PM.

Failure to submit before the deadline will lead to de-registration from the current drive.

Warm regards,
Prof. S. R. Venkataraman
Head, Training & Placement Cell`,
  },
  {
    title: 'CIRCULAR: Mandatory Mid-Semester Examination Form & Hall Ticket Verification (Even Semester 2026)',
    source: 'PASTE' as const,
    sourceSender: 'dean.academics@campus.edu',
    rawContent: `OFFICE OF THE DEAN OF ACADEMICS & CONTROLLER OF EXAMINATIONS
CIRCULAR NO: ACAD/EXAM/2026/44

To: All Undergraduate & Postgraduate Students (Years 1, 2, 3, 4 - All Branches)
Date: September 12, 2026

Subject: Mid-Semester Examination Schedule & Mandatory Hall Ticket Generation

The Mid-Semester Examinations for the current academic session will commence on October 5, 2026. All students must complete exam registration and fee clearance to download their digital hall tickets.

IMPORTANT INSTRUCTIONS & DEADLINES:
1. Fee Clearance & ERP Form Submission: Complete online exam registration on the student ERP portal on or before September 28, 2026 at 5:00 PM.
2. Minimum Attendance: Attendance threshold of 75% in each subject is strictly enforced. Students with shortages must submit medical/special dispensation certificates to their respective HODs by September 25, 2026.
3. Hall tickets will be made available for download starting October 1, 2026. No student will be admitted into the exam hall without a physical printed copy of the verified hall ticket and college ID.

Controller of Examinations,
Academic Affairs Committee`,
  },
  {
    title: 'Central Sector Scholarship & National Merit Assistance 2026-27 Applications Open',
    source: 'UPLOAD' as const,
    sourceSender: 'scholarships.cell@campus.edu',
    rawContent: `NATIONAL SCHOLARSHIPS CELL / STUDENT WELFARE DEANERY
NOTICE: SWD/SCH/2026/019

Eligible Batches: 1st, 2nd, 3rd, and 4th Year B.Tech Students (All Departments)
Date: September 10, 2026

Subject: Applications for Central Sector Scholarship for College and University Students (CSSS) & Merit-cum-Means Grant

Applications are invited from meritorious and economically weaker students for financial grants for the AY 2026-27.

ELIGIBILITY & VALUE:
- Annual Family income from all sources must not exceed INR 8,00,000 per annum.
- Student must have secured at least 80 percentile in 12th Board / minimum 8.0 CGPA in previous college semesters.
- Scholarship Amount: INR 50,000 per annum + laptop subsidy.

REQUIRED ACTIONS & SUBMISSION:
1. Complete registration on the National Scholarship Portal (NSP 2.0).
2. Submit hard copies of Income Certificate, Domicile Certificate, and Marksheets to Student Welfare Office (Room 104, Admin Block) by September 30, 2026, 4:00 PM.

Dean, Student Affairs`,
  },
  {
    title: 'WORKSHOP: Advanced CAD/CAM SolidWorks & CNC Machining Hands-On Bootcamp',
    source: 'PASTE' as const,
    sourceSender: 'hod.mechanical@campus.edu',
    rawContent: `DEPARTMENT OF MECHANICAL & AEROSPACE ENGINEERING
WORKSHOP ANNOUNCEMENT — MECH/WORK/2026/03

Target Audience: 1st and 2nd Year Mechanical & Production Engineering Students
Date: September 11, 2026

Subject: Intensive 3-Day CAD/CAM, 3D Prototyping and CNC Machining Certification Bootcamp

The Department of Mechanical Engineering is hosting a practical workshop certified by Dassault Systèmes for junior engineering students to master solid modeling and rapid prototyping.

KEY DATES & VENUE:
- Workshop Dates: September 26 - September 28, 2026 (9:00 AM - 5:00 PM)
- Venue: Advanced Robotics & Manufacturing Lab (Room M-201)
- Registration Deadline: September 22, 2026 at 6:00 PM.
- Seats: Limited to 40 participants on a first-come, first-served basis.

Registration link: https://forms.campus.edu/mech-cad-bootcamp2026

Faculty Coordinator:
Dr. K. N. Banerjee, Dept of Mechanical Engineering`,
  },
  {
    title: 'ANNUAL HACKATHON: HackCampus 2026 — 36-Hour AI & Systems Innovation Challenge',
    source: 'UPLOAD' as const,
    sourceSender: 'coding.club@campus.edu',
    rawContent: `CAMPUS CODING CLUB & IEEE STUDENT BRANCH
PRESENTS: HACKCAMPUS 2026 — NATIONAL LEVEL 36-HOUR HACKATHON

Date: September 13, 2026
Audience: All Years & All Branches (Teams of 2 to 4 students)

We are thrilled to announce the 8th edition of HackCampus! Build real-world solutions across AI/ML, Cloud Infrastructure, Web3, Smart Mobility, and Healthcare Tech.

PRIZES & PERKS:
- 1st Prize: INR 1,50,000 + Direct Fast-Track Interview with Sponsor Startups
- 2nd Prize: INR 75,000 | 3rd Prize: INR 40,000
- Free meals, midnight snacks, RedBull, and high-speed Wi-Fi during the event.

CRITICAL TIMELINES:
- Team Registration & Abstract Idea Submission Deadline: October 2, 2026, 11:59 PM.
- Shortlist Announcement: October 6, 2026.
- Offline Grand Finale: October 14 - 15, 2026 at Central Auditorium.

Register your team at: https://hackcampus2026.dev`,
  },
  {
    title: 'ELECTIVE REGISTRATION: Fall 2026 Open Elective Course Allocation for 3rd & 4th Year Students',
    source: 'PASTE' as const,
    sourceSender: 'academics.portal@campus.edu',
    rawContent: `ACADEMIC SECTION CIRCULAR
REF: OE/ALLOC/2026/08

Date: September 13, 2026
To: All 3rd and 4th Year Students (All Engineering Streams)

Subject: Open Elective (OE-1 & OE-2) Course Selection and Priority Preference Submission

The portal for choosing Open Elective courses for the upcoming term will open on September 16, 2026 at 10:00 AM. 

AVAILABLE ELECTIVE BUCKETS:
- Cloud Computing & Distributed Architecture (CS401)
- Robotics & Industrial Automation (ME405)
- Quantitative Finance & Algorithmic Trading (MA412)
- Renewable Energy & Microgrids (EE403)
- Product Management for Engineers (BM401)

ACTIONS REQUIRED:
1. Log into your ERP portal under Academic > Elective Choice.
2. Rank top 5 course preferences in order of choice.
3. Allocation will be computed strictly on CGPA merit.
4. Final Deadline for choice submission: September 19, 2026, 11:59 PM. No changes permitted thereafter.

Academic Registrar`,
  }
];

export const MOCK_EMAIL_INBOX: SampleEmailNotice[] = [
  {
    id: 'mail-001',
    sender: 'placement.cell@campus.edu',
    subject: 'Google India STEP Internship & FTE Recruitment 2026 - Eligibility & Pre-Placement Talk',
    receivedAt: '2 hours ago',
    tag: 'Placement',
    unread: true,
    body: `Dear 2nd, 3rd and 4th Year CSE/IT students,

Google India is visiting our campus for Summer 2027 Internships (2nd & 3rd Year) and Software Engineer roles (4th Year). 
Pre-placement talk (PPT) is scheduled for Sept 18 at 4:30 PM in the Main Auditorium.
You must register on Google's Candidate Portal by Sept 22, 2026, 11:59 PM.
Test date: Sept 27, 2026.
Resume submission is mandatory on the Placement Portal.`,
  },
  {
    id: 'mail-002',
    sender: 'hostel.warden@campus.edu',
    subject: 'Hostel Maintenance & Room Inspection Notice - Block B & C',
    receivedAt: 'Yesterday',
    tag: 'Admin',
    unread: true,
    body: `All hostel residents of Blocks B and C are hereby notified that the semester room inspection and electrical audit will occur on Sept 19, 2026 between 10 AM and 2 PM. Please ensure unauthorized appliances (heaters/induction) are removed immediately.`,
  },
  {
    id: 'mail-003',
    sender: 'library.dean@campus.edu',
    subject: 'Overdue Book Return Amnesty Week & IEEE Xplore Access Renewal',
    receivedAt: '2 days ago',
    tag: 'Academic',
    unread: false,
    body: `Central Library is observing Zero-Fine Return Week from Sept 15 to Sept 22, 2026. Return all overdue reference books without monetary penalties. Also, institutional IEEE Xplore credentials have been renewed for campus Wi-Fi access.`,
  },
  {
    id: 'mail-004',
    sender: 'dean.rnd@campus.edu',
    subject: 'Undergraduate Research Fellowship (UGRF) 2026 — Research Grant of ₹25,000',
    receivedAt: '3 days ago',
    tag: 'Scholarship',
    unread: false,
    body: `Calling all 2nd and 3rd year engineering students with CGPA > 8.0 interested in funded research with faculty labs. Submit a 2-page project proposal by Sept 25, 2026. Selected fellows receive a ₹25,000 stipend and lab compute credits.`,
  }
];
