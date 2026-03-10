# Intelligent-Mail-Agent

Intelli-Mail-Agent is a full-stack web application designed to help manage, automate, and intelligently interact with email campaigns. It leverages a modern tech stack to provide a seamless user interface and robust backend capabilities, including AI integrations and Google services.

## ✨ Features

- **Modern User Interface**: Built with React and structured using Radix UI components and Tailwind CSS for a beautiful, responsive, and accessible design.
- **Robust Backend**: Powered by Express.js to handle API requests efficiently.
- **Database Management**: Uses SQLite with Drizzle ORM for performant and type-safe database queries.
- **AI Integration**: Integrated with OpenAI for intelligent automation and content generation features.
- **Google Services**: Utilizes `googleapis` to connect and operate seamlessly with Google Workspace tools (like Gmail or Sheets).
- **Authentication**: Secure user authentication flows utilizing Passport.js.
- **Real-time Capabilities**: WebSocket (`ws`) support for real-time updates.

## 🚀 Tech Stack

- **Frontend**: React 18, Wouter (Routing), Tailwind CSS, Framer Motion, Radix UI Primitives, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (@libsql/client), Drizzle ORM.
- **Tooling**: Vite (Bundler), TypeScript, ESLint.
- **AI/Integrations**: OpenAI API, Google APIs.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- npm (comes with Node.js)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Intelli-Mail-Agent.git
   cd Intelli-Mail-Agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add the necessary environment variables. (You will need corresponding API keys for OpenAI, Google, etc.)
   ```env
   # Example .env file mapping
   NODE_ENV=development
   DATABASE_URL=file:./sqlite.db
   # OPENAI_API_KEY=your_openai_api_key_here
   # GOOGLE_CLIENT_ID=your_google_client_id_here
   # GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **Database Setup**
   Push the schema to your SQLite database using Drizzle kit:
   ```bash
   npm run db:push
   ```

## 🏃‍♂️ Running the Project

**Development Mode**
To start the application in development mode with hot-reloading:
```bash
npm run dev
```

**Production Build**
To build the application and run the production server:
```bash
npm run build
npm run start
```

## 📝 License

This project is licensed under the MIT License.

