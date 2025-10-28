# 🚀 QuickBill: An Omni-Channel Invoice Management System

QuickBill is a **full-stack, omni-channel invoicing platform** built for freelancers and small businesses.  
It provides a **"headless" backend API** that serves two distinct clients:  
- A **React Native mobile app** for on-the-go management  
- A **React web application** for a powerful desktop experience  

The system goes beyond simple data entry — it includes a **backend analytics engine** to visualize business health and a **Python microservice** that leverages **machine learning** to predict cash flow and estimate payment dates for outstanding invoices.

---

## 🧩 Core Features

### ✅ Omni-Channel Access
Manage your business from a **native mobile app (iOS/Android)** or a **responsive web app**.

### ✅ Full CRUD Functionality
Complete Create, Read, Update, and Delete operations for **Invoices** and **Clients** across all platforms.

### ✅ Secure Authentication
User-specific **JWT (JSON Web Token)** authentication for all API routes.

### ✅ Analytics Dashboard
- **Stat Cards** – "Total Revenue" and "Outstanding Revenue"
- **Revenue Charts** – Line chart for monthly trends; pie chart for invoice statuses
- **Client Insights** – Bar chart of "Top 5 Clients by Revenue"

### ✅ Predictive AI (Machine Learning)
- A dedicated **Python (Flask)** microservice trains a model on each user's payment history.  
- Predicts **Estimated Pay Dates** for pending and overdue invoices.

### ✅ Professional PDF Generation
- Server-side **HTML-to-PDF** conversion  
- Customizable invoices with **company logo**, **optional GST**, and **platform fee calculation**  
- **Smart Invoice Numbering**: Sequential format `INV-YYYYMMDD-NNN`

### ✅ Search & Filtering
Fast, **debounced search** by name, client, or invoice number across all dashboards.

---

## 🏗️ System Architecture & Tech Stack

This project follows a **polyglot microservice-based architecture**, with all components contained in a monorepo.

| **Service** | **Folder** | **Core Technologies** |
|--------------|-------------|------------------------|
| Backend API | `/backend` | Node.js, Express, MongoDB, Mongoose, JWT |
| Mobile App | `/frontend` | React Native, Expo, Expo Router, react-native-gifted-charts |
| Web App | `/webapp` | React (Vite), TypeScript, Tailwind CSS, recharts |
| ML Service | `/ml-service` | Python, Flask, scikit-learn, pandas, joblib |

---

## ⚙️ Getting Started: Setup Instructions

You’ll need to run **all four services** simultaneously to use the full system.

---

### 1️⃣ Backend API (`/backend`)

Handles all core business logic and database interactions.

```bash
cd backend
npm install
```

Create a .env file:

```bash
MONGO_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret_key
ML_SERVICE_URL=http://localhost:5002
```

Run the server:

```bash
npm run dev
```

Your backend should now be live at:
👉 http://localhost:5001

### 2️⃣ ML Service (/ml-service)

Handles all machine learning predictions.

```bash
cd ml-service
python -m venv venv
.\venv\Scripts\activate  # (Windows)
# source venv/bin/activate  # (Mac/Linux)
pip install -r requirements.txt
```

Create a .env file:

```bash
MONGO_URI=your_mongodb_connection_string
```

Run the ML server:

```bash
flask run --port 5002
```

Your ML service should now be live at:
👉 http://localhost:5002

 🧠 Train the Model

After generating at least 10–15 paid invoices, send:

```bash
POST http://localhost:5002/train
```

Once you receive 200 OK, your model is ready.

### 3️⃣ Web App (/webapp)

The desktop dashboard for managing invoices and analytics.

```bash
cd webapp
npm install
```

Create a .env file:

```bash
VITE_API_URL=http://localhost:5001/api
```

Run the app:

```bash
npm run dev
```

Web dashboard runs at:
👉 http://localhost:5173

### 4️⃣ Mobile App (/frontend)

The native mobile experience (iOS & Android).

```bash
cd frontend
npm install
```

Create a .env file (⚠️ Use your local IP, not localhost):

```bash
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5001/api
```

Run the app:

```bash
npx expo start
```

Scan the QR code with the Expo Go app.

## 🧠 Running the Full System

Run each service in a separate terminal:

| **Terminal** | **Command** |
|--------------|-------------|
| Backend API | `cd backend && npm run dev` |
| Mobile App | `cd ml-service && .\venv\Scripts\activate && flask run --port 5002` |
| Web App | `cd webapp && npm run dev` |
| ML Service | `cd frontend && npx expo start` |

## 🧾 License

This project is for educational and personal use.
Feel free to extend it or integrate it into your workflow.

## 💡 Author

QuickBill – Built with ❤️ for freelancers and small business owners.
