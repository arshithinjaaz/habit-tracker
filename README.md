# 🎯 Habit Tracker App

A modern, production-ready habit tracking application built with React, Material-UI, and comprehensive security features. Track your daily habits, log memories, and visualize your progress with beautiful, real-time graphs.

## ✨ Features

### 🔒 Security & Privacy
- **PIN Protection**: Secure account access with SHA-256 hashed PINs
- **XSS Prevention**: All user inputs sanitized with DOMPurify
- **Data Validation**: Zod schemas ensure data integrity
- **Local Storage**: Your data stays on your device

### 🎨 Modern UI/UX
- **Material-UI Components**: Sleek, professional design with Material-UI
- **Smooth Animations**: Engaging interactions using Framer Motion
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Dark Mode**: Beautiful dark theme with purple gradient accents
- **Loading States**: Skeleton components for better perceived performance

### 📊 Real-Time Progress Tracking
- **Dynamic Charts**: Visualize your progress with Chart.js (Line, Bar, and Doughnut charts)
- **7-Day History**: Track your habit completion over the past week
- **Score Analytics**: View average, best day, and total days tracked
- **Streak Counter**: Track consecutive days of completion

### 📝 Daily Features
- **Greeting Component**: Personalized greetings based on time of day with motivational quotes
- **Memory Logger**: Write and save daily reflections and memories
- **Custom Habits**: Add, edit, and delete your own habits
- **Category Filtering**: Filter habits by Health, Wellness, Learning, Productivity, and Social

### 🏗️ Architecture & Quality
- **Service Layer**: Centralized data management with storage service
- **Custom Hooks**: Reusable logic with automatic debouncing
- **Error Boundaries**: Graceful error handling
- **Data Migration**: Automatic schema updates
- **TypeScript Ready**: Configuration for gradual migration
- **Test Coverage**: 26 unit tests with 100% coverage for utilities

### ☁️ Firebase Integration (Optional)
- **Real-Time Sync**: Data syncs across devices in real-time
- **Offline Support**: Fallback to local storage when Firebase is unavailable
- **Easy Setup**: Simple configuration with environment variables

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **ARIA Labels**: Proper labeling for screen readers
- **Semantic HTML**: Accessible markup structure

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arshithinjaaz/habit-tracker.git
   cd habit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase (Optional)**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration:
     ```bash
     cp .env.example .env
     ```
   - Update the values in `.env` with your Firebase project details
   - The app works with local storage if Firebase is not configured

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Preview production build
npm run preview
```

### Testing

The project includes comprehensive unit tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

**Current Test Coverage:**
- 26 unit tests (all passing)
- 100% coverage for utility functions
- Tests for crypto, sanitization, and date utilities

## 🛠️ Built With

### Core Technologies
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Framer Motion** - Animation library
- **Chart.js** & **react-chartjs-2** - Data visualization

### Security & Validation
- **DOMPurify** - XSS prevention
- **Zod** - Schema validation
- **Web Crypto API** - PIN hashing

### Development Tools
- **TypeScript** - Type safety (configuration ready)
- **Vitest** - Testing framework
- **jsdom** - DOM testing environment
- **ESLint** - Code linting

### Optional
- **Firebase** - Real-time database and authentication

## 📁 Project Structure

```
habit-tracker/
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin panel components
│   │   └── Skeleton/      # Loading skeleton components
│   ├── constants/         # Application constants
│   │   ├── habits.js      # Habit-related constants
│   │   └── theme.js       # Theme configuration
│   ├── hooks/             # Custom React hooks
│   │   └── useLocalStorage.js
│   ├── schemas/           # Zod validation schemas
│   │   ├── habit.schema.js
│   │   ├── memory.schema.js
│   │   └── user.schema.js
│   ├── services/          # Business logic services
│   │   ├── storage.service.js
│   │   ├── migration.service.js
│   │   └── logger.service.js
│   ├── utils/             # Utility functions
│   │   ├── crypto.js      # PIN hashing
│   │   ├── sanitize.js    # XSS prevention
│   │   ├── date.js        # Date utilities
│   │   └── storageManager.js
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── ARCHITECTURE.md        # Architecture documentation
├── .env.example           # Environment variables template
├── package.json           # Project dependencies
└── README.md              # Documentation
```

## 🎮 Usage

### Daily Questionnaire
Answer 8 yes/no questions about your daily habits:
- Exercise
- Water intake
- Reading
- Meditation
- Task completion
- Social connection
- Gratitude practice
- Sleep quality

### Memory Logger
- Write daily reflections and memories
- View timestamped entries
- Delete old memories

### Progress Graphs
- Switch between Line, Bar, and Doughnut chart views
- Track your daily habit completion percentage
- View 7-day average and best day statistics

## 🔐 Firebase Setup (Optional)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. (Optional) Enable Authentication for user accounts
4. Copy your configuration to `.env`

The app works perfectly with local storage if you skip Firebase setup!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Roadmap

## 🔐 Security

### Data Protection
- **Local Storage**: All data is stored locally on your device
- **PIN Hashing**: User PINs are hashed using SHA-256
- **XSS Prevention**: All user inputs are sanitized with DOMPurify
- **Input Validation**: Zod schemas ensure data integrity
- **No Tracking**: No personal data is collected or sent to third parties

### Automatic Migration
- Legacy plain-text PINs are automatically migrated to hashed versions
- Data schema updates are handled automatically

## 🏗️ Architecture

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md)

### Key Components
- **Service Layer**: Centralized data management
- **Custom Hooks**: Reusable logic with automatic debouncing
- **Error Boundaries**: Graceful error handling
- **Data Migration**: Automatic schema updates
- **Logging**: Structured logging for debugging

### Best Practices
- Input validation on all user data
- Sanitization to prevent XSS attacks
- Debounced localStorage writes
- Quota management for localStorage
- Comprehensive error handling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code patterns
- Add tests for new features
- Update documentation
- Validate and sanitize user input
- Handle errors gracefully

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Roadmap

- [x] Custom habit creation
- [x] Habit streaks and achievements
- [x] Dark mode toggle
- [x] Data export functionality
- [x] Security improvements (PIN hashing, XSS prevention)
- [x] Comprehensive testing
- [ ] User authentication with Firebase
- [ ] Export data to CSV
- [ ] Reminder notifications
- [ ] Social sharing features
- [ ] PWA with offline support
- [ ] Multi-device sync

## 💡 Acknowledgments

- Material-UI for the beautiful component library
- Framer Motion for smooth animations
- Chart.js for powerful data visualization
- Firebase for real-time data sync
- DOMPurify for XSS prevention
- Zod for schema validation

---

**Built with ❤️ for better habits**

*Production-ready, secure, and maintainable habit tracker for personal growth*
