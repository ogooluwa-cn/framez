Framez - Social Media App 📱
Framez is a modern, Instagram-inspired social media application built with React Native and Supabase. Share your moments, connect with friends, and explore content in a beautiful, intuitive interface.

🚀 Features
✅ Completed Features
User Authentication - Secure sign up, login, and logout with email verification

Post Creation - Share text posts and images with the community

Real-time Feed - Chronological feed displaying all user posts

User Profiles - Personal profile showing user info and their posts

Persistent Sessions - Users stay logged in across app restarts

Image Upload - Upload and display images in posts

🔧 Technical Implementation
Frontend: React Native with Expo

Backend: Supabase (PostgreSQL + Auth + Storage)

Authentication: Supabase Auth with email confirmation

Database: PostgreSQL with Row Level Security

File Storage: Supabase Storage for images

State Management: React Context API

Navigation: React Navigation (Stack + Bottom Tabs)

📸 App Screens
Authentication Flow
Login Screen - Secure email/password login

Registration Screen - User signup with email verification

Email Confirmation - Automatic deep link handling

Main App
Feed Screen - Chronological post feed with author info and timestamps

Create Post Screen - Text and image post creation

Profile Screen - User profile with posts and stats

🛠️ Installation & Setup
Prerequisites
Node.js (v16 or higher)

Expo CLI

Supabase account

1. Clone the Repository
bash
git clone <your-repo-url>
cd framez
2. Install Dependencies
bash
npm install
3. Supabase Setup
Create a project at supabase.com

Run the SQL schema from database/schema.sql in Supabase SQL editor

Get your project URL and anon key from Settings > API

4. Environment Configuration
Create a .env file:

env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
5. Run the App
bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
🗄️ Database Schema
Profiles Table
sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
Posts Table
sql
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
🎯 Key Implementation Details
Authentication System
Secure Signup with email verification

Persistent Sessions using AsyncStorage

Automatic Profile Creation via database triggers

Protected Routes with auth context

Post Management
Rich Text Posts with optional images

Image Upload to Supabase Storage

Real-time Updates using Supabase subscriptions

Chronological Feed with proper ordering

User Experience
Instagram-like UI with clean, modern design

Responsive Layout for all screen sizes

Loading States and error handling

Smooth Navigation between screens

📱 Deployment
Expo Go Testing
Scan QR code from Expo Dev Tools

Test on physical devices using Expo Go app

Appetize.io Deployment
Build the app:

bash
expo build:android
# or
expo build:ios

📁 Project Structure
text
framez/
├── App.js
├── app.json
├── package.json
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # Auth context and state management
│   ├── navigation/     # App navigation setup
│   ├── screens/        # App screens (Login, Feed, Profile, etc.)
│   ├── services/       # Supabase configuration
│   └── utils/          # Helper functions
└── README.md
🎨 Design Inspiration
Instagram-like interface with clean, modern aesthetics

Consistent color scheme (#0095f6 primary color)

Intuitive navigation with bottom tabs

Responsive layouts for all device sizes

✅ Acceptance Criteria Met
User can register, log in, and log out successfully

Auth session persists on app restart

User can create new posts (text and images)

Posts display correctly in chronological feed

User profile displays user info and their posts

Smooth navigation and responsive layout

App runs without errors on Android and iOS

🔗 Links

live link for android: [https://appetize.io/app/b_wsmm36iw5aipglycz4ha3sfbsa]

Live link for ios : [https://appetize.io/app/b_goe6yi4atslk4nh4ph7ya7nz4i]
Live Demo: [stage-4-url-qnjt.vercel.app] for both Android and ios simultaneously 

Demo Video: [https://youtube.com/shorts/TN-n3DN2T0g?si=PdIVdLWGVy95wfQl]

👨‍💻 Developer
Badaru Nuratullah Ogooluwa

HNG Frontend Stage 4 Submission

Built with React Native & Supabase
Upload the build to appetize.io

Share the public demo link
