# AI Travel Planner

## Project Overview

AI Travel Planner is a full-stack web application that helps users generate personalized travel itineraries using Google's Gemini AI.

Users can:

- Register and Login
- Generate AI-powered travel plans
- View estimated trip budgets
- Get hotel recommendations
- Edit itineraries
- Regenerate specific days
- Save and manage trips
- Delete trips

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Gemini AI API

---

## Architecture

Frontend (Next.js)
↓
Express REST API
↓
JWT Authentication Middleware
↓
MongoDB Atlas

Gemini AI
↑
Trip Generation

---

## Authentication & Authorization

Authentication is implemented using JWT tokens.

Features:

- User Registration
- User Login
- Protected Routes
- User-specific trip access
- Complete data isolation

Users cannot access or modify trips belonging to other users.

---

## AI Agent Design

Gemini AI is used to generate:

- Day-by-day itinerary
- Budget estimation
- Hotel recommendations

User inputs:

- Destination
- Duration
- Budget Tier
- Interests

The backend sends a structured prompt to Gemini and stores the generated JSON response in MongoDB.

---

## Custom Feature

### Trip History Dashboard

A dashboard displays all previously generated trips.

Benefits:

- Revisit old trips
- Edit itineraries
- Regenerate specific days
- Delete trips

This improves usability and trip management.

---

## API Endpoints

### Auth

POST /api/auth/register

POST /api/auth/login

### Trips

GET /api/trips

POST /api/trips/generate

PUT /api/trips/:id

DELETE /api/trips/:id

POST /api/trips/:id/regenerate-day

---

## Environment Variables

Backend .env

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

PORT=5000

Frontend .env.local

NEXT_PUBLIC_API_URL=

---

## Local Setup

Backend

```bash
npm install
npm run dev
```

Frontend

```bash
npm install
npm run dev
```

---

## Deployment

Frontend deployed on Vercel

Backend deployed on Render

---

## Design Decisions

- MongoDB chosen for flexible itinerary storage
- JWT for scalable authentication
- Gemini AI for itinerary generation
- REST APIs for frontend-backend communication

---

## Known Limitations

- AI responses may vary
- Hotel recommendations are AI-generated
- Weather integration not implemented
