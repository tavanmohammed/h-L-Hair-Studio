

# H&L Hair Studio ✂️

A modern full-stack hair salon web application that allows clients to book appointments online and receive instant confirmation emails. Admins can log in to manage bookings, update appointment statuses, and maintain the salon’s daily schedule.

🌐 **Live Website:** [https://handlhair-studio.onrender.com/services](https://handlhair-studio.onrender.com/services)

---

## 🚀 Features

### ⭐ Client-Side (Customer)

* Browse the salon’s services, prices, and stylists
* Fully responsive (works on mobile, tablet, and desktop)
* Online booking system:

  * Choose service
  * Pick date & time
  * Enter customer details
* Real-time validation and error handling
* **Automatic confirmation email sent to the customer after booking**
* Booking success page displaying appointment details

---

### ⭐ Admin-Side (Dashboard)

* Secure admin login system
* Full booking management dashboard:

  * View all bookings (Upcoming & Past)
  * Search or filter by customer, date, or status
  * Edit or delete bookings
  * Update booking status (Pending → Confirmed → Completed / Cancelled)
* Admin can manage salon schedule efficiently
* All data saved in MongoDB for reliability and persistence

---

### ⭐ Backend Functionality

* Node.js + Express REST API
* MongoDB + Mongoose for data modeling
* Full CRUD operations for bookings
* Error handling, validation, and secure API endpoints
* JWT-based authentication for admin access
* **Email Notification System (Nodemailer):**

  * Sends confirmation emails immediately after booking
  * Includes service, date, time, and customer details
  * Uses secure email credentials via `.env`

---

## 🔔 Email Notification System

After a customer submits a booking:

1. The server processes the request
2. Booking is saved to the MongoDB database
3. The system automatically sends a confirmation email to the client
4. Email contains:

   * Service booked
   * Appointment date & time
   * Customer name
   * Salon contact info
5. The admin dashboard updates instantly

`.env` example for emails:

```env
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
EMAIL_SERVICE=gmail
```

---

## 🛠 Tech Stack

### **Frontend**

* React (Vite)
* Tailwind CSS
* Axios API communication

### **Backend**

* Node.js
* Express.js
* MongoDB + Mongoose

### **Other Tools**

* Nodemailer for sending booking confirmation emails
* JWT for admin authentication
* Render (deployment)

---

## 🧱 Project Structure

```bash
root/
├─ client/                     # React + Tailwind frontend
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ services/
│  │  └─ main.jsx
│  └─ index.html
│
├─ server/                     # Node + Express backend
│  ├─ models/
│  ├─ routes/
│  ├─ controllers/
│  ├─ utils/                   # Email utilities
│  ├─ middleware/              # Auth
│  └─ server.js
│
└─ README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the project

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

---

### 2️⃣ Install dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

---

### 3️⃣ Create `.env` file in **server/**

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

# Email Notification
EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

### 4️⃣ Run in Development Mode

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

---

## 📡 API Routes (Summary)

### **Bookings**

* `POST /api/bookings` — Create booking + send email
* `GET /api/bookings` — Admin view all bookings
* `PUT /api/bookings/:id` — Update booking details
* `DELETE /api/bookings/:id` — Delete a booking

### **Admin Auth**

* `POST /api/auth/login`
* `GET /api/auth/me`

---

## 🌐 Live Deployment

Your project is deployed on Render:

🔗 **Client Website:** [https://handlhair-studio.onrender.com/services](https://handlhair-studio.onrender.com/services)

*(If you want, we can also add the admin URL or backend URL)*

---

## 🧭 Future Improvements

* SMS notifications
* Payment integration (Stripe)
* Multi-stylist scheduling system
* Customer account login
* Dark mode / theme customization

