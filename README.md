# Hexa Dashboard 🚀

![Hexa Dashboard Banner](https://img.shields.io/badge/Hexa-Dashboard-indigo?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**Hexa Dashboard** is a powerful, modern, and high-performance ads management platform designed to streamline your campaign tracking, lead management, and reporting. Built with the latest web technologies, it offers a seamless and responsive user experience.

## ✨ Features

*   **📊 Interactive Dashboard**: Real-time visualization of key performance indicators (KPIs).
*   **📢 Campaign Management**: Create, edit, and track ad campaigns across multiple platforms.
*   **👥 Lead Tracking**: comprehensive lead management system with status tracking.
*   **📈 Detailed Reports**: In-depth analytics and exportable reports for data-driven decisions.
*   **🔐 Secure Authentication**: Robust JWT-based authentication with social login support (Google, GitHub).
*   **🎨 Modern UI/UX**: A beautiful, dark-themed interface built with Tailwind CSS and Framer Motion.
*   **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React](https://reactjs.org/) (v18)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4 - CSS-first configuration)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Routing**: [React Router](https://reactrouter.com/)
*   **State Management**: React Context API
*   **Forms**: React Hook Form + Zod Validation

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: JSON Web Tokens (JWT)

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Juvinho/Hexa.git
    cd Hexa
    ```

2.  **Install dependencies**
    ```bash
    # Install root dependencies (if any)
    npm install

    # Install Frontend dependencies
    npm install

    # Install Backend dependencies
    cd server
    npm install
    cd ..
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `server` directory and configure your database and JWT secret:
    ```env
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="your_super_secret_key"
    ```

4.  **Database Setup**
    ```bash
    cd server
    npx prisma generate
    npx prisma migrate dev --name init
    cd ..
    ```

5.  **Run the Application**
    You can run both frontend and backend concurrently (if scripts are set up) or in separate terminals.

    **Terminal 1 (Backend):**
    ```bash
    cd server
    npm run dev
    ```

    **Terminal 2 (Frontend):**
    ```bash
    npm run dev
    ```

6.  **Access the Dashboard**
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 🧪 Testing

To run the automated tests:

```bash
npm run test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Juvinho">Juvinho</a>
</p>
