# 🗺️ Shiffy Frontend Development Roadmap

> **Proje Yaklaşımı:** KISS (Keep It Simple, Stupid) + Clean Code  
> **Geliştirme Modeli:** Adım adım onay bazlı ilerleyiş  
> **Teknoloji:** Expo SDK 54 + TypeScript + React Native  
> **Platform:** 📱 **SADECE MOBILE (iOS + Android)** - Web DEVRE DIŞI

---

## 📋 Proje Özeti

HTML prototiplerinde oluşturulmuş 15 sayfalık vardiya yönetim sistemini React Native/Expo uygulamasına dönüştürme projesi.

**Mevcut Durum:**
- ✅ 15 adet HTML sayfası (Tailwind CSS ile stillendirilmiş)
- ✅ Expo SDK 54 boilerplate kurulu
- ✅ Dosya-tabanlı routing (Expo Router)
- ✅ Dark mode desteği HTML'de mevcut

**Hedef:**
- Native mobile uygulama (iOS + Android)
- Manager ve Employee rolleri için ayrı akışlar
- Offline-ready shift tercihleri
- Clean, maintainable kod
- **Web desteği YOK - sadece mobile focus**

---

## 🎯 Genel Prensipler

### KISS (Keep It Simple)
- Gereksiz abstraction yok
- Over-engineering yapılmayacak
- Direkt yaklaşım: Sorun çıktıkça çöz, önden tahmin etme
- Şu an için state management library kullanmayacağız (useState/useContext yeterli)

### Clean Code
- Fonksiyon başına max 50 satır
- Dosya başına max 300 satır
- Self-documenting kod (az yorum)
- Anlamlı değişken isimleri (kısaltma yok)

### Esneklik
- Her adım bağımsız test edilebilir
- Yeni özellikler sonradan eklenebilir
- Backend entegrasyonu için placeholder'lar bırakılacak
- Kullanıcı geri bildirimine göre adapte olunacak

---

## 📐 Mimari Kararlar

### Klasör Yapısı
```
app/
├── (auth)/              # Auth flow screens
│   ├── _layout.tsx      # Auth stack navigator
│   ├── user-select.tsx  # Kullanıcı seçimi
│   ├── manager-login.tsx
│   ├── manager-register.tsx
│   ├── employee-login.tsx
│   └── employee-password-reset.tsx
│
├── (manager)/           # Manager screens (protected)
│   ├── _layout.tsx      # Manager tabs
│   ├── dashboard.tsx
│   ├── employees/
│   │   ├── index.tsx    # Liste
│   │   ├── add.tsx
│   │   └── [id].tsx     # Detay
│   ├── shifts/
│   │   └── review.tsx
│   └── settings.tsx
│
├── (employee)/          # Employee screens (protected)
│   ├── _layout.tsx      # Employee tabs
│   ├── home.tsx
│   ├── preferences.tsx  # Shift tercih grid'i
│   ├── my-shifts.tsx
│   └── profile.tsx
│
└── _layout.tsx          # Root layout

components/
├── ui/                  # Reusable primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── loading.tsx
│
└── features/           # Feature-specific components
    ├── shift-grid.tsx
    ├── employee-card.tsx
    └── stat-card.tsx

hooks/
├── use-auth.ts         # Auth state management
├── use-theme.ts        # Dark mode
└── use-shift-preferences.ts

utils/
├── storage.ts          # AsyncStorage wrapper
├── validation.ts       # Form validators
└── date-helpers.ts     # Tarih formatları

types/
└── index.ts            # Tüm TypeScript types
```

### Teknoloji Seçimleri
- **Platform:** iOS + Android ONLY (Expo Go ile test, production'da standalone build)
- **Styling:** StyleSheet.create (React Native native approach - NativeWind web'de sorunlu)
- **Navigation:** Expo Router (file-based routing)
- **State:** useState + useContext (şimdilik, Redux gibi library YOK)
- **Storage:** AsyncStorage (SecureStore auth tokenları için)
- **Icons:** @expo/vector-icons (Material Icons)
- **Animations:** React Native Animated API (sadece gerekli yerlerde)
- **Testing:** iOS Simulator + Android Emulator (Web browser test YOK)

---

## 🚀 ADIMLAR (10 Aşama)

### **AŞAMA 1: Proje Temelleri & Setup** ✅ **TAMAMLANDI**
**Süre:** ~30-45 dakika  
**Hedef:** Geliştirme ortamını hazırla, temel kütüphaneleri kur

**Yapılacaklar:**
- [x] ~~NativeWind kurulumu~~ → StyleSheet.create kullanılacak (mobile-native)
- [x] Dosya yapısı oluşturma (types, components, utils, services)
- [x] TypeScript types tanımları (Manager, Employee, Shift, vb.)
- [x] Theme sistemi (colors constant)
- [x] Temel UI componentleri (Button, Input, Card, Loading)

**Test Kriterleri:**
- ✅ App açılıyor (iOS/Android)
- ✅ UI componentleri render oluyor
- ✅ TypeScript hatası yok

**Çıktılar:**
- ✅ `types/index.ts` (tüm type'lar)
- ✅ `constants/theme.ts`
- ✅ `components/ui/Button.tsx, Input.tsx, Card.tsx, Loading.tsx`

---

### **AŞAMA 2: Auth Flow - Kullanıcı Seçimi** ✅ **TAMAMLANDI**
**Süre:** ~45 dakika  
**Hedef:** İlk ekran - Yönetici/Çalışan seçim sayfası

**Yapılacaklar:**
- [x] `app/(auth)/user-select.tsx` oluştur
- [x] Shiffy logo (Material Icons kullanarak)
- [x] "Yönetici" ve "Çalışan" butonları
- [x] Navigation setup (auth route group)
- [x] Dummy login pages (placeholder)

**Test Kriterleri:**
- ✅ User-select ekranı görünüyor (iOS/Android)
- ✅ Butonlar çalışıyor
- ✅ Navigation doğru sayfaya yönlendiriyor

**Çıktılar:**
- ✅ `app/(auth)/user-select.tsx`
- ✅ `app/(auth)/manager-login.tsx` (placeholder)
- ✅ `app/(auth)/employee-login.tsx` (placeholder)
- [ ] İki büyük buton (Manager/Employee)
- [ ] Navigation setup (auth stack)
- [ ] Theme toggle butonu

**Test Kriterleri:**
- Logo animasyonu çalışıyor mu?
- Butonlar doğru sayfalara yönlendiriyor mu?
- Dark mode geçişi smooth mu?

**Çıktılar:**
- Kullanıcı seçim ekranı (HTML'deki `kullanici_secimi.html` karşılığı)

---

### **AŞAMA 3: Manager Auth - Kayıt & Giriş** � **DEVAM EDİYOR**
**Süre:** ~60 dakika  
**Hedef:** Yönetici kayıt ve giriş ekranları (MOBILE NATIVE)

**Yapılacaklar:**
- [x] `utils/validation.ts` - Email, password, required validators + strength calculator
- [x] `services/auth.ts` - Mock login/register (USE_MOCK = true)
- [x] `components/ui/PasswordStrengthIndicator.tsx` - Renkli bar component
- [x] `app/(auth)/manager-login.tsx` - Email + Password + "Beni Hatırla" checkbox
- [x] `app/(auth)/manager-register.tsx` - Store name + Email + Password + Confirm + Strength indicator
- [x] `types/index.ts` - Manager'a subscription fields eklendi

**⚠️ Manuel İşlem Gerekiyor:**
1. Eski `manager-login.tsx` dosyasını SİL (bozuk)
2. `manager-login-new.tsx` dosyasını `manager-login.tsx` olarak RENAME et

**Test Kriterleri (iOS/Android Simulator):**
- [ ] npm start → "a" (Android) veya "i" (iOS) - WEB YOK!
- [ ] User-select → "Yönetici" → Login ekranı görünmeli
- [ ] "Kayıt Ol" → Register formu (password strength bar değişmeli)
- [ ] Login: yonetici@test.com / 123456 → Alert: "Hoş geldin Kahve Dükkanı!"

**Çıktılar:**
- ✅ Manager register & login screens (StyleSheet ile)
- ✅ Validation utilities
- ✅ Mock auth service

---

### **AŞAMA 4: Manager Dashboard** 📊
**Süre:** ~45 dakika  
**Hedef:** Yönetici ana sayfa - İstatistikler ve hızlı erişim

**Yapılacaklar:**
- [ ] `app/(manager)/dashboard.tsx`
- [ ] Stat kartları component (3 adet: Çalışan, Bekleyen, Shift)
- [ ] Hızlı işlem grid (6 buton)
- [ ] Header component (hoş geldiniz + logout)
- [ ] Pull-to-refresh (opsiyonel)

**Test Kriterleri:**
- Kartlar doğru görünüyor mu?
- Butonlar ilgili sayfalara gidiyor mu?
- Logout butonu çalışıyor mu?

**Çıktılar:**
- `app/(manager)/dashboard.tsx`
- `components/features/stat-card.tsx`

---

### **AŞAMA 5: Çalışan Yönetimi - Liste & Arama** 👥
**Süre:** ~60 dakika  
**Hedef:** Çalışan listesi, arama, ve ekleme

**Yapılacaklar:**
- [ ] `app/(manager)/employees/index.tsx`
  - Grid layout (kartlar)
  - Search bar (gerçek zamanlı filtreleme)
  - Aktif/Pasif badge'ler
- [ ] `app/(manager)/employees/add.tsx`
  - Form: fullName, username, email
  - Otomatik şifre oluşturma (Shf + 8 karakter)
  - Success modal (şifre gösterimi + clipboard)
- [ ] `components/features/employee-card.tsx`
- [ ] Mock employee data

**Test Kriterleri:**
- Arama çalışıyor mu?
- Yeni çalışan eklenince listede görünüyor mu?
- Şifre kopyalama çalışıyor mu?

**Çıktılar:**
- Employee list & add screens
- `components/features/employee-card.tsx`

---

### **AŞAMA 6: Çalışan Detayı & Yönetici Notları** ✅
**Süre:** ~60 dakika  
**Hedef:** Çalışan detay sayfası, notlar, düzenleme

**Yapılacaklar:**
- ✅ `app/(manager)/employees/[id].tsx`
  - Profile header (avatar, ad, status badge)
  - Bilgi kartları (ad, username, katılım tarihi, son giriş)
  - Manager notes textarea (save butonu)
  - Status toggle butonu (aktif/pasif)
- ✅ Service functions:
  - `getEmployeeById()`
  - `updateEmployeeNotes()`
  - `toggleEmployeeStatus()`
- ✅ Employee card'dan detay sayfasına navigation

**Test Kriterleri:**
- ✅ URL parametresi doğru çalışıyor mu?
- ✅ Notlar kaydediliyor mu?
- ✅ Status toggle çalışıyor mu?

**Çıktılar:**
- ✅ `app/(manager)/employees/[id].tsx` (StyleSheet ile)
- ✅ Updated employee service with 3 new functions

---

### **AŞAMA 7: Employee Auth - Giriş & Şifre Değiştirme** ✅
**Süre:** ~45 dakika  
**Hedef:** Çalışan giriş ve ilk giriş şifre değiştirme

**Yapılacaklar:**
- ✅ `app/(auth)/employee-login.tsx`
  - Username/password form
  - İlk giriş algılama (mock)
  - Şifre değiştirmeye yönlendirme
  - Test credentials info
- ✅ `app/(auth)/employee-password-reset.tsx`
  - Mevcut şifre inputu (first login'de gizli)
  - Yeni şifre + confirmation
  - Şifre güç göstergesi (0-3 scale)
  - Password requirements checklist (4 criteria)
  - First login warning card
- ✅ `services/employee-auth.ts`
  - employeeLogin() with mock credentials
  - employeeChangePassword() with first login support
  - Mock employee data mapping
- ✅ Updated `utils/validation.ts`
  - getPasswordStrength() function (returns 0-3)

**Test Kriterleri:**
- ✅ Login çalışıyor mu?
- ✅ İlk giriş senaryosu doğru mu?
- ✅ Şifre strength bar çalışıyor mu?
- ✅ Password requirements real-time update?

**Çıktılar:**
- ✅ Employee login screen (StyleSheet ile)
- ✅ Employee password reset screen (StyleSheet ile)
- ✅ Employee auth service (mock-first)

---

### **AŞAMA 8: Employee Home & Profil** ✅
**Süre:** ~30 dakika  
**Hedef:** Çalışan ana sayfa ve profil

**Yapılacaklar:**
- ✅ `app/(employee)/_layout.tsx`
  - Bottom tabs navigation (4 tabs)
  - Home, Preferences, My Shifts, Profile
- ✅ `app/(employee)/home.tsx`
  - Header with user avatar + notifications
  - Logo section
  - This week's status card (2 variants)
    - Action required (red) - preferences not submitted
    - Pending approval (orange) - preferences submitted
  - Quick actions grid (3 buttons)
- ✅ `app/(employee)/profile.tsx`
  - Large avatar with initials
  - Personal information card (6 fields)
  - Account actions (password change, notifications, dark mode)
  - Logout button
  - App info footer
- ✅ `app/(employee)/preferences.tsx` (placeholder)
- ✅ `app/(employee)/my-shifts.tsx` (placeholder)
- ✅ Updated employee-login redirect

**Test Kriterleri:**
- ✅ Home screen görünüyor mu?
- ✅ Status card variants çalışıyor mu?
- ✅ Quick actions navigation?
- ✅ Profile bilgileri doğru mu?
- ✅ Password change redirect çalışıyor mu?
- ✅ Tabs navigation çalışıyor mu?

**Çıktılar:**
- ✅ Employee layout with tabs
- ✅ Employee home screen (StyleSheet ile)
- ✅ Employee profile screen (StyleSheet ile)
- ✅ Placeholder screens (preferences, my-shifts)

---

### **AŞAMA 9: Shift Tercih Grid'i** 📅 (EN ÖNEMLİ)
**Süre:** ~90 dakika  
**Hedef:** İnteraktif haftalık shift tercih grid'i

**Yapılacaklar:**
- [ ] `app/(employee)/preferences.tsx`
  - 7 gün x 3 shift grid
  - Hücre tıklama (Müsait → Belki → Müsait Değil → None)
  - Renk kodları (yeşil, turuncu, kırmızı, gri)
  - Hafta navigasyonu (prev/next)
  - Legend (renk açıklaması)
  - Draft saving (AsyncStorage)
  - Kaydet butonu
- [ ] `components/features/shift-grid.tsx`
- [ ] `hooks/use-shift-preferences.ts`

**Test Kriterleri:**
- Grid render oluyor mu?
- Hücre tıklama çalışıyor mu?
- Draft kaydediliyor mu (app kapatılınca)?
- Hafta değiştirme çalışıyor mu?

**Çıktılar:**
- Shift preferences screen
- `components/features/shift-grid.tsx`
- `hooks/use-shift-preferences.ts`

---

### **AŞAMA 10: Manager Shift İnceleme & Ayarlar** ⚡
**Süre:** ~75 dakika  
**Hedef:** Yönetici shift onay ekranı ve ayarlar

**Yapılacaklar:**
- [ ] `app/(manager)/shifts/review.tsx`
  - Grid layout (gün x çalışan)
  - Shift durumları (Requested, Approved, AI Suggested)
  - Shift detay modal
  - Toplu onay butonu
  - Stats kartları (4 adet)
- [ ] `app/(manager)/settings.tsx`
  - Store ayarları (ad, adres)
  - Çalışma saatleri
  - Shift deadline
  - Bildirim toggleları
  - AI ayarları (enable, auto-approve, level)

**Test Kriterleri:**
- Shift grid doğru render oluyor mu?
- Modal açılıyor/kapanıyor mu?
- Ayarlar kaydediliyor mu?

**Çıktılar:**
- Shift review screen
- Settings screen
- `components/features/shift-approval-grid.tsx`

---

## 🎨 Tasarım Sistemi

### Renkler
```typescript
const colors = {
  // Primary
  primary: '#1193d4',
  primaryDark: '#0d7ab8',
  
  // Status
  success: '#078836',
  warning: '#F0AD4E',
  danger: '#D9534F',
  
  // Light mode
  light: {
    background: '#f6f7f8',
    surface: '#ffffff',
    text: '#111618',
    textSecondary: '#617c89',
  },
  
  // Dark mode
  dark: {
    background: '#101c22',
    surface: '#1a2a33',
    text: '#f0f3f4',
    textSecondary: '#a0b8c4',
  }
}
```

### Typography
- Font: Manrope (Google Fonts - `expo-google-fonts`)
- Başlık: Bold (700-800)
- Body: Regular (400), Medium (500)

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px

---

## 📦 Bağımlılıklar (Aşama 1'de kurulacak)

```json
{
  "dependencies": {
    "nativewind": "^4.0.1",
    "tailwindcss": "^3.4.0",
    "@react-native-async-storage/async-storage": "^2.1.0",
    "expo-secure-store": "~14.0.0",
    "react-native-reanimated": "~4.1.1", // Zaten var
    "@expo/vector-icons": "^15.0.3", // Zaten var
    "expo-clipboard": "~7.0.0",
    "date-fns": "^3.0.0"
  }
}
```

---

## 🔄 Geliştirme Akışı

### Her Aşama İçin:
1. **Planlama** - Ne yapacağımızı netleştir (bu ROADMAP)
2. **Geliştirme** - Kod yaz, commit at
3. **Test** - Sen test et, feedback ver
4. **İyileştirme** - Gerekirse düzelt
5. **Onay** - Bir sonraki aşamaya geç

### Kurallar:
- ❌ Bir aşama tamamlanmadan diğerine geçme
- ✅ Her aşama çalışır durumda olmalı
- ✅ Test edilmeden devam etme
- ✅ Gereksiz feature ekleme (KISS!)

---

## 🚧 Backend Entegrasyon Noktaları

Şimdilik mock data kullanacağız, ama bu noktalar API'ye bağlanacak:

1. **Auth:** `hooks/use-auth.ts`
2. **Employees:** `services/employee.ts` (CRUD)
3. **Shifts:** `services/shift.ts` (preferences, approval)
4. **Settings:** `services/settings.ts`

Her service dosyası şu yapıda:
```typescript
// Mock mode
const USE_MOCK = true;

export async function getEmployees() {
  if (USE_MOCK) {
    return mockEmployees;
  }
  return api.get('/employees');
}
```

---

## 📱 Test Stratejisi

### Manuel Test (Her Aşama)
- Hem iOS hem Android'de dene (Expo Go)
- Dark mode toggle
- Farklı ekran boyutları
- Form validasyonları
- Edge case'ler (boş listeler, uzun isimler, vb.)

### Otomatik Test (Opsiyonel - Sonra)
- Jest + React Native Testing Library
- Kritik componentler için unit test
- Form validasyonları için test

---

## 🎯 MVP Dışı Özellikler (Gelecek)

Bu özellikler şimdilik **YAPILMAYACAK**, ama yapı esnek olacak:

- Push notifications
- Chat-based shift requests
- Shift swapping (çalışanlar arası)
- Analytics dashboard
- Multi-store support
- Photo upload (avatar)
- Export to PDF (shift schedules)

---

## 📊 İlerleme Takibi

Her aşama tamamlandığında burayı güncelleyeceğim:

- [x] **AŞAMA 1:** Proje Temelleri & Setup ✅ **TAMAMLANDI**
- [x] **AŞAMA 2:** Auth Flow - Kullanıcı Seçimi ✅ **TAMAMLANDI**
- [ ] **AŞAMA 3:** Manager Auth - Kayıt & Giriş → 🔄 **DEVAM EDİYOR**
- [ ] **AŞAMA 4:** Manager Dashboard
- [ ] **AŞAMA 5:** Çalışan Yönetimi - Liste & Arama
- [ ] **AŞAMA 6:** Çalışan Detayı & Notları
- [ ] **AŞAMA 7:** Employee Auth - Giriş & Şifre
- [ ] **AŞAMA 8:** Employee Home & Profil
- [ ] **AŞAMA 9:** Shift Tercih Grid'i
- [ ] **AŞAMA 10:** Manager Shift İnceleme & Ayarlar

---

## 🤝 İşbirliği Kuralları

### Senin Görevin:
- Her aşamayı test et
- Feedback ver (beğendin mi, değişiklik var mı)
- Ekstra istekleri belirt (ama scope creep'e dikkat!)

### Benim Görevim:
- Clean, simple kod yaz
- Her adımda izin al
- Over-engineering yapma
- Senin isteklerini dinle ve adapte ol

---

## 📝 Notlar

- **Esnek Yapı:** Bu roadmap kesin değil, ihtiyaca göre değişebilir
- **KISS:** Basit çözümler, önce çalışan kod, sonra optimize et
- **Adım Adım:** Acele yok, her aşama sağlam olsun
- **Clean Code:** Okunabilir, bakımı kolay kod

---

# 🗂️ ADIM ÖZETLERİ

## AŞAMA 1: Proje Temelleri & Setup
NativeWind kurulumu, klasör yapısı, TypeScript types, temel UI componentleri (Button, Input, Card), theme sistemi

## AŞAMA 2: Kullanıcı Seçimi Ekranı
İlk ekran - Yönetici/Çalışan seçim sayfası, animated logo, navigation setup

## AŞAMA 3: Manager Kayıt & Giriş
Yönetici kayıt formu (şifre güç göstergesi), giriş ekranı, form validasyonları, mock auth

## AŞAMA 4: Manager Dashboard
İstatistik kartları, hızlı erişim butonları, header component

## AŞAMA 5: Çalışan Liste & Ekleme
Çalışan listesi (grid + arama), çalışan ekleme formu, otomatik şifre, employee card component

## AŞAMA 6: Çalışan Detayı
Çalışan detay sayfası, yönetici notları, düzenleme modal, performans stats, danger zone

## AŞAMA 7: Employee Giriş & Şifre Değiştirme
Çalışan login, ilk giriş algılama, şifre sıfırlama, şifre güç göstergesi

## AŞAMA 8: Employee Ana Sayfa & Profil
Çalışan dashboard, bu haftanın shift'leri, profil sayfası

## AŞAMA 9: Shift Tercih Grid'i
İnteraktif 7 gün x 3 shift grid, hücre tıklama logic, draft saving, hafta navigasyonu, renk kodları

## AŞAMA 10: Shift İnceleme & Ayarlar
Manager shift onay ekranı, shift grid (gün x çalışan), detay modal, yönetici ayarları, AI settings

---

**Hazır mısın? AŞAMA 1'den başlayalım mı? 🚀**
