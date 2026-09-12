# Timely — Smart Campus AI

> An intelligent assistant that ingests unstructured college notices, circulars, and emails, converting them into personalized, actionable, prioritized student tasks with grounded Groq LLM extraction and RAG querying.

---

## ⚡ Features

- **Zero-Gradient SaaS Aesthetics**: High-craft "Warm Signal" dark slate design system inspired by Linear and Notion.
- **Notice Ingestion Hub**:
  - Raw circular text paste.
  - Batch PDF, DOCX, and TXT document uploads.
  - Gmail Inbox Connection & Pattern Scanner (OAuth 2.0).
- **Groq LLM Structured Extraction**: Strict JSON mode extraction using `llama-3.3-70b-versatile` with zero-failure heuristic fallback.
- **Dynamic Personalization**: Algorithmic relevance scoring (0–100%) tailored to student department, year, GPA, and career goals with instant persona switching.
- **Task Management & Timeline**: Urgency-ranked task cards with action checklists, 7-day upcoming deadline calendar strip, and category filters.
- **Grounded RAG Assistant (⌘K)**: Natural language query drawer synthesizing grounded answers with clickable notice citation chips.
- **Relational Persistence**: SQLite database via Prisma ORM (`Student`, `Notice`, `ExtractedTask`, `ChatMessage`).

---

## 🛠️ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Codrex01/Timely.git
cd Timely
npm install
```

### 2. Configure Environment Variables
Copy the template and set your Groq API key (optional for offline testing):
```bash
cp .env.example .env
```
Edit `.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

### 3. Initialize SQLite Database
```bash
npx prisma db push
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛️ System Architecture

```
Client (Next.js 14 App Router + Tailwind)
  ├── Ingestion Hub (Gmail OAuth, PDF/DOCX, Paste)
  ├── Task Feed & 7-Day Deadline Timeline
  └── Grounded RAG Chat Drawer (⌘K)
       │
Backend & API Routes (/api/*)
  ├── /api/ingest & /api/parse-file & /api/emails/scan
  ├── /api/tasks & /api/profile & /api/chat
  └── src/lib/relevance.ts (Scoring Engine)
       │
AI & Storage Layer
  ├── Groq API (llama-3.3-70b-versatile JSON Mode)
  └── SQLite via Prisma ORM
```

---

## 📄 License
MIT
