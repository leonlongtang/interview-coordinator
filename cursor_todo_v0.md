# Interview Coordinator - V0 MVP Todo List

## 🎯 Goal
Build a working full-stack application where you can create, view, edit, and delete interviews. No authentication yet - focus on getting the Django + React connection solid.

---

## 📋 Phase 1: Django Backend Setup

### Task 1.1: Initial Django Configuration
```
☐ Navigate to backend directory
☐ Create a new Django app called 'interviews'
  Command: python manage.py startapp interviews
☐ Add 'interviews' to INSTALLED_APPS in settings.py
☐ Add 'rest_framework' to INSTALLED_APPS
☐ Add 'corsheaders' to INSTALLED_APPS
```

### Task 1.2: Configure CORS
```
☐ Add 'corsheaders.middleware.CorsMiddleware' to MIDDLEWARE (near top)
☐ Add CORS settings to settings.py:
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:5173",  # Vite default port
  ]
  CORS_ALLOW_CREDENTIALS = True
```

### Task 1.3: Configure PostgreSQL
```
☐ Ensure PostgreSQL is installed and running
☐ Create database: createdb interview_coordinator_db
☐ Update DATABASES in settings.py:
  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.postgresql',
          'NAME': 'interview_coordinator_db',
          'USER': 'your_username',
          'PASSWORD': 'your_password',
          'HOST': 'localhost',
          'PORT': '5432',
      }
  }
☐ Install psycopg2: pip install psycopg2-binary
```

---

## 📋 Phase 2: Create Interview Model

### Task 2.1: Build the Interview Model
```
☐ Open interviews/models.py
☐ Create Interview model with these fields:
  - company_name: CharField(max_length=200)
  - position: CharField(max_length=200)
  - interview_date: DateTimeField()
  - interview_type: CharField(max_length=20, choices=TYPE_CHOICES)
    Choices: 'phone', 'technical', 'behavioral', 'final'
  - status: CharField(max_length=20, choices=STATUS_CHOICES)
    Choices: 'scheduled', 'completed', 'cancelled'
  - location: CharField(max_length=20, choices=LOCATION_CHOICES)
    Choices: 'onsite', 'remote', 'hybrid'
  - notes: TextField(blank=True, null=True)
  - created_at: DateTimeField(auto_now_add=True)
  - updated_at: DateTimeField(auto_now=True)

☐ Add __str__ method that returns f"{self.company_name} - {self.position}"
☐ Add class Meta with ordering = ['-interview_date']
```

### Task 2.2: Create and Run Migrations
```
☐ Run: python manage.py makemigrations
☐ Review the migration file created
☐ Run: python manage.py migrate
☐ Verify table created in PostgreSQL
```

---

## 📋 Phase 3: Build API with Django REST Framework

### Task 3.1: Create Serializer
```
☐ Create file: interviews/serializers.py
☐ Import serializers from rest_framework
☐ Create InterviewSerializer(serializers.ModelSerializer)
☐ Include all fields in Meta class
☐ Add validation for interview_date (can't be in the past for new entries)
```

### Task 3.2: Create API Views
```
☐ Open interviews/views.py
☐ Import necessary items from rest_framework
☐ Create InterviewViewSet(viewsets.ModelViewSet)
☐ Set queryset = Interview.objects.all()
☐ Set serializer_class = InterviewSerializer
☐ Add ordering by interview_date
```

### Task 3.3: Configure URLs
```
☐ Create interviews/urls.py
☐ Set up DefaultRouter from rest_framework.routers
☐ Register InterviewViewSet with router
☐ Export urlpatterns = router.urls

☐ Update main urls.py (project level):
☐ Include interviews.urls at path 'api/interviews/'
☐ Add REST framework browsable API login if desired
```

### Task 3.4: Test API Endpoints
```
☐ Start Django server: python manage.py runserver
☐ Test in browser or Postman:
  ☐ GET http://localhost:8000/api/interviews/ (list)
  ☐ POST http://localhost:8000/api/interviews/ (create)
  ☐ GET http://localhost:8000/api/interviews/{id}/ (detail)
  ☐ PUT http://localhost:8000/api/interviews/{id}/ (update)
  ☐ DELETE http://localhost:8000/api/interviews/{id}/ (delete)
☐ Create 2-3 test interviews via API
```

---

## 📋 Phase 4: Django Admin Setup

### Task 4.1: Register Model in Admin
```
☐ Open interviews/admin.py
☐ Import Interview model
☐ Create InterviewAdmin class with:
  - list_display = ['company_name', 'position', 'interview_date', 'status', 'interview_type']
  - list_filter = ['status', 'interview_type', 'location']
  - search_fields = ['company_name', 'position']
  - date_hierarchy = 'interview_date'
☐ Register Interview model with InterviewAdmin
```

### Task 4.2: Create Superuser & Test Admin
```
☐ Create superuser: python manage.py createsuperuser
☐ Login to admin at http://localhost:8000/admin/
☐ Verify you can view/edit interviews
☐ Add a test interview via admin panel
```

---

## 📋 Phase 5: React Frontend Setup

### Task 5.1: Initialize Vite React Project
```
☐ Navigate to frontend directory (or create it)
☐ If not created: npm create vite@latest frontend -- --template react
☐ Navigate into frontend: cd frontend
☐ Install dependencies: npm install
```

### Task 5.2: Install Required Packages
```
☐ Install axios: npm install axios
☐ Install react-router-dom: npm install react-router-dom
☐ Install date-fns: npm install date-fns
☐ Configure Tailwind CSS:
  - npm install -D tailwindcss postcss autoprefixer
  - npx tailwindcss init -p
  - Update tailwind.config.js content paths
  - Add @tailwind directives to index.css
```

### Task 5.3: Setup Project Structure
```
☐ Create folder structure:
  src/
    ├── components/
    ├── pages/
    ├── services/
    ├── utils/
    ├── App.jsx
    └── main.jsx

☐ Clean up default Vite files (App.css, remove default content)
```

---

## 📋 Phase 6: API Service Layer

### Task 6.1: Create Axios Instance
```
☐ Create src/services/api.js
☐ Import axios
☐ Create axios instance with:
  - baseURL: 'http://localhost:8000/api'
  - headers: { 'Content-Type': 'application/json' }
☐ Add response/error interceptors for debugging
☐ Export the instance
```

### Task 6.2: Create Interview Service
```
☐ Create src/services/interviewService.js
☐ Import api instance
☐ Create and export these functions:
  - getAllInterviews() => GET /interviews/
  - getInterview(id) => GET /interviews/{id}/
  - createInterview(data) => POST /interviews/
  - updateInterview(id, data) => PUT /interviews/{id}/
  - deleteInterview(id) => DELETE /interviews/{id}/
☐ Add try-catch error handling to each function
```

---

## 📋 Phase 7: Build Reusable Components

### Task 7.1: Create Basic UI Components
```
☐ Create src/components/Button.jsx
  - Accept props: children, onClick, variant, className
  - Use Tailwind for styling (primary, secondary, danger variants)

☐ Create src/components/Input.jsx
  - Accept props: label, type, name, value, onChange, required, error
  - Show error message if provided
  - Use Tailwind styling

☐ Create src/components/Select.jsx
  - Accept props: label, name, value, onChange, options, required
  - Map through options to create <option> elements
  - Use Tailwind styling

☐ Create src/components/Textarea.jsx
  - Accept props: label, name, value, onChange, rows
  - Use Tailwind styling
```

### Task 7.2: Create Layout Component
```
☐ Create src/components/Layout.jsx
☐ Include:
  - Header with app title "Interview Coordinator"
  - Navigation (Dashboard, Add Interview)
  - Main content area with {children}
  - Simple footer
☐ Use Tailwind for responsive layout
```

### Task 7.3: Create Interview Card Component
```
☐ Create src/components/InterviewCard.jsx
☐ Display interview information:
  - Company name and position (bold/prominent)
  - Interview date (formatted with date-fns)
  - Status badge (colored based on status)
  - Interview type and location
  - Notes preview (first 100 chars if exists)
☐ Add Edit and Delete buttons
☐ Accept props: interview, onEdit, onDelete
☐ Style with Tailwind (card design, hover effects)
```

---

## 📋 Phase 8: Create Interview Form

### Task 8.1: Build InterviewForm Component
```
☐ Create src/components/InterviewForm.jsx
☐ Set up form state with useState for all fields
☐ Create handleSubmit function that:
  - Prevents default form submission
  - Validates required fields
  - Calls onSubmit prop with form data
☐ Include inputs for all Interview model fields:
  - Company Name (Input)
  - Position (Input)
  - Interview Date (Input type="datetime-local")
  - Interview Type (Select with options)
  - Status (Select with options)
  - Location (Select with options)
  - Notes (Textarea)
☐ Add Submit and Cancel buttons
☐ Handle loading state during submission
☐ Display error messages if submission fails
```

### Task 8.2: Add Form Validation
```
☐ Validate required fields before submission
☐ Check interview date is not in the past
☐ Show inline error messages
☐ Disable submit button if form invalid
```

---

## 📋 Phase 9: Build Pages

### Task 9.1: Create Dashboard Page
```
☐ Create src/pages/Dashboard.jsx
☐ Import InterviewCard and interviewService
☐ Use useState for interviews array and loading state
☐ Use useEffect to fetch interviews on mount
☐ Display loading spinner while fetching
☐ Map through interviews and render InterviewCard for each
☐ Implement handleDelete function:
  - Call deleteInterview service
  - Remove from local state on success
  - Show confirmation dialog before deleting
☐ Implement handleEdit to navigate to edit page
☐ Show "No interviews yet" message if list is empty
☐ Add "Add Interview" button that navigates to add page
```

### Task 9.2: Create Add Interview Page
```
☐ Create src/pages/AddInterview.jsx
☐ Import InterviewForm and interviewService
☐ Create handleSubmit function:
  - Call createInterview service with form data
  - Navigate to dashboard on success
  - Show error message on failure
☐ Render InterviewForm with onSubmit prop
☐ Add page title "Add New Interview"
```

### Task 9.3: Create Edit Interview Page
```
☐ Create src/pages/EditInterview.jsx
☐ Get interview ID from URL params (useParams)
☐ Fetch interview data on mount
☐ Pre-populate InterviewForm with existing data
☐ Create handleSubmit function:
  - Call updateInterview service
  - Navigate to dashboard on success
☐ Handle loading state while fetching interview
☐ Show 404 message if interview not found
```

---

## 📋 Phase 10: Setup Routing

### Task 10.1: Configure React Router
```
☐ Open src/App.jsx
☐ Import BrowserRouter, Routes, Route from react-router-dom
☐ Import Layout and all page components
☐ Set up routes:
  - / => Dashboard
  - /add => AddInterview
  - /edit/:id => EditInterview
☐ Wrap routes in Layout component
☐ Add 404 Not Found route
```

### Task 10.2: Add Navigation
```
☐ Update Layout component with navigation links
☐ Use Link or NavLink from react-router-dom
☐ Add active state styling for current page
☐ Ensure navigation works between all pages
```

---

## 📋 Phase 11: Styling & Polish

### Task 11.1: Design Dashboard
```
☐ Create grid layout for interview cards (responsive)
☐ Add hover effects on cards
☐ Style status badges with appropriate colors:
  - scheduled: blue
  - completed: green
  - cancelled: red
☐ Add subtle animations (fade in, etc.)
☐ Ensure mobile responsive (test at 375px, 768px, 1024px)
```

### Task 11.2: Style Forms
```
☐ Add proper spacing between form fields
☐ Style focus states for inputs
☐ Add validation error styling (red borders, error text)
☐ Style buttons with hover/active states
☐ Add loading spinner for submit button
☐ Ensure forms are mobile-friendly
```

### Task 11.3: Overall UI Polish
```
☐ Choose and apply consistent color scheme
☐ Set up typography scale (headings, body text)
☐ Add proper spacing throughout app
☐ Ensure proper contrast for accessibility
☐ Add favicon
☐ Update page title
```

---

## 📋 Phase 12: Testing & Bug Fixes

### Task 12.1: Manual Testing Checklist
```
☐ Test Create Interview:
  - Fill form with valid data => Success
  - Try to submit with empty required fields => Show errors
  - Try to submit with past date => Show error
  - Submit valid form => Redirects to dashboard
  - New interview appears in list

☐ Test View Interviews:
  - Dashboard loads all interviews
  - Interviews display correct information
  - Status badges show correct colors
  - Dates are formatted correctly

☐ Test Edit Interview:
  - Click edit on an interview => Goes to edit page
  - Form pre-populates with existing data
  - Change fields and submit => Updates successfully
  - Returns to dashboard with updated data

☐ Test Delete Interview:
  - Click delete => Shows confirmation
  - Confirm delete => Interview removed from list
  - Cancel delete => Nothing happens

☐ Test Error Handling:
  - Stop Django server => Frontend shows error message
  - Try invalid data => Shows validation errors
  - Network error during submit => Shows error message
```

### Task 12.2: Responsive Design Testing
```
☐ Test on mobile (375px width)
☐ Test on tablet (768px width)
☐ Test on desktop (1024px+ width)
☐ Ensure form is usable on all sizes
☐ Check interview cards stack properly on mobile
☐ Verify navigation works on all devices
```

### Task 12.3: Cross-browser Testing
```
☐ Test in Chrome
☐ Test in Firefox
☐ Test in Safari (if available)
☐ Check for console errors in each browser
```

---

## 📋 Phase 13: Documentation & Deployment Prep

### Task 13.1: Code Cleanup
```
☐ Remove console.log statements
☐ Remove unused imports
☐ Format code consistently (Prettier)
☐ Add comments to complex logic
☐ Check for any hardcoded values that should be env variables
```

### Task 13.2: Environment Variables
```
☐ Create .env file in Django project:
  - SECRET_KEY
  - DEBUG
  - DATABASE_URL
  - ALLOWED_HOSTS

☐ Create .env file in React project:
  - VITE_API_URL

☐ Add .env to .gitignore
☐ Create .env.example files with dummy values
```

### Task 13.3: Create README
```
☐ Add project description
☐ Add tech stack list
☐ Add setup instructions:
  - Clone repo
  - Backend setup (virtualenv, pip install, migrations)
  - Frontend setup (npm install, npm run dev)
  - Environment variables needed
☐ Add screenshots (add after V1)
☐ Add future features list
```

### Task 13.4: Requirements File
```
☐ Create requirements.txt:
  pip freeze > requirements.txt
☐ Verify it includes:
  - Django
  - djangorestframework
  - django-cors-headers
  - psycopg2-binary
```

---

## 🎉 V0 COMPLETE CHECKLIST

Before moving to V1, verify:
```
☐ Django server runs without errors
☐ React dev server runs without errors
☐ Can create a new interview from frontend
☐ Can view list of all interviews
☐ Can edit an existing interview
☐ Can delete an interview
☐ All CRUD operations work end-to-end
☐ UI is responsive on mobile and desktop
☐ No console errors in browser
☐ Code is committed to git
☐ README has basic setup instructions
```

---

## 🚀 Next Steps

Once V0 is complete and tested:
1. Demo the app to yourself - does it feel usable?
2. Get feedback from a friend
3. Take screenshots for your README
4. Start planning V1 features (authentication, notifications)

---

## 💡 Tips for Using This with Cursor

1. **Work linearly** - Complete each phase before moving to the next
2. **Test frequently** - After each task, test that feature works
3. **Commit often** - Commit after completing each phase
4. **Copy-paste tasks** - Feed individual task blocks to Cursor as prompts
5. **Example Cursor prompt format:**
   ```
   I need to complete Task 2.1: Build the Interview Model
   
   Create a Django model in interviews/models.py with these fields:
   [paste the task details]
   
   Make sure to include __str__ method and Meta class for ordering.
   ```

Good luck! 🎯