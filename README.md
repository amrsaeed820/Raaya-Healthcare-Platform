<div align="center">
  <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1200" alt="Raaya Banner" width="100%" style="border-radius: 15px; margin-bottom: 20px;" />
  
  # Raaya Healthcare Platform
  
  **A smart digital platform for home nursing and remote patient monitoring in Egypt.**<br>
  *Turning home care into a safe, hospital-grade experience.*
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
  [![DEPI](https://img.shields.io/badge/DEPI-Graduation_Project-blue?style=for-the-badge)](#)
</div>

---

## 📖 About The Project

**Raaya** is a comprehensive graduation project developed under the **DEPI** (Digital Egypt Pioneers Initiative) program. It is designed to revolutionize the home healthcare sector in Egypt by providing a reliable, fast, and highly secure platform that connects patients with certified, professional nurses instantly. 

Whether it's an urgent medical visit, daily elderly care, or post-surgery follow-ups, Raaya ensures that patients receive hospital-grade care in the comfort of their homes.

### ✨ Key Features

* **🩺 Dual-Platform Architecture**: Separate, tailored experiences for **Patients** and **Nurses**.
* **⚡ Urgent Booking System**: Request a nurse immediately in emergency situations with real-time matching.
* **📍 Real-Time Location & Maps**: Integrated maps for detecting patient locations and tracking nurses.
* **🔐 Secure Authentication**: Robust JWT-based security and password recovery via Email (Nodemailer).
* **📱 Fully Responsive UI**: A premium, visually stunning interface that works flawlessly across all devices (Mobiles, Tablets, Desktops).
* **⚡ Highly Optimized**: Follows the latest Core Web Vitals (LCP, FCP) and SEO standards, achieving near 100% on Lighthouse performance audits.

---

## 📂 Repository Structure

This repository follows a professional Monorepo architecture, separating documentation from the source code.

```text
📦 DEPI Graduation Project
 ┣ 📂 Docs                  # Project documentation, presentations, and design assets
 ┣ 📂 Source                # The main source code directory
 ┃ ┣ 📂 raaya-backend       # Node.js & Express RESTful API, MongoDB integration, and Authentication
 ┃ ┣ 📂 raaya-react         # React.js web application for Patients (Booking, History, Articles)
 ┃ ┗ 📂 raaya-nurse-react   # React.js web application for Nurses (Dashboard, Requests, Earnings)
 ┗ 📜 README.md             # Project overview and setup instructions
```

---

## 💻 Tech Stack

- **Frontend**: React.js, Vite, React-Bootstrap, Framer Motion, React Router, CSS Modules.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.
- **Integrations**: Nodemailer (Email services), Leaflet/OpenStreetMap (Maps).

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v18 or higher)
* MongoDB (Local instance or MongoDB Atlas cluster)
* Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YourUsername/DEPI-Graduation-Project.git
cd "DEPI Graduation Project/Source"
```

**2. Setup the Backend (`raaya-backend`)**
```bash
cd raaya-backend
npm install
# Create a .env file and add your MongoDB URI, JWT Secret, and Email credentials.
npm run dev
```

**3. Setup the Patient Frontend (`raaya-react`)**
```bash
# Open a new terminal
cd ../raaya-react
npm install
npm run dev
```

**4. Setup the Nurse Frontend (`raaya-nurse-react`)**
```bash
# Open another terminal
cd ../raaya-nurse-react
npm install
npm run dev
```

---

## 👥 Team Members & Roles

This project was built with dedication and teamwork by our group under the DEPI program. Below is the team breakdown and contributions:

### 1. Amr Saeed — Team Leader & Core Developer
- **Role & Contributions**:
  - Overriding project architecture, repository setup, Git workflow, and DEPI team coordination.
  - Developed core Patient Booking System and appointment management workflows.
  - Implemented real-time status tracking logic and server-side notification integrations.

### 2. Jana Bedir — Backend Architect & UI/UX Designer
- **Role & Contributions**: 
  - Designed the database schema and MongoDB Atlas structure.
  - Implemented core server logic, security middlewares, and authentication flows.
  - 

### 3. Ahmed Fekry — Full-Stack Developer
- **Role & Contributions**: 
  - Developed JWT-based authentication system, password recovery, and Nodemailer integration.
  - Implemented secure API middlewares, session validation, and backend route protection.
  - Managed database queries and business logic for booking verifications.

### 4. Abdulaziz Ahmed — Frontend Developer (Patient Portal)
- **Role & Contributions**: 
  - 

### 5. Youssef Ahmed — Frontend Developer (Admin Dashboard)
- **Role & Contributions**: 
  - 

### 6. Eman Reda — Frontend Developer (Nurse Portal)
- **Role & Contributions**: 
  - 

---

## 🏆 Acknowledgments

This project was developed as a graduation requirement for the **DEPI** initiative. It demonstrates a deep understanding of full-stack web development, software architecture, UI/UX design principles, and web performance optimization.
