# Hub - EduTrack Central Dashboard

## Overview

Hub is the central dashboard application for EduTrack CM. It serves as the main entry point and orchestration layer for the entire system, providing users with a unified interface to access all modules including Academic Management, Finance, and Administration.

## Purpose

The Hub application is responsible for:

- **Central Navigation**: Providing a unified navigation interface for all EduTrack modules
- **Dashboard**: Displaying key metrics and overview information across the system
- **Module Integration**: Serving as the orchestration point for all sub-applications
- **User Context**: Managing user sessions and providing role-based access to modules
- **System Health**: Monitoring and displaying the status of connected services

## Architecture

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Shared Packages**:
  - `@edutrack/ui` - Shared UI components
  - `@edutrack/utils` - Shared utilities
  - `@edutrack/api` - API client configuration

## Getting Started

### Development

```bash
npm run dev
```

Starts the development server on port 5173 (or next available port).

### Build

```bash
npm run build
```

Creates an optimized production build in the `dist` directory.

### Preview

```bash
npm run preview
```

Previews the production build locally.

## Project Structure

```
apps/hub/
├── src/
│   ├── main.jsx          # Application entry point
│   ├── App.jsx           # Root component
│   ├── index.css         # Global styles with Tailwind
│   ├── components/       # React components (to be added)
│   ├── pages/            # Page components (to be added)
│   ├── hooks/            # Custom React hooks (to be added)
│   └── utils/            # Utility functions (to be added)
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md             # This file
```

## Future Development

The Hub application is currently in the initial setup phase. Upcoming features include:

- [ ] Central dashboard with key metrics
- [ ] Role-based access control
- [ ] User profile management
- [ ] Module routing and navigation
- [ ] System notifications
- [ ] Integration with all EduTrack modules
- [ ] Analytics and reporting dashboard

## Dependencies

### Core Dependencies
- **react** (^18.2.0): UI library
- **react-dom** (^18.2.0): React DOM rendering
- **react-router-dom** (^6.20.0): Client-side routing

### Workspace Dependencies
- **@edutrack/ui**: Shared UI component library
- **@edutrack/utils**: Shared utility functions
- **@edutrack/api**: Centralized API client

### Development Dependencies
- **vite** (^5.0.0): Build tool and dev server
- **@vitejs/plugin-react** (^4.2.0): React support for Vite
- **tailwindcss** (^3.4.0): Utility-first CSS framework

## Configuration

### Vite Configuration

The application is configured with:
- **Port**: 5173 (non-strict, will use next available if occupied)
- **Output Directory**: `dist/`
- **Source Maps**: Enabled for production builds

### Environment Variables

(To be documented as the application evolves)

## Contributing

When contributing to the Hub application:

1. Follow the established project structure
2. Use Tailwind CSS for styling
3. Leverage shared packages from `@edutrack/*`
4. Ensure components are reusable and follow React best practices
5. Keep the Hub focused on orchestration and central functionality

## License

Part of the EduTrack CM system.
