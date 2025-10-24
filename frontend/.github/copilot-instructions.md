# Shiffy Frontend - AI Coding Instructions

## 🎯 Core Principles (NON-NEGOTIABLE)

### 0. 📱 MOBILE-ONLY PROJECT (EN ÖNEMLİ KURAL!)
**BU PROJE TAMAMEN MOBILE ODAKLIDIR. WEB DESTEĞİ YOKTUR!**

#### ❌ ASLA YAPILMAMASI GEREKENLER:
- Web browser'da test etme (`npm start` sonrası `w` tuşuna BASMA!)
- Web için responsive design düşünme
- Web-specific code yazma (DOM manipülasyonu, window, document vs.)
- CSS media queries kullanma
- Web framework pattern'leri (Next.js, Vite vs.)
- `<div>`, `<span>`, `<img>` gibi HTML elementleri kullanma

#### ✅ SADECE BUNLAR YAPILACAK:
- **iOS Simulator ile test** (`npm start` → `i` tuşu)
- **Android Emulator ile test** (`npm start` → `a` tuşu)
- React Native component'leri (`<View>`, `<Text>`, `<Image>`, `<ScrollView>`)
- Mobile-native patterns (TouchableOpacity, FlatList, SafeAreaView)
- StyleSheet.create (React Native'in native styling API'si)
- Mobile gestures (swipe, long-press, pull-to-refresh)
- Mobile-specific hooks (Dimensions, Platform, Keyboard)

#### 🚨 HATIRLATMA:
Her kod yazmadan önce sor: "Bu kod mobile'da çalışır mı?"
Eğer cevap "web'de de çalışır" ise, YENİDEN DÜŞÜN!

### 1. KISS (Keep It Simple, Stupid)
- ❌ NO state management libraries (Redux/Zustand/MobX)
- ❌ NO complex abstractions or design patterns
- ❌ NO services/repositories until duplicated 3+ times
- ✅ Direct API calls in components with mock data
- ✅ Plain useState/useContext only
- ✅ Inline code first, extract when needed

### 2. Clean Code
- **Max 50 lines per function** → Split at 40 lines
- **Max 300 lines per file** → New component at 250 lines
- **Self-documenting names**: `isFirstLoginAttempt` not `// check first login`
- **No abbreviations**: `employeePreferences` not `empPrefs`
- **TypeScript strict**: Zero `any` allowed

### 3. Never Over-Engineering
- Solve current problem only
- Don't build for imaginary future needs
- No "flexible architecture" planning
- Extract/refactor when pain is felt, not before

### 4. Git Workflow
- **AI NEVER commits** → Tell user: "✅ Commit zamanı geldi"
- Suggest commit message format: `feat(scope): what changed`
- Examples: `feat(auth): add manager login screen`, `fix(grid): cycle slot colors correctly`

---

## 📁 Project Structure

```
app/
├── (auth)/              # Public routes - NO auth required
│   ├── user-select.tsx      # Landing page
│   ├── manager-login.tsx
│   ├── manager-register.tsx
│   ├── employee-login.tsx
│   └── employee-password-reset.tsx
│
├── (manager)/           # Protected - manager only
│   ├── dashboard.tsx
│   ├── employees/
│   │   ├── index.tsx        # List + search
│   │   ├── add.tsx
│   │   └── [id].tsx         # Detail page
│   ├── shifts/review.tsx
│   └── settings.tsx
│
└── (employee)/          # Protected - employee only
    ├── home.tsx
    ├── preferences.tsx      # Critical: Shift grid
    ├── my-shifts.tsx
    └── profile.tsx

components/
├── ui/                  # Dumb components (Button, Input, Card)
└── features/           # Smart components (ShiftGrid, EmployeeCard)

types/index.ts          # ALL TypeScript types (single file for now)
utils/validation.ts     # Form validators
constants/theme.ts      # Colors, spacing
```

---

## 🔐 Auth Architecture (WHY 2 Systems?)

**Problem:** B2B2C model - managers self-register, employees are provisioned

**Manager Auth:**
- Supabase Auth (email/password)
- Auto-refresh JWT (1hr access, 30d refresh)
- Store: `shiffy_user_type='manager'`, `shiffy_access_token`

**Employee Auth:**
- Custom backend (username/password)
- Manual JWT (7d expiry)
- First login → force password change
- Store: `shiffy_user_type='employee'`, `shiffy_access_token`

**Route Guard (app/_layout.tsx):**
```typescript
// Check token on mount
if (!token) redirect('/user-select')
if (userType === 'manager') redirect('/(manager)/dashboard')
if (userType === 'employee') redirect('/(employee)/home')
```

---

## 💅 Styling Rules (StyleSheet ONLY)

**ALWAYS use StyleSheet.create, NEVER NativeWind/className:**
```typescript
// ✅ CORRECT (Mobile-Native)
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111618',
  },
});

// ❌ WRONG (Web approach)
<View className="bg-white p-4 rounded-lg">
  <Text className="text-2xl font-bold">Hello</Text>
</View>
```

**Color Palette (from HTML):**
```typescript
// constants/theme.ts
export const colors = {
  primary: '#1193d4',      // Buttons, links
  success: '#078836',      // Available shifts (green)
  warning: '#F0AD4E',      // Pending status (orange)
  danger: '#D9534F',       // Unavailable shifts (red)
  
  light: {
    bg: '#f6f7f8',
    surface: '#ffffff',
    text: '#111618',
    textMuted: '#617c89'
  },
  
  dark: {
    bg: '#101c22',
    surface: '#1a2a33',
    text: '#f0f3f4',
    textMuted: '#a0b8c4'
  }
}
```

**Dynamic styles (rare cases):**
```typescript
// Only for computed values
<View style={{ width: `${progress}%` }} className="bg-primary" />
```

---

## 📝 Component Template (ENFORCE THIS STRUCTURE)

```typescript
// 1. Imports (grouped - MOBILE ONLY!)
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// 2. Types (component-specific only)
interface Props {
  employee: Employee;
  onPress: (id: string) => void;
}

// 3. Component
export function EmployeeCard({ employee, onPress }: Props) {
  // 4. Hooks (top, no conditionals)
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 5. Handlers (handle* prefix)
  const handlePress = () => {
    setIsExpanded(!isExpanded);
    onPress(employee.id);
  };
  
  // 6. Render helpers (render* prefix)
  const renderBadge = () => (
    <View style={[
      styles.badge, 
      employee.status === 'active' ? styles.badgeActive : styles.badgeInactive
    ]}>
      <Text style={styles.badgeText}>{employee.status}</Text>
    </View>
  );
  
  // 7. Return JSX (MOBILE COMPONENTS ONLY!)
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Text style={styles.name}>{employee.full_name}</Text>
      {renderBadge()}
    </TouchableOpacity>
  );
}

// 8. StyleSheet (ALWAYS at bottom)
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: '#078836',
  },
  badgeInactive: {
    backgroundColor: '#9ca3af',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
  },
});
```

**If file hits 250 lines → Extract component immediately**

---

## 🔌 API Pattern (Mock-First Development)

```typescript
// services/employee.ts
const USE_MOCK = true; // Toggle when backend ready

export async function getEmployees(managerId: string): Promise<Employee[]> {
  if (USE_MOCK) {
    return [
      { id: '1', full_name: 'Ahmet Yılmaz', username: 'ahmet', status: 'active', manager_notes: '' },
      { id: '2', full_name: 'Ayşe Demir', username: 'ayse', status: 'inactive', manager_notes: 'AI: Sabah shift tercih ediyor' }
    ];
  }
  
  const response = await fetch(`${API_URL}/manager/employees`, {
    headers: { Authorization: `Bearer ${await getToken()}` }
  });
  
  if (!response.ok) throw new Error('Failed to fetch employees');
  return response.json();
}
```

**In component (direct call, no abstraction):**
```typescript
function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getEmployees('manager_id').then(setEmployees).finally(() => setLoading(false));
  }, []);
  
  // ... rest
}
```

---

## 🎯 Critical: ShiftGrid Component

**Most complex component** - 7 days × 48 slots (30min each) = 336 interactive cells

**State structure:**
```typescript
type SlotStatus = 'available' | 'unavailable' | 'off_request' | null;

const [slots, setSlots] = useState<Record<string, SlotStatus>>({
  'monday-08:00': 'available',
  'monday-08:30': null,
  // ... 336 keys
});
```

**Tap interaction (cycle through states):**
```typescript
const handleCellPress = (day: string, time: string) => {
  const key = `${day}-${time}`;
  const current = slots[key];
  
  const next = 
    current === null ? 'available' :
    current === 'available' ? 'unavailable' :
    current === 'unavailable' ? 'off_request' :
    null;
  
  setSlots({ ...slots, [key]: next });
};
```

**Color mapping (StyleSheet kullanarak):**
```typescript
const getCellStyle = (status: SlotStatus) => {
  if (status === 'available') return styles.cellAvailable;
  if (status === 'unavailable') return styles.cellUnavailable;
  if (status === 'off_request') return styles.cellOffRequest;
  return styles.cellEmpty;
};

const styles = StyleSheet.create({
  cellAvailable: {
    backgroundColor: '#078836', // Green
  },
  cellUnavailable: {
    backgroundColor: '#D9534F', // Red
  },
  cellOffRequest: {
    backgroundColor: '#9ca3af', // Gray
  },
  cellEmpty: {
    backgroundColor: '#f3f4f6', // Light gray
  },
});
```

**Performance: Use FlatList with getItemLayout (NOT ScrollView for 336 cells!)**

---

## ✅ Form Validation Pattern

```typescript
// utils/validation.ts
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email gerekli';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Geçersiz email';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Şifre gerekli';
  if (password.length < 6) return 'Şifre en az 6 karakter olmalı';
  return null;
};

// In component
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = () => {
  const emailError = validateEmail(form.email);
  const passwordError = validatePassword(form.password);
  
  if (emailError || passwordError) {
    setErrors({ email: emailError || '', password: passwordError || '' });
    return;
  }
  
  // Proceed with API call
};
```

---

## 🚫 Common Mistakes (DON'T DO THESE)

1. **NO className/NativeWind** → Use StyleSheet.create (mobile-native)
2. **NO web elements** → `<div>` yerine `<View>`, `<span>` yerine `<Text>`
3. **NO business logic in _layout.tsx** → Only navigation config
4. **NO fetching in _layout.tsx** → Fetch in screen components
5. **NO `as any`** → Define proper type in `types/index.ts`
6. **NO services before duplication** → Inline first, extract at 3rd use
7. **NO generic components** → Build for exact use case, generalize later
8. **NO web testing** → iOS/Android simulators ONLY

---

## 🧪 Testing Checklist (Before "Commit Zamanı")

**MOBILE SIMULATORS ONLY:**
- [ ] iOS Simulator test (`npm start` → press `i`)
- [ ] Android Emulator test (`npm start` → press `a`)
- [ ] ❌ ASLA web browser test etme (`w` tuşuna basma!)

**Functionality:**
- [ ] Dark mode works (toggle on screen)
- [ ] Navigation back/forward (no crashes)
- [ ] Form validation (empty, invalid, too long)
- [ ] Loading state (spinner shows, inputs disabled)
- [ ] Error handling (network fail, 401, 404)
- [ ] TypeScript compiles (`npm run lint`)

---

## 🗂️ File Naming

- Screens: `employee-login.tsx` (kebab-case)
- Components: `ShiftGrid.tsx` (PascalCase)
- Hooks: `useAuth.ts` (camelCase)
- Utils: `dateHelpers.ts` (camelCase)
- Types: `types/index.ts` (single file until 500+ lines)

---

## 📚 Reference Docs

- **ROADMAP.md**: 10-phase development plan with time estimates
- **SHIFFY_FRONTEND_DOCS.md**: Full API specs (lines 800-900), types (lines 650-750)
- **shiffy_html_clean/**: 15 HTML prototypes - exact UI reference

---

## 🚀 Workflow for New Feature

1. Check HTML prototype in `shiffy_html_clean/`
2. Check ROADMAP.md for current phase
3. Create screen in correct route group
4. Use mock data (add to same file)
5. Build UI with StyleSheet.create (MOBILE-NATIVE)
6. Add form validation if needed
7. Test iOS/Android + dark mode + loading + errors
8. **Tell user: "✅ Commit zamanı geldi"**

---

## 🔧 Commands

```bash
npm start          # Dev server (press 'a' for Android, 'i' for iOS)
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run lint       # TypeScript + ESLint check
```

**❌ ASLA KULLANMA:**
- `npm run web` → Web devre dışı!
- Browser test → MOBILE ONLY!

---

## 🎯 ÖZET: MOBILE-ONLY Hatırlatma

Bu proje **SADECE MOBILE** için geliştirilmektedir:

### ✅ YAPILACAKLAR:
- React Native component'leri (`View`, `Text`, `Image`, `ScrollView`, `FlatList`)
- `StyleSheet.create` ile styling
- `TouchableOpacity` / `Pressable` ile interaction
- iOS Simulator + Android Emulator ile test
- Mobile-native patterns (SafeAreaView, KeyboardAvoidingView)
- Platform-specific code (`Platform.OS === 'ios'`)

### ❌ YAPILMAYACAKLAR:
- Web browser'da test (`npm start` → `w`)
- HTML elementleri (`<div>`, `<span>`, `<button>`)
- CSS / className / NativeWind
- Web-specific API'ler (window, document, localStorage)
- Responsive web design düşüncesi
- Media queries

### 🚨 HER ZAMAN KONTROL ET:
"Bu kod native mobile'da çalışır mı?"
Eğer "web'de de çalışır" ise → YANLIŞ YOLDASIN!

---

**Remember:** Simple > Clever | Working > Perfect | Delete > Abstract | **MOBILE-ONLY!**
