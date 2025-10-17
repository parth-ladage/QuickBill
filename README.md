# 🚀 QuickBill - Full-Stack Invoice Management System

## 📝 Overview
**QuickBill** is a full-stack **invoice generation and management system** built for freelancers and small businesses. It includes:  
- A **cross-platform mobile app** for on-the-go usage.  
- A **dedicated web application** for desktop management.  

Both frontends are powered by a **single robust backend API**, ensuring seamless synchronization and real-time updates across devices.

Built using the **MERN stack (MongoDB, Express.js, React/React Native, Node.js)**, QuickBill showcases the **complete development lifecycle** — from backend API creation to deploying multi-platform frontends.

---

## ✨ Core Features

- 🔐 **Full User Authentication** – Secure login & signup using **JWT-based authentication**.  
- 📄 **Invoice Management (CRUD)** – Create, view, update, and delete invoices with a systematic numbering format:  
  `INV-YYYYMMDD-NNN`  
- 👥 **Client Management (CRUD)** – Manage clients with full CRUD functionality.  
- 🧾 **PDF Generation & Sharing** – Generate professional invoice PDFs, preview them in-app, and share or save directly.  
- ⚙️ **Configurable User Settings:**  
  - Upload **Company Logo** for branded invoices.  
  - Enable/disable **GST** and set custom percentages dynamically.  
- 🔍 **Powerful Search & Filters** – Quickly find invoices by number or client name.  
- 💡 **Dual Frontend Applications:**  
  - 📱 **Mobile App:** Built with **React Native (Expo)** for Android & iOS.  
  - 💻 **Web App:** Built with **React + Vite** for a fast, responsive browser experience.  
- 🎨 **Intuitive UI** – Modern, responsive, and minimal design with modals, tabs, and dark-mode-ready layout.

---

## 🛠️ Tech Stack

### 🔧 Backend
- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB + Mongoose ODM  
- **Authentication:** JSON Web Tokens (JWT)  
- **Password Hashing:** bcrypt.js  

### 📱 Frontend (Mobile)
- **Framework:** React Native (Expo)  
- **Navigation:** Expo Router (File-based Routing)  
- **API Client:** Axios  

### 💻 Frontend (Web)
- **Library:** React + Vite  
- **Styling:** Tailwind CSS  
- **API Client:** Axios  

---

## 📂 Project Structure

```
QuickBill/
├── backend/       # Node.js + Express + MongoDB API
├── frontend/      # React Native (Expo) mobile application
└── webapp/        # React (Vite) web application
```

---

## ⚙️ Getting Started

Follow these steps to run QuickBill locally on your system.

### 🔑 Prerequisites
- [Node.js (LTS)](https://nodejs.org/)  
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account  
- [Git](https://git-scm.com/) installed  

---

### 🖥️ 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create a .env file with the following:
MONGO_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_super_secret_key

# Run the backend server
npm run dev
```

---

### 📲 2. Frontend (Mobile) Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create a .env file with your API URL:
EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_IP>:5001/api

# Run the mobile app
npx expo start
```

> 📱 Use the **Expo Go app** on your mobile device to scan the QR code and preview the app.

---

### 🌐 3. Web App Setup

```bash
# Navigate to webapp folder
cd webapp

# Install dependencies
npm install

# Create a .env file with your API URL:
VITE_API_URL=http://<YOUR_COMPUTER_IP>:5001/api

# Run the web application
npm run dev
```

> The web app will typically launch at **http://localhost:5173**.

---

## 💬 Contributing
Contributions, issues, and feature requests are welcome!  
Feel free to open a pull request or raise an issue to help improve **QuickBill**.

---

## 📄 License
This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.
