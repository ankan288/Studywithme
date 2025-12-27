# StudyWithMe

<div align="center">
  <h3>Ethical Depth-Driven Learning Platform</h3>
  <p>An educational tutor that adapts to student learning levels while maintaining academic integrity.</p>
</div>

## Features

- **Three Depth Levels**: Core (fundamentals), Applied (practice), Mastery (deep dive)
- **Two Learning Modes**: Interactive Learning and Assignment Help
- **Ethics Guard**: Prevents direct answers in assignment mode
- **Adaptive Engine**: Automatically suggests depth adjustments
- **Dashboard**: Real-time analytics for teachers and institutions

## Project Structure

```
studywithme/
├── backend/           # Express.js API server
├── frontend-student/  # Next.js student interface
├── frontend-dashboard/# Next.js admin dashboard
└── docs/             # Documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Installation

```bash
# Install all dependencies
npm run install:all

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Add your Gemini API key to backend/.env
```

### Development

```bash
# Run all services concurrently
npm run dev

# Or run individually:
npm run dev:backend    # http://localhost:3000
npm run dev:student    # http://localhost:3001
npm run dev:dashboard  # http://localhost:3002
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/chat/message` | Send chat message |
| `POST /api/assignments/generate` | Generate assignment |
| `POST /api/assignments/evaluate` | Evaluate answer |
| `GET /api/progress/summary/:id` | Get student progress |
| `GET /api/adaptive/path/:id` | Get learning path |
| `GET /api/dashboard/metrics` | Get dashboard metrics |

## Documentation

- [Architecture](docs/architecture.md)
- [Ethics Framework](docs/ethics.md)
- [Depth Engine](docs/depth-engine.md)
- [Evaluation Metrics](docs/evaluation-metrics.md)
- [Demo Script](docs/demo-script.md)

## License

MIT
