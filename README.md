# 💪 LevelUp Fitness


# 📌 Project Overview

**LevelUp Fitness** is a full-stack fitness management platform designed to help users achieve their fitness goals through structured workout plans, progress monitoring, coaching support, and AI-powered fitness guidance.

The platform provides separate experiences for:

- 👤 Users
- 🏋️ Coaches
- 🛠️ Administrators

Users can track workouts, monitor progress, earn XP and rewards, hire coaches, and receive AI fitness recommendations.

Coaches can manage athletes, analyze performance, and create workout programs.

Administrators manage platform operations and system data.

---

# 🚀 Key Features

## 👤 User Features

### Authentication
- User registration
- Secure login
- JWT-based authentication
- Forgot password with email reset link
- Change password
- Protected routes

### Fitness Profile
- Update personal information
- Upload profile picture
- Track body measurements:

  - Height
  - Weight
  - Chest
  - Waist
  - Arms
  - Shoulders
  - Legs
  - Calves

### Workout System
- View workout programs
- Complete workouts
- Track workout history
- Earn XP and coins
- Level progression system
- Streak tracking

### Analytics Dashboard
- Workout statistics
- Progress tracking
- Activity history
- Achievement tracking
- Fitness insights


### AI Fitness Assistant
Integrated AI chatbot providing:

- Workout advice
- Nutrition guidance
- Fitness recommendations
- Training support


---

# 🏋️ Coach Features

- Coach profile management
- Athlete management
- Dashboard statistics
- Athlete analytics
- Workout plan management
- Performance monitoring
- Revenue tracking

---

# 🛠️ Admin Features

- User management
- Coach management
- Exercise management
- Platform monitoring
- System administration

---

# 🤝 Coach Hiring System

Users can discover and hire coaches.

Features:

- Browse available coaches
- Search coaches
- View coach profiles
- Hire coaches using coins
- Transaction tracking
- Automatic commission calculation


---

# 🏗️ System Architecture


```
                 Frontend
                    |
                    |
              REST API Layer
                    |
                    |
              Backend Server
                    |
        -----------------------
        |                     |
   Controllers           Services
        |                     |
        -----------------------
                    |
              Repositories
                    |
                    |
              MongoDB Database

```


The project follows a layered architecture:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Benefits:

- Better maintainability
- Separation of concerns
- Easier testing
- Scalable development


---

# 💻 Technology Stack


## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- React Hooks


## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Zod Validation


## Additional Technologies

- Jest
- Supertest
- Nodemailer
- Google Gemini AI API
- Multer
- bcrypt


---

# 📂 Project Structure


```
LevelUp-Fitness

├── frontend
│
│   ├── app
│   ├── components
│   ├── services
│   ├── hooks
│   └── public
│
│
└── backend
    |
    ├── src
    │
    ├── controllers
    ├── services
    ├── repositories
    ├── models
    ├── routes
    ├── middlewares
    ├── utils
    ├── configs
    |
    └── __tests__
        |
        ├── integration
        |
        └── unit
            └── repositories

```


---

# 🔐 Authentication & Security

Implemented security features:

- JWT token authentication
- Password hashing using bcrypt
- Protected API routes
- Role-based authorization
- Input validation using Zod
- Secure password reset tokens
- File upload validation


User roles:

```
admin
coach
user
```


---

# 🧪 Testing

Testing was performed using:

- Jest
- Supertest
- ts-jest


Testing includes:

## Integration Testing

Covers:

- Authentication APIs
- User APIs
- Workout APIs
- Exercise APIs
- Coach APIs
- Coach hiring APIs


## Unit Testing

Repository layer testing:

- User Repository
- Workout Repository
- Exercise Repository
- Coach Repository
- Coach Hiring Repository
- Workout Completion Repository


### Test Result

```
Test Suites: 11 Passed

Tests: 102 Passed

Failures: 0
```


TypeScript validation:

```
tsc --noEmit

0 Errors
```


---

# ⚙️ Installation Guide


## Clone Repository

```bash
git clone <repository-url>

cd LevelUp-Fitness
```


---

# Backend Setup


Navigate:

```bash
cd backend
```


Install dependencies:

```bash
npm install
```


Create environment file:

```
.env
```


Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

SECRET_KEY=your_secret_key


EMAIL_USER=your_email

EMAIL_PASSWORD=your_email_password


GEMINI_API_KEY=your_google_ai_key
```


Run backend:

```bash
npm run dev
```


Backend runs on:

```
http://localhost:5000
```


---

# Frontend Setup


Navigate:

```bash
cd frontend
```


Install dependencies:

```bash
npm install
```


Run development server:

```bash
npm run dev
```


Frontend runs on:

```
http://localhost:3000
```


---

# 🧪 Running Tests


Backend:

```bash
cd backend

npm test
```


With coverage:

```bash
npm test -- --coverage
```


---

# 📡 API Modules


## Authentication

```
POST   /api/auth/register

POST   /api/auth/login

GET    /api/auth/whoami

PATCH  /api/auth/change-password

POST   /api/auth/forgot-password

POST   /api/auth/reset-password/:token
```


## User

```
PUT    /api/auth/update

GET    /api/users/dashboard

GET    /api/users/analytics

GET    /api/users/streak

GET    /api/users/achievements
```


## Workout

```
GET     /api/v1/workouts

POST    /api/v1/workouts

PUT     /api/v1/workouts/:id

DELETE  /api/v1/workouts/:id
```


## Exercise

```
GET     /api/v1/exercises

POST    /api/v1/exercises

PUT     /api/v1/exercises/:id

DELETE  /api/v1/exercises/:id
```


## Coach Hiring

```
GET     /api/v1/coaches

GET     /api/v1/coaches/:id

POST    /api/v1/coaches/:coachId/hire
```


---

# 📈 Future Improvements

Planned improvements:

- Mobile application version
- Real-time chat between coach and athlete
- Payment gateway integration
- Workout recommendation AI model
- Nutrition planner
- Social fitness community
- Advanced progress visualization


---

# 👨‍💻 Development Team

**LevelUp Fitness**

A full-stack fitness management platform built with modern web technologies.


---

# 📜 License

This project is developed for educational and demonstration purposes.
