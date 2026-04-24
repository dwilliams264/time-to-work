# Time to Work

A small work planning app with two views: attendance tracking and daily time tracking.

## Features

- `Days to Work` for office attendance targets, monthly views, and summary stats
- `Time to Work` for daily time blocks, work goals, and lunch tracking
- Responsive layouts for desktop and mobile

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

- Use `/` for attendance planning and `/time-to-work` for daily scheduling
- Update attendance settings in the sidebar and mark days in the grid
- Drag on the daily calendar to create, move, resize, and remove time blocks

### Keyboard Navigation

The application is fully keyboard accessible:

- **Tab** / **Shift+Tab** — Navigate between interactive elements
- **Enter** or **Space** — Activate buttons and toggle states
- **Arrow Up/Down** — Move time blocks and lunch indicator (15-min increments)
- **Delete** or **Backspace** — Remove focused time block
- **Tab** from page load — Access skip navigation link

For complete keyboard shortcuts and accessibility features, see [ACCESSIBILITY.md](ACCESSIBILITY.md).

## Accessibility

This application targets **WCAG 2.1 AA compliance** with comprehensive support for:

- ✅ Full keyboard navigation
- ✅ Screen reader compatibility
- ✅ Focus indicators
- ✅ Reduced motion support
- ✅ ARIA live regions for dynamic updates

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for detailed implementation guide and testing procedures.

## Project Structure

```
src/
├── components/     # UI components
├── pages/          # Route-level entry points
├── hooks/          # State and interaction hooks
├── utils/          # Time and attendance helpers
├── constants/      # Shared configuration
├── types/          # App types
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
