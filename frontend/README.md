# 📱 Shiffy Frontend - React Native Mobile App

**Expo-powered mobile application for AI-based shift management**

<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Framework-Expo%2054-purple?style=for-the-badge" alt="Framework" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge" alt="Language" />
  <img src="https://img.shields.io/badge/Styling-NativeWind-38bdf8?style=for-the-badge" alt="Styling" />
</p>

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Geliştirme](#-geliştirme)
- [Ekranlar](#-ekranlar)
- [Component Library](#-component-library)
- [Authentication](#-authentication)
- [API Integration](#-api-integration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 🎯 Proje Hakkında

Shiffy Frontend, **React Native + Expo** ile geliştirilmiş, **dual-user** (Manager + Employee) mobil uygulamasıdır. **NativeWind** (Tailwind CSS for React Native) ile stillendirilmiş, **Expo Router** ile dosya tabanlı navigation kullanan modern bir mimari sunar.

### 🎨 Tasarım Felsefesi
- **Mobile-First:** iOS ve Android native performans
- **Intuitive UX:** Kolay kullanım, minimal learning curve
- **Consistent Design:** Her ekranda tutarlı tasarım dili (ongoing improvement)
- **Accessibility:** Erişilebilir UI components (future enhancement)

---

## ✨ Özellikler

### 👔 Manager Panel
- [x] **Dashboard:** İstatistikler, aktif çalışanlar, bekleyen tercihler
- [x] **Çalışan Yönetimi:** CRUD operations, notlar, aktif/pasif toggle
- [x] **Vardiya İnceleme:** 1800+ satırlık comprehensive shift review screen
- [x] **Satış Raporları:** Günlük/haftalık ciro ve satış takibi
- [x] **Ayarlar:** Deadline, çalışma günleri, vardiya süreleri

### 👤 Employee Panel
- [x] **Ana Ekran:** Hoşgeldin mesajı, next shift, quick actions
- [x] **Tercih Girişi:** 30dk slot bazlı interaktif grid
- [x] **Takvim Görüntüleme:** Onaylanan vardiyalar
- [x] **Profil:** Şifre değiştirme, hesap bilgileri

### 🔐 Authentication
- [x] **Dual Auth:** Manager (Supabase) + Employee (Custom JWT)
- [x] **Secure Storage:** AsyncStorage with token management
- [x] **Password Reset:** First-login mandatory password change
- [x] **Auto Logout:** Token expiry handling

---

## 🛠 Teknoloji Stack

```yaml
Platform:           iOS + Android (cross-platform)
Framework:          Expo SDK 54
React Native:       0.81.5
Language:           TypeScript 5.9 (strict mode)
Routing:            Expo Router 6.0 (file-based)
Styling:            NativeWind 4.2 (Tailwind CSS)
State:              React Hooks (useState, useEffect, useContext)
Storage:            @react-native-async-storage/async-storage
Auth Provider:      Supabase Auth (managers) + Custom JWT (employees)
API Client:         Fetch API with custom wrapper
UI Components:      Custom components + expo-linear-gradient
Navigation:         @react-navigation/native + bottom-tabs
Icons:              @expo/vector-icons (Ionicons, MaterialIcons)
Gestures:           react-native-gesture-handler
```

### 📦 Temel Bağımlılıklar

```json
{
  "@supabase/supabase-js": "^2.76.1",
  "expo": "~54.0.20",
  "expo-router": "~6.0.13",
  "expo-linear-gradient": "~15.0.7",
  "nativewind": "^4.2.1",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-picker/picker": "2.11.1"
}
```

---

## 📁 Proje Yapısı

```
frontend/
├── app/                              # Expo Router screens
│   ├── _layout.tsx                  # Root layout
│   ├── index.tsx                    # Splash/Entry screen
│   │
│   ├── (auth)/                      # Public screens (no auth)
│   │   ├── _layout.tsx
│   │   ├── user-select.tsx         # Manager/Employee seçimi
│   │   ├── manager-login.tsx
│   │   ├── manager-register.tsx
│   │   ├── employee-login.tsx
│   │   └── employee-password-reset.tsx
│   │
│   ├── (manager)/                   # Protected manager routes
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx           # 📊 Stats dashboard
│   │   ├── employees/
│   │   │   ├── index.tsx          # 📋 Employee list
│   │   │   ├── add.tsx            # ➕ Add employee
│   │   │   └── [id].tsx           # 👤 Employee detail
│   │   ├── shift-review.tsx       # 🗓️ Shift review (1876 lines!)
│   │   ├── reports.tsx            # 💰 Sales reports
│   │   └── settings.tsx           # ⚙️ Settings
│   │
│   └── (employee)/                  # Protected employee routes
│       ├── _layout.tsx
│       ├── home.tsx                # 🏠 Home screen
│       ├── preferences.tsx         # 📅 Shift preferences
│       ├── my-shifts.tsx          # 🗓️ My schedule
│       └── profile.tsx            # 👤 Profile
│
├── components/                      # Reusable components
│   ├── ui/                         # Basic UI components
│   │   ├── Loading.tsx
│   │   ├── Button.tsx
│   │   └── Card/                  # Card component (NEW)
│   │       ├── index.tsx
│   │       ├── Card.tsx
│   │       └── Card.styles.ts
│   │
│   └── features/                   # Feature-specific components
│       ├── StatCard.tsx           # Dashboard stat card
│       ├── EmployeeCard.tsx       # Employee list item
│       └── ShiftGrid/             # Shift selection grid
│
├── services/                        # API integration
│   ├── api-client.ts              # Base HTTP client
│   ├── auth.ts                    # Manager auth (Supabase)
│   ├── employee-auth.ts           # Employee auth (JWT)
│   ├── employee.ts                # Employee CRUD
│   ├── shift.ts                   # Shift preferences
│   └── schedule.ts                # Schedule operations
│
├── config/
│   └── supabase.config.ts         # Supabase client config
│
├── constants/
│   └── theme.ts                   # Theme constants (WIP: needs design tokens)
│
├── hooks/                          # Custom React hooks
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
│
├── types/
│   └── index.ts                   # TypeScript type definitions
│
├── utils/
│   └── storage.ts                 # AsyncStorage helpers
│
├── docs/                           # Documentation
│   ├── README.md                  # This file
│   ├── SHIFFY_FRONTEND_DOCS.md    # Comprehensive docs
│   ├── ROADMAP.md                 # Development roadmap
│   ├── UI_UX_ANALYSIS_AND_ROADMAP.md  # UI/UX improvement plan
│   ├── FRONTEND_CLEANUP_ROADMAP.md    # Code cleanup tasks
│   ├── QUICK_WINS_PROGRESS.md         # Completed improvements
│   ├── CLEAR_TOKEN_INSTRUCTIONS.md    # Auth debugging guide
│   └── DEBUG_TOKEN_ANALYSIS.md        # Token management deep dive
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── metro.config.js
├── app.json
└── .gitignore
```

---

## 🚀 Kurulum

### Ön Gereksinimler
```bash
Node.js >= 20.x
npm >= 10.x
Expo CLI (npx expo)
iOS Simulator (Mac) veya Android Emulator
```

### Kurulum Adımları

```bash
# 1. Repository klonla (root'tan)
git clone https://github.com/ymcbzrgn/Shiffy.git
cd Shiffy/frontend

# 2. Dependencies yükle
npm install

# 3. Supabase config ayarla
nano config/supabase.config.ts
# Supabase URL ve anon key'i gir

# 4. Backend API URL ayarla
nano services/api-client.ts
# API_URL değişkenini local/production IP ile güncelle

# 5. Development server başlat
npx expo start

# Seçenekler:
# - 'a' → Android emulator
# - 'i' → iOS simulator
# - QR kod → Fiziksel cihaz (Expo Go ile)
```

### Supabase Config Örneği

**`config/supabase.config.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### API Client Config

**`services/api-client.ts`:**
```typescript
// Development: Local network IP
const API_URL = 'http://192.168.1.100:3000/api';

// Production: Backend server URL
// const API_URL = 'https://api.shiffy.com/api';
```

---

## 🧪 Testing

```bash
# Unit tests (TBD)
npm test

# E2E tests (TBD)
npm run test:e2e

# Type checking
npx tsc --noEmit
```

---

## 📱 Deployment

### Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build Android
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production
```

### Manual Build

```bash
# Android APK
npx expo build:android -t apk

# iOS (requires Apple Developer account)
npx expo build:ios -t archive
```

---

## 📚 Dökümantasyon Kaynakları

- **[SHIFFY_FRONTEND_DOCS.md](./SHIFFY_FRONTEND_DOCS.md)** - Kapsamlı teknik dökümantasyon
- **[ROADMAP.md](./ROADMAP.md)** - Development roadmap
- **[UI_UX_ANALYSIS_AND_ROADMAP.md](./UI_UX_ANALYSIS_AND_ROADMAP.md)** - UI/UX iyileştirme planı
- **[FRONTEND_CLEANUP_ROADMAP.md](./FRONTEND_CLEANUP_ROADMAP.md)** - Code cleanup tasks
- **[QUICK_WINS_PROGRESS.md](./QUICK_WINS_PROGRESS.md)** - Tamamlanan iyileştirmeler

---

## 🗺️ Roadmap

### ✅ Tamamlanan (v1.0)
- [x] Dual authentication system
- [x] Manager dashboard
- [x] Employee management CRUD
- [x] Shift preferences grid
- [x] Sales reports
- [x] Settings screen
- [x] Token management (AsyncStorage)
- [x] API integration with backend

### 🚧 Devam Eden (v1.1)
- [ ] **Design System:** Tutarlı design tokens (COLORS, SPACING, TYPOGRAPHY)
- [ ] **Component Library:** Reusable UI components
- [ ] **Code Cleanup:** 1800+ satırlık dosyaları refactor et
- [ ] **Performance:** Optimize re-renders, lazy loading

### 🔮 Planlanan (v2.0)
- [ ] Push notifications
- [ ] Dark mode
- [ ] Offline mode (local database)
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Unit & E2E tests

---

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 Lisans

Bu proje **MIT License** ile lisanslanmıştır.

---

<p align="center">
  Made with ❤️ for Meta & YTU Llama Hackathon 2025
</p>
