# Interview Coordinator - Frontend

React + TypeScript frontend for the Interview Coordinator application.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Project Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Input, etc.)
│   ├── InterviewCard.tsx
│   ├── InterviewForm.tsx
│   ├── InterviewRounds.tsx
│   ├── Layout.tsx
│   └── ...
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── AddInterview.tsx
│   ├── EditInterview.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Settings.tsx
├── services/            # API services
│   ├── api.ts          # Axios instance with interceptors
│   ├── authService.ts  # Authentication API calls
│   ├── interviewService.ts
│   └── profileService.ts
├── context/             # React context providers
│   └── AuthContext.tsx # Authentication state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── dateUtils.ts
│   └── security.ts     # Input sanitization
└── App.tsx             # Main app with routing
```

## Features

- **Authentication**: JWT-based login/register with automatic token refresh
- **Dashboard**: Statistics, upcoming interviews, needs review widgets
- **Interview Management**: Full CRUD with interview rounds history
- **Settings**: Notification preferences
- **Security**: Input sanitization, XSS prevention

## Authentication Flow

1. User logs in via `/api/auth/login/`
2. JWT tokens stored in localStorage
3. Axios interceptor adds Bearer token to requests
4. On 401 error, interceptor attempts token refresh
5. If refresh fails, user redirected to login

## Development

```bash
npm install
npm run dev
```

App runs at http://localhost:5173

## Environment

The frontend connects to the backend API at `http://localhost:8000/api`.
To change this, update `baseURL` in `src/services/api.ts`.

## Build

```bash
npm run build
npm run preview  # Preview production build
```

## Security

- All user inputs are sanitized before submission
- Script injection is blocked in form fields
- Tokens are cleared from all storage on logout
- No sensitive data logged to console in production
