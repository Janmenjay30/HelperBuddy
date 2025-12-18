# 🤝 HelperBuddy

A full-stack personal productivity application built with React, Tailwind CSS, Node.js, Express, and MongoDB. Schedule tasks, write notes, and set up email/SMS reminders!

## ✨ Features

- **📋 Task Management**: Create, schedule, and track tasks with priorities and due dates
- **📝 Notes**: Write and organize notes with categories, colors, and pinning
- **🔔 Email Reminders**: Schedule email reminders for important events
- **📱 SMS Reminders**: Get SMS notifications (via Twilio)
- **🔄 Recurring Reminders**: Set daily, weekly, monthly, or yearly recurring reminders
- **🔐 User Authentication**: Secure JWT-based authentication
- **📱 Responsive Design**: Works beautifully on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router v6
- Axios
- Lucide React Icons
- Date-fns
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (Email)
- Twilio (SMS)
- Node-cron (Scheduled jobs)

## 📁 Project Structure

```
HelperBuddy/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Note.js
│   │   └── Reminder.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── notes.js
│   │   └── reminders.js
│   ├── middleware/
│   │   └── auth.js
│   ├── services/
│   │   └── reminderService.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Tasks.jsx
    │   │   ├── Notes.jsx
    │   │   └── Reminders.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone/Navigate to the project**
   ```bash
   cd HelperBuddy
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file (copy from .env.example)
   cp .env.example .env
   
   # Edit .env with your configurations
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/helperbuddy

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5000

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📧 Email Setup (Gmail)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Select "Mail" and "Windows Computer"
   - Copy the generated password
4. Use this app password in your `.env` file

## 📱 SMS Setup (Twilio)

1. Create a Twilio account at https://twilio.com
2. Get your Account SID and Auth Token from the console
3. Get a Twilio phone number
4. Add the credentials to your `.env` file

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/pin` - Toggle pin status

### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/:id` - Get single reminder
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## 🎨 Screenshots

The application features:
- Clean, modern dashboard with stats overview
- Task list with filtering and priority indicators
- Colorful notes with pinning functionality
- Reminder scheduling with email/SMS options

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ using React, Node.js, and MongoDB
