# AI Coding Assistant

A full-stack AI coding assistant web app for generating, explaining, debugging, optimizing, refactoring, converting, testing, documenting, and discussing code.

## Stack

- Frontend: React, Vite, Tailwind CSS, Monaco Editor, Axios, lucide-react
- Backend: FastAPI, SQLAlchemy, JWT auth, bcrypt password hashing
- Database: SQLAlchemy with SQLite for quick local testing and PostgreSQL-ready configuration
- AI: Backend provider layer using `OPENAI_API_KEY`, with demo mode when no key is configured

## Features

- Register, login, logout, and protected dashboard
- Monaco code editor with syntax highlighting, line numbers, formatting, dark/light mode
- AI modes: Generate, Debug, Explain, Optimize, Refactor, Convert, Test Cases, Documentation, Chat
- Structured AI response sections: result, explanation, generated/corrected code, issues, improvements, complexity, tests, documentation
- Conversation history with search, rename, delete, and reopen
- Saved snippets with search, copy, download, delete, and reopen
- Dashboard stats for requests, conversations, snippets, top language, and recent sessions
- Backend-only AI key handling, CORS, input validation, JWT auth, password hashing, rate limiting
- No arbitrary user code execution on the server

## Project Structure

```text
ai-coding-assistant/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The default `DATABASE_URL=sqlite:///./ai_coding_assistant.db` is useful for local testing. For PostgreSQL, set:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/ai_coding_assistant
```

To enable live AI responses, set:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
DEMO_MODE=false
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Sample Prompts

The workspace includes clickable samples, including:

- Create a Java program to find the second largest element in an array.
- Find the bug and explain the fix in a Python function.
- Explain a JavaScript debounce function.
- Generate pytest cases for a palindrome function.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/ai/analyze`
- `GET /api/conversations`
- `GET /api/conversations/{id}`
- `PATCH /api/conversations/{id}`
- `DELETE /api/conversations/{id}`
- `GET /api/snippets`
- `POST /api/snippets`
- `PATCH /api/snippets/{id}`
- `DELETE /api/snippets/{id}`
- `GET /api/dashboard/summary`

The AI endpoint never executes submitted code. It builds a structured prompt, sends it to the configured provider, stores the request and response in the user's conversation history, and returns structured JSON for the UI.
