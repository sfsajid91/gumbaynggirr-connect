# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Gumbaynggirr Connect** is a React Native Expo app designed to connect the Gumbaynggirr community through cultural events, language learning, and community engagement. The app features offline-first functionality, cultural event calendars, voice recording capabilities, and location-based services.

## Development Commands

### Essential Commands

```bash
# Install dependencies (uses pnpm as package manager)
pnpm install

# Start development server
pnpm start
# or
npx expo start

# Platform-specific builds
pnpm run android    # Android emulator
pnpm run ios        # iOS simulator
pnpm run web        # Web browser

# Code quality
pnpm run lint       # ESLint with Expo config
```

### Build and Deploy

```bash
# EAS Build (Expo Application Services)
npx eas build --platform android
npx eas build --platform ios

# Development builds
npx eas build --profile development --platform all
```

### Testing and Development

```bash
# Reset project structure (removes example code)
pnpm run reset-project

# Clear Expo cache if needed
npx expo start --clear
```

## Architecture Overview

### Core Technologies

- **React Native (0.79.5)** with Expo SDK 53
- **Expo Router** for file-based navigation
- **TypeScript** with strict mode enabled
- **SQLite** (expo-sqlite) for local data persistence
- **AsyncStorage** for simple key-value storage
- **Expo AV** for audio recording and playback

### Application Structure

#### Navigation Pattern

- **File-based routing** using Expo Router
- Main screens: `app/index.tsx` (home), `app/calendar.tsx` (events calendar)
- Layout defined in `app/_layout.tsx` with gesture handling and theming

#### Data Architecture

- **Offline-first design** with SQLite local storage
- Events data from `data/events.json` cached locally
- Custom hook `useEvents()` manages data fetching and caching
- Audio recordings stored with `expo-sqlite` database

#### Component Architecture

- **Shared components** in `/components` directory:
  - `VoiceRecorder.tsx` - Audio recording with waveform visualization
  - `Skeleton.tsx` - Loading states

#### Core Libraries and Services

```typescript
// Key services
lib / storage.ts; // AsyncStorage wrapper for caching
lib / db.ts; // SQLite database operations
lib / audio.ts; // Audio recording utilities
lib / location.ts; // Geolocation services
```

### Cultural Design System

#### Color Palette (constants/colors.ts)

```typescript
Colors = {
  primaryOchre: "#d4a574", // Primary actions, cultural significance
  deepEarth: "#8b4513", // Headers, grounding elements
  riverBlue: "#4a90a4", // Secondary actions
  sunsetRed: "#cc6b49", // Events, alerts, attention
  warmWhite: "#fef7f0", // Background
  softGrey: "#f5f5f0", // Cards, containers
  textDark: "#2d2d2a", // Primary text
  textMedium: "#5d5d5a", // Secondary text
};
```

### Key Features

#### Event Management

- Community events loaded from JSON with SQLite caching
- Calendar view with swipe gestures for month navigation
- Event details with location services and distance calculation
- Pull-to-refresh functionality

#### Voice Recording

- Cultural voice notes linked to events
- Audio recording with permission handling
- Custom audio player with progress indicators
- Offline storage of recordings

#### Offline Functionality

- Events available offline through SQLite caching
- Audio recordings stored locally
- Network status awareness with online/offline indicators
- Graceful degradation when offline

## Development Guidelines

### File Organization

```
app/              # Expo Router screens
components/       # Reusable UI components
constants/        # Theme, colors, app constants
hooks/            # Custom React hooks
lib/              # Utility functions and services
types/            # TypeScript type definitions
data/             # Static data files (events.json)
v4/               # Legacy prototype/reference (flow2.md)
```

### TypeScript Configuration

- Strict mode enabled
- Path mapping: `@/*` resolves to project root
- Includes Expo types and custom type definitions

### State Management

- React hooks for component-level state
- Custom hooks (`useEvents`) for data fetching
- Local storage for persistence
- No external state management library (intentionally simple)

### Audio Permissions

The app requires microphone permissions for voice recording features. Permissions are handled gracefully with user prompts and fallback messaging.

### Platform Considerations

- **Android**: Edge-to-edge enabled, audio permissions required
- **iOS**: Tablet support enabled
- **Web**: Metro bundler with static output
- **Universal**: React Native Web for cross-platform compatibility

## Legacy and Reference

The `v4/` directory contains a previous web-based prototype with detailed design specifications in `flow2.md`. This includes:

- Cultural color meanings and design rationale
- Technical implementation details for web version
- User journey flows and interaction patterns
- Performance targets and optimization strategies

Use this as reference for understanding the cultural context and design decisions, but the current React Native app is the active codebase.

## Testing Locations

Event data includes real Australian locations in NSW Gumbaynggirr Country:

- Bowraville, Nambucca Heads, Macksville
- Bellingen, Coffs Harbour, Dorrigo
- South Kempsey, Port Macquarie

## Cultural Context

This app serves the Gumbaynggirr Aboriginal community. When working on this project:

- Respect cultural significance of colors, language, and content
- Maintain offline-first functionality for remote area accessibility
- Preserve the community-focused design and user experience
- Test audio features thoroughly as cultural voice notes are central to the app's purpose
