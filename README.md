# 🚚 Smart Logistics & Delivery Management System

A full-stack logistics and delivery management platform designed to manage shipments, customers, delivery partners, warehouses, payments, tracking, and logistics operations through a centralized web application.

## ✨ Features

* 👤 Customer management
* 📦 Shipment booking and management
* 🚚 Driver and delivery partner management
* 🏭 Warehouse management
* 📍 Shipment tracking with interactive maps
* 💳 Payment and delivery pricing management
* 📊 Admin analytics dashboard
* 🔔 Shipment activity and status tracking
* 🤖 AI-powered logistics assistance
* 📝 Customer complaints and feedback management
* 📈 Delivery delay prediction
* 🗺️ Route optimization
* 📊 Google Sheets activity logging
* 🔐 Environment-based API key management
* 📱 Responsive web interface

## 👥 User Roles

### Customer

* Create and manage shipments
* Track deliveries
* View shipment status
* Check delivery pricing
* Make payments
* Submit complaints and feedback

### Delivery Partner

* View assigned deliveries
* Update shipment status
* Manage delivery activities
* Update pickup and delivery information

### Warehouse Manager

* Monitor incoming and outgoing shipments
* Manage warehouse operations
* Track shipment movement

### Administrator

* Manage customers, drivers, shipments, warehouses and payments
* Monitor overall logistics operations
* View analytics and reports
* Monitor customer activity
* Manage complaints and system operations

## 🛠️ Technology Stack

**Frontend**

* React
* TypeScript
* Vite
* CSS

**Backend**

* Node.js
* Express
* TypeScript
* REST APIs

**Database**

* Database integration through the backend
* Mock data support for development

**APIs & Services**

* Google Maps Platform
* Google Sheets
* Gemini AI
* Google Apps Script

## 📂 Project Structure

```text
Smart-Logistics-Delivery-Management-System/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── server/
│   ├── routes/
│   ├── utils/
│   └── db.ts
│
├── lib/
├── public/
├── server.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── .gitignore
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sakshi-kadadekar/Smart-Logistics-Delivery-Management-System.git
```

### 2. Navigate to the project

```bash
cd Smart-Logistics-Delivery-Management-System
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

Use `.env.example` as a reference:

```bash
cp .env.example .env
```

Add your own API keys and configuration values.

**Never upload `.env` to GitHub.**

### 5. Start the development server

```bash
npm run dev
```

The application will be available at the local development URL shown in your terminal.

## 🔐 Environment Variables

The project uses environment variables for sensitive configuration such as:

```env
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:5173"
GOOGLE_SHEET_URL="your_google_apps_script_url"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

Use `.env.example` for the required variable names.

⚠️ **Do not commit API keys, passwords, database credentials, or other secrets to GitHub.**

## 📊 Activity Tracking

The system maintains customer and shipment activity such as:

```text
Shipment Created
       ↓
Pickup Scheduled
       ↓
Driver Assigned
       ↓
Package Picked Up
       ↓
In Transit
       ↓
Out for Delivery
       ↓
Delivered
```

Activity data can also be integrated with Google Sheets for reporting and monitoring.

## 🤖 AI Features

The system includes AI-assisted logistics functionality for:

* Intelligent customer assistance
* Delivery delay prediction
* Logistics insights
* Automated support

## 🗺️ Logistics Optimization

The platform includes features for:

* Interactive delivery maps
* Route optimization
* Delivery tracking
* Shipment status monitoring
* Delivery delay analysis

## 🔒 Security

Security considerations implemented in the project include:

* Environment variables for sensitive credentials
* `.gitignore` protection for local secrets
* Role-based application functionality
* Server-side handling of sensitive operations
* API key protection and restriction

## 📌 Future Improvements

* Real-time GPS tracking
* Push notifications
* Advanced route optimization
* Driver performance analytics
* Live delivery ETA
* Online payment gateway integration
* Cloud deployment
* Production-grade authentication
* Advanced warehouse inventory management
* Automated email/SMS notifications

## 🎓 Project Purpose

This project was developed as an industry-oriented full-stack web application to demonstrate practical implementation of:

* Frontend development
* Backend API development
* Database management
* Role-based systems
* Logistics management
* API integration
* Data analytics
* AI integration
* Real-time activity tracking
* Secure environment configuration

## 👩‍💻 Author

**Sakshi Kadadekar**

GitHub:
https://github.com/sakshi-kadadekar

## 📄 License

This project is developed for educational and portfolio purposes.
