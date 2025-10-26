# 🎨 Shiffy Frontend UI/UX & Clean Code Roadmap

## 📋 İçindekiler
1. [Acil Öncelikler](#1-acil-öncelikler-p0)
2. [Yüksek Öncelikler](#2-yüksek-öncelikler-p1)
3. [Orta Öncelikler](#3-orta-öncelikler-p2)
4. [Düşük Öncelikler](#4-düşük-öncelikler-p3)
5. [Uygulama Planı](#5-uygulama-planı)

---

## 1. 🔴 Acil Öncelikler (P0)

### 1.1 Design System & Theme Standardizasyonu
**Problem:** Her ekranda farklı renkler, font boyutları, boşluklar kullanılıyor.

**Çözüm:**
```typescript
// constants/design-tokens.ts
export const COLORS = {
  // Brand Colors
  primary: '#00cd81',
  primaryDark: '#004dd6',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral Colors
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  // Background
  background: '#f5f7fa',
  backgroundSecondary: '#ffffff',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  heading: 28,
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
```

**Aksiyonlar:**
- [ ] `constants/design-tokens.ts` oluştur
- [ ] Tüm ekranlarda inline colors yerine design tokens kullan
- [ ] Font boyutları ve weights standardize et
- [ ] Spacing sistemi uygula

**Etkilenen Dosyalar:** Tüm `.tsx` dosyaları

---

### 1.2 Component Extraction (Reusable Components)
**Problem:** Her ekranda tekrar eden kod blokları var (header, button, card vb.)

**Çözüm:** Shared components oluştur

```typescript
// components/ui/GradientHeader.tsx
interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export function GradientHeader({ 
  title, 
  subtitle, 
  showBackButton = true,
  rightAction 
}: GradientHeaderProps) {
  const router = useRouter();
  
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      {showBackButton && (
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightAction}
    </LinearGradient>
  );
}
```

**Oluşturulacak Components:**
- [ ] `GradientHeader` - Tekrar eden gradient header
- [ ] `GradientButton` - Primary/Secondary gradient buttons
- [ ] `Card` - Standart kart component
- [ ] `StatCard` - İstatistik gösterimi için
- [ ] `ProgressBar` - İlerleme çubuğu
- [ ] `Badge` - Durum badge'leri
- [ ] `EmptyState` - Boş durum gösterimi
- [ ] `LoadingSpinner` - Loading state
- [ ] `WeekSelector` - Hafta seçici
- [ ] `SearchBar` - Arama kutusu

**Aksiyonlar:**
- [ ] `components/ui/` klasörü oluştur
- [ ] Her component için `.tsx` + `.styles.ts` dosyaları
- [ ] Storybook/test setup (opsiyonel)
- [ ] Tüm ekranlarda bu componentleri kullan

---

### 1.3 Stil Organizasyonu
**Problem:** 1880+ satırlık dosyalarda stiller en altta, okunması zor

**Çözüm:** Stilleri ayrı dosyalara taşı

**Önce:**
```typescript
// shift-review.tsx (1880 satır)
export default function ShiftReviewScreen() {
  // 1000+ satır kod
}

const styles = StyleSheet.create({
  // 800+ satır stil
});
```

**Sonra:**
```typescript
// shift-review.tsx (temiz, ~300 satır)
import { styles } from './shift-review.styles';

export default function ShiftReviewScreen() {
  // Sadece logic
}

// shift-review.styles.ts
export const styles = StyleSheet.create({
  // Tüm stiller burada
});
```

**Aksiyonlar:**
- [ ] Her ekran için `.styles.ts` dosyası oluştur
- [ ] StyleSheet'leri taşı
- [ ] Design tokens kullanarak refactor et

---

## 2. 🟡 Yüksek Öncelikler (P1)

### 2.1 Typography System
**Problem:** Tutarsız text stilleri

**Çözüm:**
```typescript
// components/ui/Typography.tsx
export const Heading1 = styled(Text)({
  fontSize: FONT_SIZES.xxxl,
  fontWeight: FONT_WEIGHTS.bold,
  color: COLORS.textPrimary,
});

export const Heading2 = styled(Text)({
  fontSize: FONT_SIZES.xxl,
  fontWeight: FONT_WEIGHTS.bold,
  color: COLORS.textPrimary,
});

export const Body = styled(Text)({
  fontSize: FONT_SIZES.md,
  fontWeight: FONT_WEIGHTS.regular,
  color: COLORS.textPrimary,
});

export const Caption = styled(Text)({
  fontSize: FONT_SIZES.sm,
  fontWeight: FONT_WEIGHTS.regular,
  color: COLORS.textSecondary,
});
```

**Aksiyonlar:**
- [ ] Typography components oluştur
- [ ] Tüm `<Text>` kullanımlarını değiştir
- [ ] Line heights ekle

---

### 2.2 Layout Components
**Problem:** Her ekranda aynı container yapısı tekrarlanıyor

**Çözüm:**
```typescript
// components/layout/Screen.tsx
export function Screen({ children, hasHeader = true }: ScreenProps) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

// components/layout/ScrollableScreen.tsx
export function ScrollableScreen({ children }: ScrollableScreenProps) {
  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
```

**Aksiyonlar:**
- [ ] `Screen` wrapper component
- [ ] `ScrollableScreen` wrapper
- [ ] `Section` component (kartlar için)

---

### 2.3 Form Components
**Problem:** Input, TextArea, Picker her yerde farklı stil

**Çözüm:**
```typescript
// components/ui/Input.tsx
interface InputProps {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  // ... diğer props
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={COLORS.textTertiary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
```

**Oluşturulacak Form Components:**
- [ ] `Input` - Text input
- [ ] `TextArea` - Multiline input
- [ ] `Select` - Picker wrapper
- [ ] `Checkbox` - Checkbox component
- [ ] `Switch` - Toggle switch
- [ ] `DatePicker` - Tarih seçici
- [ ] `TimePicker` - Saat seçici

---

### 2.4 Responsive Design
**Problem:** Sabit pixel değerleri, farklı ekran boyutlarında sorun olabilir

**Çözüm:**
```typescript
// utils/responsive.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const wp = (percentage: number) => {
  return (width * percentage) / 100;
};

export const hp = (percentage: number) => {
  return (height * percentage) / 100;
};

export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 768;
export const isLargeScreen = width >= 768;
```

**Aksiyonlar:**
- [ ] Responsive utility oluştur
- [ ] Kritik boyutları %'ye çevir
- [ ] useWindowDimensions hook kullan

---

## 3. 🟠 Orta Öncelikler (P2)

### 3.1 State Management Refactor
**Problem:** Her ekranda useState, useEffect karmaşası

**Çözüm:** Custom hooks kullan

```typescript
// hooks/useShiftReview.ts
export function useShiftReview(weekOffset: number) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [preferences, setPreferences] = useState<ShiftRequest[]>([]);
  
  const loadData = useCallback(async () => {
    // Logic burada
  }, [weekOffset]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  return {
    loading,
    schedule,
    preferences,
    loadData,
    // ... diğer state ve functions
  };
}

// Kullanım:
export default function ShiftReviewScreen() {
  const { loading, schedule, preferences, loadData } = useShiftReview(weekOffset);
  
  // Çok daha temiz!
}
```

**Oluşturulacak Custom Hooks:**
- [ ] `useShiftReview` - Shift review logic
- [ ] `useEmployees` - Çalışan yönetimi
- [ ] `useSalesReports` - Satış raporları
- [ ] `useAuth` - Authentication
- [ ] `useDebounce` - Debounced değerler
- [ ] `useForm` - Form validation

---

### 3.2 Error Handling & Feedback
**Problem:** Alert.alert her yerde, tutarsız hata mesajları

**Çözüm:**
```typescript
// components/ui/Toast.tsx
export const Toast = {
  success: (message: string) => {
    // Toast göster
  },
  error: (message: string) => {
    // Hata toast
  },
  info: (message: string) => {
    // Bilgi toast
  },
};

// Kullanım:
try {
  await saveSalesReport();
  Toast.success('Rapor kaydedildi!');
} catch (error) {
  Toast.error('Bir hata oluştu');
}
```

**Aksiyonlar:**
- [ ] Toast notification sistemi (react-native-toast-message)
- [ ] Error boundary component
- [ ] Loading states standardize et
- [ ] Success/Error feedback tutarlı hale getir

---

### 3.3 Accessibility (a11y)
**Problem:** AccessibilityLabel, accessible props eksik

**Çözüm:**
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Shift oluştur butonu"
  accessibilityHint="AI ile yeni shift planı oluşturmak için dokunun"
  accessibilityRole="button"
  onPress={handleGenerate}
>
  <Text>AI ile Shift Oluştur</Text>
</TouchableOpacity>
```

**Aksiyonlar:**
- [ ] Tüm interactive elementlere accessibility props ekle
- [ ] Screen reader test et
- [ ] Renk kontrastlarını kontrol et (WCAG AA)
- [ ] Font scaling desteği ekle

---

### 3.4 Animation & Transitions
**Problem:** Ani geçişler, animasyon yok

**Çözüm:**
```typescript
import { Animated } from 'react-native';

// Fade in animation
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
}, []);

return (
  <Animated.View style={{ opacity: fadeAnim }}>
    {content}
  </Animated.View>
);
```

**Aksiyonlar:**
- [ ] Card mount animasyonları
- [ ] Button press feedback (scale)
- [ ] Modal slide in/out
- [ ] Skeleton loaders
- [ ] Progress bar animasyonları

---

## 4. 🟢 Düşük Öncelikler (P3)

### 4.1 Performance Optimization
- [ ] React.memo kullan (gereksiz re-render önle)
- [ ] useMemo/useCallback optimize et
- [ ] FlatList optimization (shift listleri için)
- [ ] Image lazy loading
- [ ] Bundle size analizi

### 4.2 Code Quality Tools
- [ ] ESLint rules güncelle
- [ ] Prettier configuration
- [ ] Husky pre-commit hooks
- [ ] TypeScript strict mode
- [ ] Import organization (absolute paths)

### 4.3 Documentation
- [ ] Component documentation (JSDoc)
- [ ] Storybook setup
- [ ] README güncelle
- [ ] API documentation
- [ ] Screen flow diagrams

### 4.4 Testing
- [ ] Jest setup
- [ ] Component tests
- [ ] Hook tests
- [ ] Integration tests
- [ ] E2E tests (Detox)

---

## 5. 🎯 Uygulama Planı

### Hafta 1: Temel Altyapı
**Gün 1-2:** Design System
- [ ] `constants/design-tokens.ts` oluştur
- [ ] COLORS, SPACING, FONT_SIZES tanımla
- [ ] 3-5 ekranda test et

**Gün 3-4:** Component Library Başlangıcı
- [ ] `GradientHeader` component
- [ ] `GradientButton` component
- [ ] `Card` component
- [ ] 2-3 ekranda kullan, test et

**Gün 5-7:** Stil Refactoring
- [ ] `shift-review.styles.ts` oluştur
- [ ] `dashboard.styles.ts` oluştur
- [ ] `reports.styles.ts` oluştur
- [ ] Design tokens'a geçiş

### Hafta 2: Component Standardizasyonu
**Gün 1-3:** Kalan UI Components
- [ ] `StatCard`, `ProgressBar`, `Badge`
- [ ] `EmptyState`, `LoadingSpinner`
- [ ] `WeekSelector`, `SearchBar`

**Gün 4-5:** Form Components
- [ ] `Input`, `TextArea`, `Select`
- [ ] Form validation utilities
- [ ] Örnek form oluştur

**Gün 6-7:** Layout Components
- [ ] `Screen`, `ScrollableScreen`
- [ ] `Section` wrapper
- [ ] Tüm ekranlarda uygula

### Hafta 3: Logic & State Refactoring
**Gün 1-3:** Custom Hooks
- [ ] `useShiftReview` hook
- [ ] `useEmployees` hook
- [ ] `useSalesReports` hook

**Gün 4-5:** Error Handling
- [ ] Toast notification sistemi
- [ ] Error boundary
- [ ] Try-catch standardization

**Gün 6-7:** Testing & Cleanup
- [ ] Kullanılmayan kodları temizle
- [ ] Console.log'ları kaldır
- [ ] TypeScript errors fix

### Hafta 4: Polish & Optimization
**Gün 1-2:** Accessibility
- [ ] Accessibility labels ekle
- [ ] Screen reader test
- [ ] Renk kontrast düzelt

**Gün 3-4:** Animation
- [ ] Temel animasyonlar ekle
- [ ] Button feedback
- [ ] Skeleton loaders

**Gün 5-7:** Final Review
- [ ] Code review
- [ ] Performance check
- [ ] Documentation
- [ ] Release notes

---

## 📊 Öncelik Matrisi

| Alan | Öncelik | Süre | Etki | Zorluk |
|------|---------|------|------|--------|
| Design Tokens | 🔴 P0 | 2 gün | Yüksek | Düşük |
| Component Extraction | 🔴 P0 | 5 gün | Çok Yüksek | Orta |
| Stil Organizasyonu | 🔴 P0 | 3 gün | Yüksek | Düşük |
| Typography System | 🟡 P1 | 1 gün | Orta | Düşük |
| Layout Components | 🟡 P1 | 2 gün | Yüksek | Düşük |
| Form Components | 🟡 P1 | 3 gün | Yüksek | Orta |
| State Management | 🟠 P2 | 4 gün | Yüksek | Orta |
| Error Handling | 🟠 P2 | 2 gün | Orta | Düşük |
| Accessibility | 🟠 P2 | 3 gün | Orta | Orta |
| Animations | 🟠 P2 | 2 gün | Düşük | Orta |
| Performance | 🟢 P3 | 3 gün | Orta | Yüksek |
| Testing | 🟢 P3 | 5 gün | Yüksek | Yüksek |

---

## 🎨 UI/UX Spesifik İyileştirmeler

### Shift Review Ekranı
**Mevcut Sorunlar:**
- ❌ "Kaydırarak tüm günleri görüntüleyin →" metni gereksiz tekrar
- ❌ Takvim çok küçük (düzeltildi ama daha optimize edilebilir)
- ❌ 1880 satır tek dosya (çok uzun)

**Öneriler:**
- [ ] Takvim için ayrı component (`WeeklyCalendar.tsx`)
- [ ] Stats için `StatsGrid` component
- [ ] Employee hours için `EmployeeHoursChart` component
- [ ] Modal için `ShiftEditModal` component

### Dashboard Ekranı
**Öneriler:**
- [ ] Quick actions için grid component
- [ ] Stats kartları için uniform boyut
- [ ] Loading states iyileştir

### Reports Ekranı
**Öneriler:**
- [ ] Form için `SalesReportForm` component
- [ ] Weekly summary için `WeeklySummaryCard` component
- [ ] Chart visualization ekle (react-native-chart-kit)

---

## 📝 Kod Standartları

### Naming Conventions
```typescript
// Components: PascalCase
export function GradientHeader() {}

// Hooks: camelCase with 'use' prefix
export function useShiftReview() {}

// Constants: UPPER_SNAKE_CASE
export const MAX_WEEKLY_HOURS = 40;

// Functions: camelCase
export function calculateTotalHours() {}

// Interfaces: PascalCase with 'I' or Props suffix
export interface GradientHeaderProps {}
```

### File Structure
```
components/
├── ui/               # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   └── index.ts
│   ├── Card/
│   └── Input/
├── layout/           # Layout components
│   ├── Screen/
│   └── Section/
└── features/         # Feature-specific components
    ├── ShiftReview/
    └── SalesReports/

hooks/
├── useShiftReview.ts
├── useEmployees.ts
└── useAuth.ts

constants/
├── design-tokens.ts
├── theme.ts
└── config.ts

utils/
├── responsive.ts
├── validation.ts
└── formatters.ts
```

---

## ✅ Checklist

### Temel Altyapı
- [ ] Design tokens oluşturuldu
- [ ] Component library başlatıldı
- [ ] Stil organizasyonu tamamlandı
- [ ] Typography system kuruldu

### UI Components
- [ ] GradientHeader ✓
- [ ] GradientButton
- [ ] Card
- [ ] StatCard
- [ ] ProgressBar
- [ ] Badge
- [ ] EmptyState
- [ ] LoadingSpinner

### Form Components
- [ ] Input
- [ ] TextArea
- [ ] Select
- [ ] DatePicker
- [ ] TimePicker

### Hooks
- [ ] useShiftReview
- [ ] useEmployees
- [ ] useSalesReports
- [ ] useAuth

### Error Handling
- [ ] Toast system
- [ ] Error boundary
- [ ] Try-catch standardization

### Accessibility
- [ ] Accessibility labels
- [ ] Screen reader support
- [ ] Color contrast (WCAG AA)

### Performance
- [ ] React.memo optimization
- [ ] useMemo/useCallback
- [ ] FlatList optimization

---

## 🚀 Başlamak İçin

1. **İlk Adım:** Design tokens oluştur
```bash
mkdir -p frontend/constants
touch frontend/constants/design-tokens.ts
```

2. **İkinci Adım:** İlk component'i oluştur
```bash
mkdir -p frontend/components/ui/GradientHeader
touch frontend/components/ui/GradientHeader/GradientHeader.tsx
touch frontend/components/ui/GradientHeader/GradientHeader.styles.ts
touch frontend/components/ui/GradientHeader/index.ts
```

3. **Üçüncü Adım:** Bir ekranda test et
```bash
# shift-review.tsx'i refactor et
```

---

## 📚 Kaynaklar

- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [Component-Driven Development](https://www.componentdriven.org/)
- [React Native Styling Guide](https://reactnative.dev/docs/style)
- [Accessibility Guidelines](https://reactnative.dev/docs/accessibility)

---

**Son Güncelleme:** 26 Ekim 2025
**Versiyon:** 1.0
**Hazırlayan:** AI Assistant
