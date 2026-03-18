# Time to Work - Daily Time Tracker

A minimal, beautiful daily time tracker that helps you visualise and manage your work hours throughout the day.

![Time to Work](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![MIT License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📅 **Daily Calendar View** - Visual timeline from 6:00 to 22:00
- 🖱️ **Drag & Drop** - Click and drag to create time blocks
- ✏️ **Adjustable Blocks** - Move and resize time blocks easily
- 🎯 **Daily Goals** - Set your target work hours
- 📊 **Real-time Stats** - Track total time worked and remaining time
- ⏰ **Current Time Indicator** - See where you are in your day
- 🎨 **Beautiful UI** - Clean, minimal design with smooth gradients
- 📱 **Responsive** - Works on desktop and mobile devices
- 🚀 **Fast & Lightweight** - Built with Vite for optimal performance

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/time-to-work.git
cd time-to-work

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to view the app.

## 📖 Usage Guide

### Creating Time Blocks

- **Desktop**: Click and drag on the calendar to create a new time block
- **Mobile**: Tap and drag on the calendar

### Managing Time Blocks

- **Move**: Click/tap and drag a time block to reposition it
- **Resize**: Drag the top or bottom edge of a block to adjust duration
- **Delete**: Click the × button on any time block
- **Clear All**: Use the "Clear All" button to remove all blocks at once

### Setting Goals

- Use the goal setter in the sidebar to define your daily target
- Quick preset buttons available for common goals (6.5h, 7.5h, 8.5h)
- Track your progress with the real-time progress bar

## 🛠️ Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety and better DX
- **Vite** - Build tool and dev server
- **CSS3** - Styling with gradients and animations

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── DayCalendar.tsx       # Main calendar with drag & drop
│   ├── GoalSetter.tsx        # Daily goal configuration
│   └── TimeStats.tsx         # Progress and statistics
├── constants/         # Configuration constants
│   └── calendar.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   ├── timeCalculations.ts  # Time conversion utilities
│   └── timeFormatters.ts    # Time formatting utilities
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

## 🧪 Development

```bash
# Run linter
npm run lint

# Build TypeScript
npm run build
```

### Running Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

```bash
# Run all tests
npm run test

# Run tests with UI mode (interactive)
npm run test:ui

# Run only e2e tests
npm run test:e2e

# View test report (Allure)
npm run test:report
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Built with [Vite](https://vitejs.dev/)
- Styled with modern CSS
- Icons: Emoji

---

Made with ❤️ for better time tracking
