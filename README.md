# 🛍️ Ruhana_ADV — Full Stack MERN E-Commerce Web App

A high-performance, fully customizable eCommerce platform built using the **MERN Stack** (MongoDB, Express, React, Node.js), with cutting-edge UI, smooth animations, Stripe payments, full admin control, and secure authentication.

> 🔥 Hosted on production server & loved by clients.

---

## 🚀 Live Demo

🌐 [Live Website](#) *(https://ruhanas.com/)*

---

## 🖼️ Screenshots (Add Here)

You should add these later:
- `home.png` – homepage hero section with animation
- `products.png` – all products with filters
- `single-product.png` – product detail view
- `profile.png` – user profile and order tracking
- `admin-dashboard.png` – stats and management

---

## ✨ Features Overview

### 🏠 Home Page
- Beautiful **navbar** with logo, auth, categories, cart, avatar
- Full-screen **video banner** with GSAP & ScrollTrigger animations
- **Gradient category section** with animated stars ✨
- **Featured & Best Sellers** with hover effects and Add to Cart
- **Responsive footer** with live location & brand links

---

### 🛍️ All Products Page
- Global filter: **search by name/code**, category, sub-category, color, size
- **Low to High price sort**, pagination
- Full responsive product cards & reusability

---

### 👤 User Profile Page
- Authenticated access
- View and **track orders by ID**
- Cancel orders if in `Pending` or `Confirmed`
- See real-time status: `Pending → Confirmed → Shipped → Delivered`

---

### 🧾 Single Product Page
- Detailed product view with:
  - Image zoom, thumbnails
  - Video + Size chart
  - Select size, color, quantity
  - `Add to cart`, `Order now`, and `Order via WhatsApp` buttons
  - Rating system with past reviews
  - **Related Products** based on sub-category

---

### 🛒 Cart & Checkout
- View, edit, and delete cart items
- Fill delivery info
- Choose **Cash on Delivery (COD)** or **Card via Stripe**
- **Invoice** auto-generated and downloadable
- Stripe payments are visible in dashboard

---

### 🔐 Security & Auth
- **JWT-based authentication**
- Passwords are **hashed with Bcrypt**
- Role-based access: `Customer`, `Admin`

---

### 🧠 Admin Dashboard
- Analytics Dashboard:
  - Total orders, users, products
  - Monthly stats in graphs & donut charts
- Sidebar Navigation:
  - Add Product
  - Manage All Products (edit/delete, in stock/out of stock)
  - View All Orders:
    - Change status (Pending → Confirmed → Shipped → Delivered)
    - Export order data to **Excel** 📦
  - View All Users & update their roles

---

## 🧰 Tech Stack

| Category       | Technology                  |
|----------------|-----------------------------|
| **Frontend**   | React.js, TailwindCSS, GSAP |
| **Backend**    | Node.js, Express.js         |
| **Database**   | MongoDB, Mongoose           |
| **Authentication** | JWT, Bcrypt             |
| **Payment**    | Stripe (Demo mode enabled)  |
| **UI/UX**      | GSAP ScrollTrigger, custom animations |
| **Others**     | XLSX export, Invoice generation |

---

## 🧑‍💻 How to Run the Project Locally

```bash
# Clone this repository
git clone https://github.com/Sahid-Ali-Rehan/Ruhana_ADV.git
cd Ruhana_ADV

# Install backend dependencies
cd backend
npm install
touch .env

# Fill in your .env like:
# MONGO_URI=
# JWT_SECRET=
# STRIPE_SECRET=
# FRONTEND_URL=http://localhost:5173

npm run dev

# Install frontend dependencies
cd ../frontend
npm install
npm run dev
