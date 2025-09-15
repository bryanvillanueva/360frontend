# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Runs the app in development mode on http://localhost:3000
- `npm run build` - Builds the app for production to the `build` folder
- `npm test` - Launches the test runner in interactive watch mode
- `npm run eject` - One-way operation to expose all configuration files

## Application Architecture

### Core Structure
This is a React 19 frontend application for "SOFT 360", an electoral management system built with Create React App. The application manages electoral data including voters (votantes), leaders (líderes), and recommended people (recomendados) organized into groups (grupos).

### Backend Integration
- **Base API URL**: `https://backend-node-soft360-production.up.railway.app`
- **API Service**: Centralized in `src/components/api.js` with HTTP methods and domain-specific APIs
- **Data Flow**: Components primarily use axios directly, but api.js provides a structured service layer

### Key UI Framework
- **Material-UI (MUI) v6**: Primary component library
- **Design System**: Custom color palette `["#018da5", "#80daeb", "#67ddab", "#0b9b8a", "#909090"]`
- **Typography**: Montserrat font family throughout
- **Layout**: Persistent drawer navigation (280px width) with responsive mobile support

### Navigation & Routing Structure
```
/ (Dashboard)
/grupos (Groups management)
/crear/recomendados (Create Recommended)
/crear/lideres (Create Leaders)
/crear/votantes (Create Voters)
/cargas/recomendados (Upload Recommended - pending)
/cargas/lideres (Upload Leaders - pending)
/cargas/votantes (Upload Voters)
/filtros/votantes (Filter Voters)
/filtros/pdf (Upload PDF - disabled)
```

### Component Organization
- **DrawerMenu.js**: Persistent navigation with modern styling, animation effects, and responsive design
- **Dashboard.js**: Main analytics view with statistics cards, trend charts (Recharts), and leader compliance tracking
- **Grupos.js**: Full CRUD group management with real-time statistics, search, and modal dialogs
- **Form Components**: Dedicated creation forms for each entity type (leaders, voters, recommended)
- **Upload Components**: File upload functionality for bulk data operations

### Key API Endpoints Used
- `/grupos/total` - Get total groups count
- `/grupos/:id/recomendados` - Get group's recommended people
- `/grupos/:id/completo` - Get complete group structure (recommended + leaders + voters)
- `/grupos/:id` (PUT) - Update group name/description
- `/votantes/total`, `/lideres/total`, `/recomendados/total` - Entity totals
- `/votantes/promedio_lider` - Average voters per leader
- `/votantes/tendencia_mensual` - Monthly voter trends

### Styling Approach
- **Styled Components**: Extensive use of MUI's `styled()` for custom components
- **Gradient Design Language**: Linear gradients throughout with the custom color palette
- **Animation System**: CSS transitions, Material-UI Grow/Fade animations, and custom keyframe animations
- **Responsive Design**: Mobile-first approach with drawer collapse and layout adjustments

### State Management
- **Local Component State**: useState hooks for component-specific data
- **No Global State**: Currently no Redux/Context for shared state
- **API State**: Direct axios calls with loading/error handling in components

### Data Relationships
- **Groups** contain **Recommended People**
- **Recommended People** can become **Leaders**
- **Leaders** manage **Voters**
- **Dashboard** shows compliance metrics based on leader objectives vs actual voter counts

### Notable Development Patterns
1. **Fallback Data Strategy**: Components implement real API calls with fallback to simulated data
2. **Error Boundaries**: Comprehensive error handling with user notifications via Snackbar
3. **Loading States**: Skeleton components and CircularProgress for better UX
4. **Form Validation**: Client-side validation with disabled states and required field handling
5. **Responsive Tables**: Material-UI TableContainer with proper mobile handling

### Spanish Language
The application is fully in Spanish - all UI text, comments, and variable names use Spanish terminology. Key terms:
- Votantes = Voters
- Líderes = Leaders
- Recomendados = Recommended People
- Grupos = Groups

When working with this codebase, maintain Spanish language consistency and follow the established Material-UI design patterns with the custom color palette.