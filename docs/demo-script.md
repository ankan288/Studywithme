# StudyWithMe Demo Script

## Setup (Pre-Demo)

1. Start backend: `cd backend && npm run dev`
2. Start student frontend: `cd frontend-student && npm run dev`
3. Start dashboard: `cd frontend-dashboard && npm run dev`
4. Ensure Gemini API key is configured in `.env`

## Demo Flow

### Part 1: Introduction (2 min)

**Show**: Landing page with StudyWithMe branding

> "StudyWithMe is an ethical, depth-driven educational platform that adapts to each student's learning level while maintaining academic integrity."

**Key Points**:
- Three depth levels: Core, Applied, Mastery
- Two modes: Learning and Assignment
- Built-in ethics guard
- Transparent dashboards

---

### Part 2: Learning Mode Demo (5 min)

**Show**: Student chat interface

1. **Select Core Depth**
   > "Let's learn about photosynthesis at the Core level."
   
   Type: "What is photosynthesis?"
   
   **Highlight**: Simple explanation, analogy-heavy, ~100 words

2. **Switch to Applied**
   > "Now let's see how the response changes at Applied depth."
   
   Type: "Can you explain photosynthesis with real examples?"
   
   **Highlight**: More detail, 2 examples, practical focus

3. **Switch to Mastery**
   > "At Mastery, we get academic-level depth."
   
   Type: "Explain the light and dark reactions of photosynthesis"
   
   **Highlight**: Technical terms, edge cases, comprehensive

---

### Part 3: Assignment Mode Demo (5 min)

**Show**: Switch to Assignment mode

1. **Trigger Ethics Guard**
   > "Watch what happens when a student tries to get direct answers."
   
   Type: "What is the answer to 2+2?"
   
   **Highlight**: Ethics intervention, Socratic response

2. **Generate Practice**
   > "The system can generate adaptive assignments."
   
   Click "Generate Practice" → Enter "Photosynthesis"
   
   **Highlight**: Structured question, hints, depth-appropriate

3. **Submit Answer**
   > "Let's see conceptual evaluation in action."
   
   Enter a partial answer
   
   **Highlight**: Conceptual scoring, misconceptions identified

---

### Part 4: Dashboard Demo (3 min)

**Show**: Dashboard (localhost:3002)

1. **Teacher View**
   > "Teachers see class progress at a glance."
   
   **Highlight**: Student stats, at-risk topics, depth distribution

2. **Institution View**
   > "Administrators monitor ethics compliance."
   
   Switch to Institution tab
   
   **Highlight**: Compliance rate, system health, transparency log

---

### Part 5: Technical Highlights (3 min)

**Show**: Code snippets or architecture diagram

1. **Depth Engine**
   > "Each depth level has specific constraints."

2. **Ethics Guard**
   > "Pattern matching + prompt rewriting ensures integrity."

3. **Evaluation Metrics**
   > "Every interaction is scored and logged."

---

### Part 6: Q&A (2 min)

Common questions:
- "How does it handle edge cases?"
- "Can students bypass the ethics guard?"
- "How is student data protected?"

---

## Technical Requirements

- Node.js 18+
- Gemini API key
- Modern browser
- Ports 3000, 3001, 3002 available

## Troubleshooting

- **API errors**: Check Gemini key in `.env`
- **CORS issues**: Ensure backend is running
- **Slow responses**: Gemini rate limits may apply
