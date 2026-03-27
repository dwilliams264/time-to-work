# Time to Work

A minimal daily time tracker to help you visualise and manage your work hours.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![MIT License](https://img.shields.io/badge/license-MIT-green)

## Features

- Visual timeline from 6:00 to 22:00
- Click and drag to create time blocks
- Move and resize blocks freely
- Set daily work hour goals with a progress bar
- Current time indicator
- Responsive — works on desktop and mobile

## Getting Started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/yourusername/time-to-work.git
cd time-to-work
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

## Usage

- **Create a block** — click and drag on the calendar
- **Move a block** — drag it to a new position
- **Resize a block** — drag the top or bottom edge
- **Delete a block** — click the × button on the block
- **Set a goal** — use the goal setter in the sidebar; quick presets available for common targets

## Project Structure

```
src/
├── components/     # UI components (calendar, goal setter, stats)
├── hooks/          # Custom React hooks
├── pages/          # Page-level components
├── constants/      # App-wide constants
├── types/          # TypeScript types
├── utils/          # Time calculation and formatting helpers
├── App.tsx
└── main.tsx
```

## Scripts

| Command               | Description                                 |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Start development server                    |
| `npm run build`       | Build for production                        |
| `npm run test:unit`   | Run unit tests (Vitest)                     |
| `npm run test:e2e`    | Run end-to-end tests (Playwright)           |
| `npm run test:ui`     | Run Playwright tests in interactive UI mode |
| `npm run test:report` | View Allure test report                     |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes and open a Pull Request

## License

MIT — see [LICENSE](LICENSE) for details.
