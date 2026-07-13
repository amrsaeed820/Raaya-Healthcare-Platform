# Raaya Backend API 🚀

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)

This is the core RESTful API and backend service for the **Raaya Healthcare Platform**. It serves as the bridge between the Patient Application, the Nurse Dashboard, and the Database.

## ✨ Core Responsibilities
- **Authentication & Authorization**: Secure JWT-based login/signup for both patients and nurses.
- **Booking Engine**: Handles standard and urgent booking requests with real-time state management.
- **Geolocation Services**: Calculates distances and assigns the nearest available nurses.
- **Database Management**: Securely handles sensitive patient health records and nurse credentials via MongoDB.

## ⚙️ Environment Variables (.env)
To run this project, you will need to add the following environment variables to your `.env` file in the root of this folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_for_nodemailer
EMAIL_PASS=your_email_password_or_app_password
```

## 🛠️ Available Scripts

In the project directory, you can run:

### `npm install`
Installs all required dependencies (Express, Mongoose, bcrypt, jsonwebtoken, nodemailer, etc.).

### `npm run dev`
Runs the app in development mode using `nodemon`. The server will restart if you make edits.
The API will typically listen on [http://localhost:5000](http://localhost:5000).

### `npm start`
Runs the app in production mode.
