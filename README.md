# 🏦 SafeBank - Modern Banking App

<div align="center">

![SafeBank Logo](https://img.shields.io/badge/SafeBank-Banking%20App-orange?style=for-the-badge&logo=react)
![React Native](https://img.shields.io/badge/React%20Native-0.73.0-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-50.0.0-black?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

**A modern banking application built with React Native, Expo, and Firebase**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Build & Deploy](#-build--deploy) • [Screenshots](#-screenshots)

</div>

---

## 🚀 Overview

SafeBank is a comprehensive banking application that demonstrates modern mobile development practices. Built with React Native and Expo, it features secure authentication, real-time transactions, push notifications, and a beautiful responsive UI.

### ✨ Key Features
- 🔐 **Secure Authentication** - Email/password + biometric login
- 💳 **Real-time Transactions** - Transfer money between users
- 🔔 **Push Notifications** - Instant transaction alerts
- 🌙 **Dark/Light Theme** - Beautiful responsive design
- 📱 **Cross-platform** - iOS, Android, and Web support
- 🚀 **Production Ready** - EAS Build + App Store deployment

---

## 📸 Screenshots

<div align="center">

### 🔐 **Authentication & Security**
<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
  <div style="text-align: center;">
    <img src="https://i.imgur.com/VNYfuKs.png" alt="Login Screen" width="280" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
    <p style="margin-top: 8px; font-size: 14px; color: #666;">📱 <strong>Login Screen</strong><br/>Secure email/password authentication</p>
  </div>
  <div style="text-align: center;">
    <img src="https://i.imgur.com/itOlks6.png" alt="Biometric Authentication" width="280" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
    <p style="margin-top: 8px; font-size: 14px; color: #666;">🔐 <strong>Biometric Auth</strong><br/>Face ID / Touch ID support</p>
  </div>
</div>

### 🏠 **Dashboard & Navigation**
<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
  <div style="text-align: center;">
    <img src="https://i.imgur.com/eTlwqLj.png" alt="Home Dashboard" width="280" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
    <p style="margin-top: 8px; font-size: 14px; color: #666;">🏦 <strong>Home Dashboard</strong><br/>Balance, quick actions & transactions</p>
  </div>
  <div style="text-align: center;">
    <img src="https://i.imgur.com/bNPty7G.png" alt="Money Transfer" width="280" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
    <p style="margin-top: 8px; font-size: 14px; color: #666;">💸 <strong>Money Transfer</strong><br/>Intuitive transfer interface</p>
  </div>
</div>

### ⚙️ **Settings & Management**
<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
  <div style="text-align: center;">
    <img src="https://i.imgur.com/OHixTiC.png" alt="Notifications Center" width="280" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
    <p style="margin-top: 8px; font-size: 14px; color: #666;">🔔 <strong>Notifications</strong><br/>Customizable notification settings</p>
  </div>
  <div style="text-align: center;">
    <img src="https://i.imgur.com/cVaEkN7.png" alt="User Profile" width="280" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
    <p style="margin-top: 8px; font-size: 14px; color: #666;">👤 <strong>User Profile</strong><br/>Complete user management</p>
  </div>
</div>

---

**🎨 Modern Dark Theme • 📱 Responsive Design • 🔒 Secure Authentication**

</div>

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React Native + Expo | Cross-platform development |
| **Language** | TypeScript | Type safety & better DX |
| **Styling** | Tailwind CSS (NativeWind) | Utility-first styling |
| **Backend** | Firebase (Auth + Firestore) | Authentication & database |
| **Navigation** | React Navigation v6 | Screen navigation |
| **Biometrics** | Expo Local Authentication | Face ID / Touch ID |
| **Notifications** | Expo Notifications | Push notifications |
| **State Management** | React Context + Hooks | Local state management |
| **Build & Deploy** | EAS Build + EAS Submit | Production builds |

---

## 📱 Features

### 🔐 Authentication System
- **Email/Password Login** - Secure Firebase authentication
- **Biometric Authentication** - Face ID (iOS) / Fingerprint (Android)
- **Session Persistence** - Automatic login restoration
- **Secure Storage** - Encrypted credential storage

### 💰 Banking Features
- **Real-time Balance** - Live account balance display
- **Money Transfers** - Send money to other users
- **Transaction History** - Complete transaction logs
- **Quick Actions** - Fast access to common features

### 🔔 Notifications
- **Push Notifications** - Real-time transaction alerts
- **Local Notifications** - In-app notification system
- **Customizable Settings** - Control notification preferences

### 🎨 User Experience
- **Responsive Design** - Works on all screen sizes
- **Dark/Light Theme** - Automatic theme switching
- **Smooth Animations** - React Native Reanimated
- **Accessibility** - Screen reader support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator

### 1. Clone & Install
```bash
git clone https://github.com/RodrigoGSantos1/safebank.git
cd safebank
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Expo Configuration
EXPO_PROJECT_ID=your_expo_project_id
```

### 3. Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Copy your Firebase config to `.env`

### 4. Run Development
```bash
# Start development server
npm start

# Run on specific platform
npm run android    # Android
npm run ios        # iOS  
npm run web        # Web
```

---

## 🏗️ Build & Deploy

### Production Build with EAS

#### 1. Configure EAS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure
```

#### 2. Build for Production
```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS  
eas build --platform ios --profile production

# Build for both platforms
eas build --platform all --profile production
```

#### 3. App Store Deployment

**Google Play Store (Android):**
```bash
# Submit to Google Play
eas submit --platform android

# Or build and submit in one command
eas build --platform android --profile production --auto-submit
```

**App Store (iOS):**
```bash
# Submit to App Store
eas submit --platform ios

# Or build and submit in one command  
eas build --platform ios --profile production --auto-submit
```

### Beta Testing

**TestFlight (iOS):**
```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios
```

**Google Play Beta (Android):**
```bash
# Build for internal testing
eas build --platform android --profile preview

# Submit to internal testing track
eas submit --platform android
```

---

## 📁 Project Structure

```
SafeBank/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── NotificationItem.tsx
│   │   ├── TransactionsTable.tsx
│   │   └── MoneyInput.tsx
│   ├── screens/            # App screens
│   │   ├── Auth/          # Authentication screens
│   │   ├── Home/          # Dashboard
│   │   ├── Transactions/  # Money transfer
│   │   ├── Notifications/ # Notification center
│   │   └── Users/         # User management
│   ├── services/          # External services
│   │   ├── firebase/      # Firebase integration
│   │   ├── biometric/     # Biometric auth
│   │   └── notifications/ # Push notifications
│   ├── contexts/          # React Context providers
│   │   ├── SecureAuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript definitions
├── assets/                # Static assets
├── docs/                  # Documentation
└── .env                   # Environment variables
```

---

## 🔧 Development

### Available Scripts
```bash
# Development
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web

# Build
npm run build      # Build for production
npm run build:android  # Android build
npm run build:ios      # iOS build

# Testing
npm test           # Run tests
npm run test:watch # Watch mode
```

### Code Quality
- **TypeScript** - Full type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

---

## 📊 Performance

- **Bundle Size**: Optimized with Metro bundler
- **Startup Time**: Fast app launch with lazy loading
- **Memory Usage**: Efficient state management
- **Network**: Optimized API calls with caching

---

## 🔒 Security

- **Authentication**: Firebase Auth with secure tokens
- **Biometrics**: Hardware-level security
- **Data Encryption**: Secure storage for sensitive data
- **Network Security**: HTTPS-only API calls
- **Input Validation**: Sanitized user inputs

---

## 📱 Platform Support

| Platform | Minimum Version | Status |
|----------|----------------|--------|
| **iOS** | iOS 12.0+ | ✅ Supported |
| **Android** | API 21+ | ✅ Supported |
| **Web** | Modern browsers | ✅ Supported |

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Authentication flow (email/password)
- [ ] Biometric authentication
- [ ] Money transfers
- [ ] Transaction history
- [ ] Push notifications
- [ ] Theme switching
- [ ] Responsive design

### Automated Testing
```bash
# Run unit tests
npm test

# Run integration tests  
npm run test:integration

# Run E2E tests
npm run test:e2e
```

---

## 📈 Monitoring & Analytics

- **Crash Reporting**: Expo Crashlytics integration
- **Performance Monitoring**: Firebase Performance
- **User Analytics**: Firebase Analytics
- **Error Tracking**: Sentry integration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/RodrigoGSantos1)
- LinkedIn: [Your Profile](https://www.linkedin.com/in/dev-rodrigo-guedes-dos-santos/)
<!-- - Portfolio: [your-website.com](https://your-website.com)https://www.linkedin.com/in/dev-rodrigo-guedes-dos-santos/ -->

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Amazing development platform
- [Firebase](https://firebase.google.com/) - Robust backend services
- [React Navigation](https://reactnavigation.org/) - Smooth navigation
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

<div align="center">

⭐ **Star this repository if it helped you!**

[![GitHub stars](https://img.shields.io/github/stars/RodrigoGSantos1/safebank?style=social)](https://github.com/RodrigoGSantos1/safebank)
[![GitHub forks](https://img.shields.io/github/forks/RodrigoGSantos1/safebank?style=social)](https://github.com/RodrigoGSantos1/safebank)

</div> 