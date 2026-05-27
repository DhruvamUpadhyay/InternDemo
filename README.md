# ☁️ Intern Print - Secure Cloud Kiosk

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
</div>

<br />

Intern Print is a modern, secure cloud storage kiosk designed for seamless file management. Built with a robust full-stack architecture, it offers users a beautiful interface to manage their files while ensuring top-tier security and detailed access logging under the hood.

---

## ✨ Features

- **🚀 Blazing Fast**: Powered by React and Vite for an incredibly responsive frontend.
- **🔐 Secure Authentication**: Integrated with Firebase Auth, supporting both Email/Password and Google OAuth.
- **☁️ Robust Storage**: Utilizes Supabase Storage for reliable, scalable, and high-performance file hosting.
- **📁 Advanced File Management**: Easily create folders, upload files, rename, duplicate, and delete assets.
- **👁️ Secure Previews**: Generates time-limited signed URLs for secure file access, ensuring your data remains private.
- **📊 Comprehensive Logging**: Tracks all file access and actions within Firebase Firestore for auditing and security.
- **🎨 Premium UI/UX**: Features a custom-styled, dynamic interface with modern aesthetics and micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Auth**: Firebase SDK
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (v22+)
- **Framework**: Express.js
- **Database / Logging**: Firebase Admin (Firestore)
- **File Storage**: Supabase Storage
- **Middleware**: Multer (Memory Storage), CORS

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.0.0 or higher)
- Firebase Project
- Supabase Project

### Environment Variables

You will need to set up the following environment variables.

#### Backend (`backend/.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
```
*(Ensure you also have your Firebase Admin SDK service account key properly configured in `backend/firebaseAdmin.js`)*

#### Frontend (`frontend/.env`)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InternDemo
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App Locally

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:3001
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # App runs on Vite's default port (e.g., http://localhost:5173)
   ```

---

## 🔒 Architecture & Security

- **Signed URLs**: When a user previews a file, the backend verifies their JWT token and generates a time-limited signed URL from Supabase, preventing unauthorized direct access.
- **Memory Storage Uploads**: Files are temporarily stored in memory using Multer before being piped directly to Supabase, avoiding local disk writes and reducing latency.
- **Audit Trails**: Every view, copy, and delete action logs the user's IP, email, action type, and timestamp into Firestore.

---

## 📄 License

This project is licensed under the ISC License.
