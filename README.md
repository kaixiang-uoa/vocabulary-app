# Vocabulary Learning App

A modern React-based vocabulary learning application designed to help users efficiently memorize words while serving as a React technology stack practice project.

## 🎯 Project Overview

This project is a fully functional vocabulary learning platform that supports word management, review testing, progress tracking, and more. It adopts modern frontend technology stack, focuses on user experience and code quality, making it suitable as a React development capability showcase project.

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.1.0** - Latest version of React framework
- **TypeScript 4.9.5** - Type-safe JavaScript superset
- **React Router 7.7.0** - Single-page application routing

### Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Heroicons 2.2.0** - Beautiful SVG icon library
- **Responsive Design** - Support for desktop and mobile

### State Management & Data
- **React Hooks** - Custom Hooks for state management
- **React Context API** - Global state management and component communication
- **LocalStorage** - Local data persistence
- **UUID** - Unique identifier generation

### Internationalization
- **i18next 25.3.2** - Internationalization solution
- **react-i18next 15.6.1** - React internationalization integration
- **Bilingual Support** - Chinese and English

### Development Tools
- **Create React App** - React application scaffolding
- **ESLint** - Code quality checking
- **PostCSS & Autoprefixer** - CSS post-processors

## 🚀 Core Features

### 📚 Word Management
- **Unit-based Organization** - Organize words by theme or difficulty
- **Batch Import/Export** - Support JSON/CSV formats
- **Word Editing** - Real-time modification of words and meanings
- **Mastery Status Tracking** - Mark word mastery levels

### 🧠 Learning Modes
- **Card Review** - Flip-card learning experience
- **Spelling Practice** - Audio-based spelling with real-time error feedback
- **Progress Statistics** - Visual learning progress and mastery rates
- **Review History** - Track learning trajectory and error statistics

### 🎮 User Experience
- **Responsive Design** - Adapt to various device screens
- **Bilingual Interface** - Chinese/English interface switching
- **Auto-play** - Intelligent pronunciation playback
- **Keyboard Shortcuts** - Enhanced operational efficiency

## 🏗️ Project Architecture

### Directory Structure
```
src/
├── components/     # Reusable components
│   ├── ui/        # Base UI components
│   └── ...        # Business components
├── pages/         # Page components
├── hooks/         # Custom Hooks
├── utils/         # Utility functions
├── services/      # Service layer
├── types/         # TypeScript type definitions
├── locales/       # Internationalization files
└── styles/        # Style files
```

### Design Patterns
- **Component-based Development** - Highly reusable component design
- **Custom Hooks** - Logic reuse and state management
- **Context API** - Global state management and component communication
- **Service Layer Abstraction** - Separation of data operations and business logic
- **Type Safety** - TypeScript type definitions

## 🔧 Technical Highlights

### 1. Modern React Practices
- Use of React 19 latest features
- Functional components + Hooks architecture
- Performance-optimized component design

### 2. Type-safe Development
- Comprehensive TypeScript coverage
- Strict type definitions
- Compile-time error checking

### 3. Responsive Design
- Tailwind CSS atomic styling
- Mobile-first design approach
- Smooth interactive experience

### 4. Internationalization Support
- Complete Chinese/English support
- Dynamic language switching
- Localized content management

### 5. Data Persistence
- LocalStorage local storage
- Data import/export functionality
- User data security protection
- Data layer abstraction design, supporting future upgrades to IndexedDB or backend databases

## 📱 Feature Demo

### Main Pages
- **Homepage** - Unit overview and quick operations
- **Unit Details** - Word list and management
- **Review Page** - Card-based learning experience
- **Spelling Practice** - Audio-based spelling training

### Core Interactions
- Word card flip animations
- Real-time spelling validation feedback
- Progress bars and statistical charts
- Batch operations and import/export

## 🚧 Features in Development

### Near-term Plans
- **AI Smart Testing** - AI-based question generation
- **Vocabulary Database Enhancement** - Expand vocabulary database
- **Race Condition Optimization** - Improve concurrent operation stability
- **Data Layer Upgrade** - IndexedDB or backend database support

### Technical Optimizations
- **Performance Optimization** - Component lazy loading and code splitting
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Test Coverage** - Unit testing and integration testing

## 🛠️ Local Development

### Requirements
- Node.js >= 16.0.0
- npm or yarn

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Start Development Server
```bash
npm start
# or
yarn start
```

### Build Production Version
```bash
npm run build
# or
yarn build
```

## 📊 Project Statistics

- **Lines of Code**: ~15,000+ lines
- **Component Count**: 20+ reusable components
- **Page Count**: 5 main pages
- **Custom Hooks**: 4
- **Utility Modules**: 10+ modules

## 🎯 Learning Value

This project demonstrates the following React development skills:

1. **Modern React Development** - Hooks, functional components, performance optimization
2. **TypeScript Application** - Type definitions, interface design, type safety
3. **State Management** - Custom Hooks, Context API, state lifting, data flow design
4. **Component Design** - Reusable components, composition patterns, Props design
5. **Routing Management** - Single-page application routing, navigation guards, parameter passing
6. **Styling System** - Tailwind CSS, responsive design, animation effects
7. **Internationalization** - Multi-language support, dynamic switching, localization
8. **Data Persistence** - LocalStorage, import/export, data management
9. **User Experience** - Interaction design, feedback mechanisms, accessibility
10. **Engineering** - Project structure, code standards, build deployment

## 📄 License

MIT License 