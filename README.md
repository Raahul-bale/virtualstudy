# Virtual Study Group Platform

A comprehensive MERN stack-based virtual study group platform that enables students to collaborate, learn, and grow together.

## Features

- Smart Matching & Group Formation
- Study-focused Features (Pomodoro Timer, Whiteboard, Shared Notes)
- Accountability & Productivity Tools
- Gamification & Engagement
- Privacy & Safety Features
- Study Material Sharing & Management

## Tech Stack

- Frontend: React.js, Tailwind CSS, Three.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Real-time Communication: Socket.io
- Authentication: JWT

## Project Structure

```
virtual-study-group/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source code
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── utils/           # Utility functions
└── README.md            # Project documentation
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm start
   ```

## Deployment

- Frontend: Deployed on Vercel
- Backend: Deployed on Render/Heroku
- Database: MongoDB Atlas

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 