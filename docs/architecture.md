# StudyWithMe Architecture

## System Overview

StudyWithMe is an ethical, depth-driven educational platform that adapts to student learning levels and provides transparent, accountable tutoring.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        StudyWithMe Platform                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │ Frontend Student │    │Frontend Dashboard│    │   Backend     │ │
│  │    (Next.js)     │────│    (Next.js)     │────│  (Express)    │ │
│  │    Port: 3001    │    │    Port: 3002    │    │  Port: 3000   │ │
│  └──────────────────┘    └──────────────────┘    └───────────────┘ │
│           │                       │                      │         │
│           └───────────────────────┼──────────────────────┘         │
│                                   │                                 │
│                          ┌────────▼────────┐                       │
│                          │   REST API      │                       │
│                          │  /api/chat      │                       │
│                          │  /api/progress  │                       │
│                          │  /api/adaptive  │                       │
│                          │  /api/dashboard │                       │
│                          └────────┬────────┘                       │
│                                   │                                 │
│  ┌────────────────────────────────┼───────────────────────────────┐│
│  │                     Core Services                               ││
│  │                                                                 ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ ││
│  │  │ Depth Engine│  │Ethics Guard │  │ Progress Tracker        │ ││
│  │  │             │  │             │  │                         │ ││
│  │  │ Core/Applied│  │ Input/Output│  │ Student Profiles        │ ││
│  │  │ /Mastery    │  │ Validation  │  │ Learning Events         │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ ││
│  │                                                                 ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ ││
│  │  │ Assignment  │  │  Adaptive   │  │   Dashboard             │ ││
│  │  │ Generator   │  │   Engine    │  │   Aggregator            │ ││
│  │  │             │  │             │  │                         │ ││
│  │  │ Templates   │  │ Path Gen    │  │ Teacher/Institution     │ ││
│  │  │ Evaluator   │  │ Depth Adj   │  │ Metrics                 │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                   │                                 │
│                          ┌────────▼────────┐                       │
│                          │  Gemini AI API  │                       │
│                          │  (Google)       │                       │
│                          └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### Backend (`/backend`)
- **Express.js server** handling all API requests
- **AI Module**: Gemini client, depth engine, prompt builder, ethics guard
- **Progress Module**: Student tracking, insights, adaptive signals
- **Assignment Module**: Generation, evaluation, templates
- **Dashboard Module**: Aggregation and metrics

### Frontend Student (`/frontend-student`)
- **Next.js application** for student interaction
- Chat interface with depth selection
- Assignment practice panel
- Progress overview

### Frontend Dashboard (`/frontend-dashboard`)
- **Next.js application** for educators/admins
- Teacher view: Class progress, at-risk topics
- Institution view: Ethics compliance, system health

## Data Flow

1. **Student sends message** → Frontend → Backend Chat Controller
2. **Ethics Guard** sanitizes input (assignment mode)
3. **Depth Engine** configures response parameters
4. **Gemini API** generates response
5. **Progress Tracker** logs learning event
6. **Response** returned with metadata
7. **Dashboard** aggregates metrics for educators
