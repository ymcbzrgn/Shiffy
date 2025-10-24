# 🗺️ Shiffy Frontend Development Roadmap

> **Proje Yaklaşımı:** KISS (Keep It Simple, Stupid) + Clean Code  
> **Geliştirme Modeli:** Adım adım onay bazlı ilerleyiş  
> **Teknoloji:** Expo SDK 54 + TypeScript + React Native

---

## 📋 Proje Özeti

HTML prototiplerinde oluşturulmuş 15 sayfalık vardiya yönetim sistemini React Native/Expo uygulamasına dönüştürme projesi.

**Mevcut Durum:**
- ✅ 15 adet HTML sayfası (Tailwind CSS ile stillendirilmiş)
- ✅ Expo SDK 54 boilerplate kurulu
- ✅ Dosya-tabanlı routing (Expo Router)
- ✅ Dark mode desteği HTML'de mevcut

**Hedef:**
- Responsive, native-feeling mobil uygulama
- Manager ve Employee rolleri için ayrı akışlar
- Offline-ready shift tercihleri
- Clean, maintainable kod

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
- **Styling:** NativeWind (Tailwind for React Native) - HTML'den kolay geçiş
- **Navigation:** Expo Router (zaten var)
- **State:** useState + useContext (şimdilik)
- **Storage:** AsyncStorage (SecureStore auth tokenları için)
- **Icons:** @expo/vector-icons (Material Icons)
- **Animations:** Reanimated (sadece gerekli yerlerde)

---

## 🚀 ADIMLAR (10 Aşama)

### **AŞAMA 1: Proje Temelleri & Setup** ⚙️
**Süre:** ~30-45 dakika  
**Hedef:** Geliştirme ortamını hazırla, temel kütüphaneleri kur

**Yapılacaklar:**
- [ ] NativeWind kurulumu ve konfigürasyonu
- [ ] Dosya yapısı oluşturma (boş klasörler/dosyalar)
- [ ] TypeScript types tanımları (User, Employee, Shift, vb.)
- [ ] Theme sistemi (colors, dark mode)
- [ ] Temel UI componentleri (Button, Input, Card)

**Test Kriterleri:**
- App açılıyor mu?
- Dark mode toggle çalışıyor mu?
- Sample button/card görüntüleniyor mu?

**Çıktılar:**
- `types/index.ts` (tüm type'lar)
- `constants/colors.ts`
- `components/ui/button.tsx, input.tsx, card.tsx`
- `hooks/use-theme.ts`

---

### **AŞAMA 2: Auth Flow - Kullanıcı Seçimi** 🔐
**Süre:** ~45 dakika  
**Hedef:** İlk ekran - Yönetici/Çalışan seçim sayfası

**Yapılacaklar:**
- [ ] `app/(auth)/user-select.tsx` oluştur
- [ ] Animated Shiffy logo component
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

### **AŞAMA 3: Manager Auth - Kayıt & Giriş** 👔
**Süre:** ~60 dakika  
**Hedef:** Yönetici kayıt ve giriş ekranları

**Yapılacaklar:**
- [ ] `app/(auth)/manager-register.tsx`
  - Form: storeName, email, password, confirmPassword
  - Şifre güç göstergesi (4 seviye)
  - Gerçek zamanlı validasyon
- [ ] `app/(auth)/manager-login.tsx`
  - Email/şifre girişi
  - "Beni hatırla" checkbox
  - Hata animasyonu (shake effect)
- [ ] Form validation utils (`utils/validation.ts`)
- [ ] Mock auth service (API hazır olana kadar)

**Test Kriterleri:**
- Form validasyonları çalışıyor mu?
- Şifre göster/gizle toggle var mı?
- Başarılı kayıt sonrası dashboard'a yönleniyor mu?

**Çıktılar:**
- Manager register & login screens
- `utils/validation.ts`
- `hooks/use-auth.ts` (mock)

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

### **AŞAMA 6: Çalışan Detayı & Yönetici Notları** 📝
**Süre:** ~60 dakika  
**Hedef:** Çalışan detay sayfası, notlar, düzenleme

**Yapılacaklar:**
- [ ] `app/(manager)/employees/[id].tsx`
  - Profile header (avatar, ad, rol)
  - Bilgi kartları (email, telefon, vb.)
  - Manager notes textarea (AI input için)
  - Performans stats (3 kart)
  - Shift history timeline
  - Edit modal
  - Danger zone (deactivate/delete)

**Test Kriterleri:**
- URL parametresi doğru çalışıyor mu?
- Notlar kaydediliyor mu?
- Edit modal açılıyor/kapanıyor mu?

**Çıktılar:**
- Employee detail screen
- Edit modal component

---

### **AŞAMA 7: Employee Auth - Giriş & Şifre Değiştirme** 🔑
**Süre:** ~45 dakika  
**Hedef:** Çalışan giriş ve ilk giriş şifre değiştirme

**Yapılacaklar:**
- [ ] `app/(auth)/employee-login.tsx`
  - Username/password form
  - İlk giriş algılama (mock)
  - Şifre değiştirmeye yönlendirme
- [ ] `app/(auth)/employee-password-reset.tsx`
  - Mevcut şifre (ilk değilse)
  - Yeni şifre + confirmation
  - Şifre güç göstergesi

**Test Kriterleri:**
- Login çalışıyor mu?
- İlk giriş senaryosu doğru mu?
- Şifre değiştirme sonrası employee home'a gidiyor mu?

**Çıktılar:**
- Employee login & password reset screens

---

### **AŞAMA 8: Employee Home & Profil** 🏠
**Süre:** ~30 dakika  
**Hedef:** Çalışan ana sayfa ve profil

**Yapılacaklar:**
- [ ] `app/(employee)/home.tsx`
  - Hoş geldiniz kartı
  - Bu haftanın shift'leri (özet)
  - Hızlı erişim butonları
- [ ] `app/(employee)/profile.tsx`
  - Temel bilgiler (readonly)
  - Şifre değiştir butonu
  - Dark mode toggle

**Test Kriterleri:**
- Home screen bilgileri görünüyor mu?
- Profile screen'e geçiş var mı?

**Çıktılar:**
- Employee home & profile screens

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

- [ ] **AŞAMA 1:** Proje Temelleri & Setup
- [ ] **AŞAMA 2:** Auth Flow - Kullanıcı Seçimi
- [ ] **AŞAMA 3:** Manager Auth - Kayıt & Giriş
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
