# Gumbaynggirr Connect 🌿

A React Native Expo application designed to connect the Gumbaynggirr community through cultural events, language learning, and community engagement. Built with an offline-first approach and culturally-inspired design.

## 🌟 Features

### Core Functionality

- **📅 Cultural Events Calendar** - Browse and discover community events with interactive calendar interface
- **🎤 Voice Recording** - Record and store cultural voice notes with audio playback
- **📍 Location Services** - Find events near you with distance calculations
- **📱 Offline-First Design** - Full functionality without internet connection
- **🎨 Culturally-Inspired UI** - Earth-tone design system respecting Gumbaynggirr culture

### Technical Features

- **File-based Navigation** - Expo Router for intuitive app structure
- **SQLite Database** - Local data persistence for events and recordings
- **Gesture Support** - Advanced touch interactions with React Native Gesture Handler
- **Network Awareness** - Real-time connectivity status and sync indicators
- **Secure Storage** - Encrypted storage for sensitive data

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm (comes with Node.js)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gumbaynggirr-connect
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on your preferred platform**

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

## 📱 Development

### Available Scripts

```bash
# Development
npm start           # Start Expo development server
npm run android     # Run on Android emulator/device
npm run ios         # Run on iOS simulator/device
npm run web         # Run in web browser

# Code Quality
npm run lint        # Run ESLint with Expo configuration

# Project Management
npm run reset-project   # Reset to clean project structure
```

### Project Structure

```
gumbaynggirr-connect/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx        # Root layout with theme and gestures
│   ├── index.tsx          # Home screen
│   ├── calendar.tsx       # Events calendar
│   └── event/
│       └── [id].tsx       # Dynamic event details
├── components/            # Reusable UI components
│   ├── Skeleton.tsx       # Loading skeleton component
│   └── VoiceRecorder.tsx  # Audio recording component
├── constants/             # App constants and themes
│   └── colors.ts          # Cultural color palette
├── data/                  # Static data files
│   └── events.json        # Sample events data
├── hooks/                 # Custom React hooks
│   └── useEvents.ts       # Events data management
├── lib/                   # Utility libraries
│   ├── db.ts              # SQLite database setup
│   ├── location.ts        # Location services
│   └── storage.ts         # Data persistence
├── types/                 # TypeScript type definitions
│   └── Event.ts           # Event data types
└── assets/                # Images, fonts, and other assets
```

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native 0.79.5 with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **Database**: SQLite (expo-sqlite) for local storage
- **Audio**: Expo Audio for voice recording and playback
- **Location**: Expo Location for GPS services
- **Storage**: AsyncStorage and SecureStore for data persistence
- **UI**: Custom design system with Lucide React Native icons
- **Language**: TypeScript with strict mode

### Data Flow

1. **Events Data**: Loaded from `data/events.json` and cached in SQLite
2. **Voice Recordings**: Stored locally with metadata in database
3. **User Preferences**: Saved in SecureStore for privacy
4. **Location Data**: Cached and used for distance calculations

## 🎨 Design System

### Color Palette

- **Ochre**: `#d4a574` - Primary brand color
- **Deep Earth**: `#8b4513` - Text and accents
- **River Blue**: `#4a90a4` - Interactive elements
- **Warm White**: `#faf8f5` - Background
- **Clay**: `#a0522d` - Error states

### Typography

- **Headings**: Bold, culturally-inspired font weights
- **Body Text**: Readable, accessible font sizes
- **Captions**: Subtle text for metadata

## 🔧 Configuration

1. **Android Development**

   - Install Android Studio
   - Set up Android SDK and emulator
   - Enable USB debugging for physical devices

2. **iOS Development** (macOS only)

   - Install Xcode from Mac App Store
   - Set up iOS Simulator
   - Configure development certificates

3. **Expo Development Build**

   ```bash
   # Install development client
   npx expo install expo-dev-client

   # Create development build
   npx eas build --profile development --platform all
   ```

### App Configuration

The app is configured in `app.json` with:

- **Bundle ID**: `com.aktarujjaman.gumbaynggirrconnect`
- **Permissions**: Audio recording, location access, network state
- **Splash Screen**: Custom cultural branding
- **Icons**: Adaptive icons for Android

## 📦 Building for Production

### EAS Build Setup

1. **Install EAS CLI**

   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**

   ```bash
   eas build:configure
   ```

3. **Build for Production**

   ```bash
   # Android
   eas build --platform android

   # iOS
   eas build --platform ios

   # Both platforms
   eas build --platform all
   ```

### Build Profiles

The app supports multiple build profiles:

- **Development**: For testing and debugging
- **Preview**: For internal testing
- **Production**: For app store distribution
