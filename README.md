# Game Backend API

A Node.js/Express backend for a multiplayer word guessing game with real-time room management and user authentication.

## 🚀 Features

- **User Authentication**: JWT-based authentication with cookie storage
- **Room Management**: Create and join game rooms with unique room codes
- **Word Guessing Game**: Wordle-style gameplay with letter hints
- **Real-time Scoring**: Track player scores and leaderboards
- **MongoDB Integration**: Persistent data storage for users, rooms, guesses, and words

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── controllers/           # Request handlers
│   │   ├── user.controller.js
│   │   ├── room.controller.js
│   │   └── guess.controller.js
│   ├── models/               # MongoDB schemas
│   │   ├── user.model.js
│   │   ├── room.model.js
│   │   ├── guess.model.js
│   │   └── word.model.js
│   ├── routes/               # API route definitions
│   │   ├── user.router.js
│   │   ├── room.router.js
│   │   └── guess.router.js
│   ├── middlewares/          # Custom middleware
│   │   └── userMiddleware.js
│   ├── utils/               # Utility functions
│   │   └── generateRoomCode.js
│   └── db/                  # Database connection
│       └── db.js
├── scripts/                 # Utility scripts
│   └── addWords.js         # Seed words database
├── server.js               # Server entry point
└── package.json           # Dependencies and scripts
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   ```

4. **Seed the database with words**
   ```bash
   node scripts/addWords.js
   ```

5. **Start the server**
   ```bash
   node server.js
   ```

The server will run on `http://localhost:3000`

## 📡 API Endpoints

### User Authentication
- `POST /user/register` - Register a new user
- `POST /user/login` - Login user
- `GET /user/me` - Get current user info (protected)

### Room Management
- `POST /room/create` - Create a new game room (protected)
- `POST /room/join/:id` - Join a room by room code (protected)
- `POST /room/start/:id` - Start the game (host only, protected)
- `GET /room/status/:id` - Get room status (protected)
- `GET /room/leaderboard/:id` - Get room leaderboard
- `GET /room/getRooms` - Get all rooms (dev only)

### Game Play
- `POST /guess/:id` - Submit a guess for a room (protected)

## 🎮 Game Flow

1. **User Registration/Login**: Users create accounts and authenticate
2. **Room Creation**: Host creates a room with a unique 5-character code
3. **Player Joining**: Players join using the room code
4. **Game Start**: Host initiates the game, a random word is selected
5. **Guessing**: Players submit guesses and receive letter hints
6. **Winning**: First correct guess wins, scores are updated
7. **Leaderboard**: View final scores and rankings

## 🗃️ Database Models

### User
- `username`: Unique username
- `password`: User password (plain text - consider hashing)
- `totalscore`: Cumulative score across games
- `joinedrooms`: Array of room references

### Room
- `roomCode`: Unique 5-character room identifier
- `roomName`: Display name for the room
- `secretWord`: The word to guess (set when game starts)
- `status`: Game state (waiting/in-progress/finished)
- `players`: Array of player objects with scores
- `winner`: Reference to winning user

### Word
- `word`: The word string
- `category`: Word category (fruits, objects, etc.)

### Guess
- `roomCode`: Associated room
- `player`: User who made the guess
- `guess`: The guessed word
- `correctLetters`: Letters in correct positions
- `correctButWrongPlace`: Correct letters in wrong positions
- `isCorrect`: Boolean indicating if guess was correct

## 🔒 Authentication

The API uses JWT tokens stored in HTTP cookies (`rajat` cookie name). Protected routes require the [`userAuthMiddleware`](src/middlewares/userMiddleware.js) middleware.

## 🔧 Key Utilities

- [`generateRoomCode`](src/utils/generateRoomCode.js): Generates unique 5-character room codes
- Database connection via [`connectDB`](src/db/db.js)
- Word seeding script in [`addWords.js`](scripts/addWords.js)

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **cookie-parser**: Cookie parsing middleware
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 🚧 Development Notes

- The `/room/getRooms` endpoint is for development purposes only
- Passwords are stored in plain text (implement hashing for production)
- CORS is configured to allow all origins (`*`)
- Database connection string is hardcoded in the seeding script

## 🔜 Potential Improvements

- Implement password hashing
- Add input validation and sanitization
- Implement rate limiting
- Add comprehensive error handling
- Add API documentation (Swagger)
- Implement WebSocket for real-time updates
- Add game time limits and multiple rounds