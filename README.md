QuickBill - Full-Stack Invoice Management System
📝 Overview
QuickBill is a complete, full-stack invoice generation and management application. It features a cross-platform mobile app for on-the-go use and a dedicated web application for desktop management. Both frontends are powered by a robust backend API, providing a seamless experience across devices.

This project is built using the MERN stack (MongoDB, Express.js, React/React Native, Node.js) and is designed to be a comprehensive solution for freelancers and small businesses to manage their clients and invoices efficiently.

✨ Features
Full User Authentication: Secure user registration and login system with JWT-based authentication.

Invoice Management (CRUD): Create, read, update, and delete invoices with a systematic, date-based numbering system (INV-YYYYMMDD-NNN).

Client Management (CRUD): Full create, read, update, and delete functionality for clients.

PDF Generation & Sharing: Generate professional-looking PDF invoices, preview them, and share or save them to the device.

Configurable User Settings:

Company Logo: Upload a company logo to be displayed on invoices.

GST Support: Enable or disable GST and set a custom percentage from the profile.

Powerful Search: Filter invoices by invoice number or client name, and filter clients by name.

Dual Frontend Applications:

📱 Mobile App: Built with React Native and Expo for a native experience on iOS and Android.

💻 Web App: A dedicated React-based website for desktop and browser access.

Intuitive UI: Modern, clean user interfaces for both mobile and web, with features like modal pop-ups and tab-based navigation.

🛠️ Tech Stack
Backend:

Runtime: Node.js

Framework: Express.js

Database: MongoDB with Mongoose ODM

Authentication: JSON Web Tokens (JWT)

Password Hashing: bcrypt.js

Frontend (Mobile):

Framework: React Native with Expo

Navigation: Expo Router (File-based routing)

API Client: Axios

Frontend (Web):

Library: React with Vite

Styling: Tailwind CSS

API Client: Axios

📂 Project Structure
The project is organized into three main directories in the root folder:

/QuickBill
├── /backend/      # Node.js, Express, and Mongoose API
├── /frontend/     # React Native (Expo) mobile application
└── /webapp/       # React (Vite) web application

🚀 Getting Started
To get the project up and running on your local machine, follow these steps.

Prerequisites
Node.js (LTS version recommended)

A free MongoDB Atlas account for the database.

Git installed on your machine.

1. Backend Setup
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create a .env file in this folder and add your variables:
# MONGO_URI=your_mongodb_connection_string
# PORT=5001
# JWT_SECRET=your_jwt_secret_key

# Run the backend server
npm run dev

2. Frontend (Mobile) Setup
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Create a .env file in this folder and add your API URL:
# EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:5001/api

# Run the mobile application
npx expo start

3. Web App Setup
# Navigate to the webapp folder
cd webapp

# Install dependencies
npm install

# Create a .env file in this folder and add your API URL:
# VITE_API_URL=http://<YOUR_COMPUTER_IP>:5001/api

# Run the web application
npm run dev
