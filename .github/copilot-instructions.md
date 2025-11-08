# Mood Tracker - AI Agent Instructions

## Project Architecture

This is a full-stack mood tracking application with:
- Frontend: React-based SPA (Create React App)
- Backend: Node.js/Express API with MongoDB

### Key Components

- **Backend** (`/backend`):
  - MongoDB-based mood logging system using Mongoose
  - Main schema: `MoodLog` in `models/MoodLog.js` - handles mood entries with emoji, scale (1-10), triggers, and tips
  - RESTful API routes in `routes/moodRoutes.js` 

- **Frontend** (`/frontend`):
  - React application bootstrapped with Create React App
  - Direct interaction with backend API for CRUD operations

## Development Workflow

### Running the Application

1. Backend:
```bash
cd backend
npm install
npm start  # Starts the server
```

2. Frontend:
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

### Data Model Conventions

When working with mood logs, follow these patterns:
- Emoji field uses standard emoji characters (😡, 😌, 😊, etc.)
- Scale is always 1-10 integer
- Triggers are stored as string arrays
- Timestamps auto-generated using `Date.now`

## Integration Points

- Frontend-Backend Communication:
  - Backend API endpoints handle mood log CRUD operations
  - Frontend makes HTTP requests to these endpoints

## Project-Specific Patterns

1. **Data Validation**:
   - Mongoose schema enforces data types and ranges
   - Required fields: `emoji`, `scale`
   - Optional fields: `triggers`, `tip`

2. **Date Handling**:
   - All timestamps stored in UTC
   - Frontend responsible for local time display

3. **State Management**:
   - Frontend uses React state for UI updates
   - Backend maintains persistent storage in MongoDB