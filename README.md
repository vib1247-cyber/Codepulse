# CodePulse

A modern coding interview preparation platform with real-time code execution, problem tracking, and performance analytics.

![CodePulse Screenshot](https://via.placeholder.com/1200x600/1e293b/ffffff?text=CodePulse+Screenshot)

## Features

- **Real-time Code Execution**: Write, run, and test code directly in the browser with support for multiple programming languages
- **Comprehensive Problem Library**: Access a growing collection of coding challenges with detailed explanations and test cases
- **Performance Analytics**: Track your progress with detailed statistics and visualizations
- **Interview Preparation**: Practice with real interview questions from top tech companies
- **Custom Test Cases**: Create and run custom test cases to verify your solutions
- **Dark/Light Mode**: Toggle between themes for comfortable coding

## Tech Stack

- **Frontend**: React.js, Material-UI, Monaco Editor
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Code Execution**: Judge0 API
- **Authentication**: JWT
- **Real-time Updates**: WebSocket

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- Git

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codepulse.git
   cd codepulse
   ```

2. **Set up environment variables**
   - Create `.env` files in both `client` and `server` directories
   - Refer to `.env.example` files for required variables

3. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Start the development servers**
   ```bash
   # In the server directory
   npm start
   
   # In a new terminal, from the client directory
   npm start
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## Project Structure

```
codepulse/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       └── utils/         # Utility functions
└── server/                # Backend Node.js/Express server
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── middleware/       # Express middleware
    ├── models/           # Mongoose models
    └── routes/           # API routes
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Judge0](https://judge0.com/) - For the code execution API
- [Material-UI](https://material-ui.com/) - For the UI components
- [MongoDB](https://www.mongodb.com/) - For the database
- [React](https://reactjs.org/) - For the frontend library
