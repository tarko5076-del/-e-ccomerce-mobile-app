# ElectroHub - Premium Electronics E-Commerce App

ElectroHub is a modern, high-performance electronics e-commerce application tailored for the Ethiopian market. It features a complete mobile app frontend built with **React Native (Expo)** and a robust backend server running **Node.js, Express, Prisma, and PostgreSQL**.

---

## 📱 What Users Can Do

The customer-facing application is optimized for purchasing electronics and supports local payment channels:

*   **Secure Authentication:** Register a new account and securely log in.
*   **Smart Product Discovery:** 
    *   Browse curated categories (smartphones, laptops, gaming gear, etc.) and top brands (Apple, Samsung, Sony, Dell, Canon, Logitech, LG).
    *   Search for specific items with instant query filtering.
    *   Filter products dynamically by brand and category, and sort by popularity, rating, and price.
*   **Detailed Product Insights:** Inspect comprehensive technical specifications (Processor, RAM, Storage, Battery, Display Size, Camera, OS), warranty details, and read customer ratings and reviews.
*   **Cart & Wishlist Management:** Add products to a wishlist, manage a shopping cart, and dynamically adjust item quantities.
*   **Tailored Shipping Configuration:** Create and manage multiple physical delivery addresses (configured with street, subcity, city, and phone number).
*   **Ethiopian Local Payments (Mock Integration):** Check out securely using simulated local payment options in **ETB (Ethiopian Birr)**:
    *   📱 **Telebirr**
    *   🏦 **CBE Birr**
    *   💳 **Chapa (Card)**
    *   📲 **M-Pesa**
*   **Order Tracking:** View personal order history and trace order statuses directly from the profile screen.

---

## 🔐 What the Admin Can Do

A dedicated, restricted admin panel is built directly into the app, allowing store managers to oversee operations:

*   **Secure Admin Login:** Authorized personnel can log in via a dedicated, secure credential screen:
    *   **Username:** `admin`
    *   **Password:** `admin123`
*   **Dashboard Analytics:** View overall sales performance, including total revenue in ETB, total orders placed, count of registered products, and registered customers.
*   **Product Management:** 
    *   View all available products, prices, and stock counts.
    *   Create and add new products with specifications, categories, brands, prices, description, and warranty information.
*   **Order Management Queue:** Monitor and process customer orders, with options to change their status:
    *   🟡 `pending` (Default status upon order creation)
    *   🔵 `shipped` (In-transit status)
    *   🟢 `delivered` (Fulfillment complete; added to revenue analytics)
    *   🔴 `cancelled` (Order cancelled status)
*   **Customer Directory:** View a roster of all registered customers along with their emails, registration dates, and total orders placed.

---

## 🚀 How to Run the Full Project

### Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Docker & Docker Compose](https://www.docker.com/) (recommended for database setup)
*   [Git](https://git-scm.com/)

---

### Step 1: Start the Backend & Database (Choose A or B)

#### Method A: Docker Compose (Recommended)
This spins up a PostgreSQL database and the Express backend server concurrently, runs schema migrations, and seeds mock products automatically.

1. Open your terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Build and start the services:
   ```bash
   docker-compose up --build
   ```

#### Method B: Manual Local Execution
If you do not have Docker installed, you can run the server locally:
1. Ensure you have a running PostgreSQL database.
2. In the `server` directory, create a `.env` file containing:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/<db_name>?schema=public"
   JWT_SECRET="electrohub_jwt_secret_key_98765"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations and seed the database:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
5. Run the developer server:
   ```bash
   npm run dev
   ```

---

### Step 2: Start the React Native Frontend (Expo)

Once the backend is running, launch the frontend app:

1. Open a new terminal and navigate to the `MyApp` directory:
   ```bash
   cd MyApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo developer server:
   ```bash
   npm run start
   ```

### Step 3: Run/Preview the App
When the Expo CLI developer environment starts, choose how to run the app:
*   **Android:** Press `a` in the terminal to load the app in an Android emulator (requires Android Studio).
*   **iOS:** Press `i` to load the app in an iOS simulator (requires macOS & Xcode).
*   **Web:** Press `w` to open in a local web browser.
*   **Physical Device:** Install the **Expo Go** app on your phone, then scan the QR code printed in your terminal or web dashboard.

