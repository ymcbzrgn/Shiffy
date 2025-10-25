# 🎯 Yönetici Manuel AI Tetikleme ve Otomatik Takvim Ayarları

## 📋 Özellikler

### 1. Manuel AI Tetikleme ✨
Yöneticiler artık **mevcut takvimi silip yeniden oluşturabilir** - onaylanmış takvimler için bile!

#### Kullanım
```typescript
import { generateSchedule } from '@/services/schedule';

// Normal oluşturma (mevcut takvim varsa hata verir)
const schedule = await generateSchedule('2025-10-28');

// ZORLA YENİDEN OLUŞTURMA (mevcut takvimi siler ve yeniden oluşturur)
const schedule = await generateSchedule('2025-10-28', true);
```

#### API Endpoint
```http
POST /api/schedules/generate
Authorization: Bearer <manager-token>
Content-Type: application/json

{
  "week_start": "2025-10-28",
  "force_regenerate": true  // Opsiyonel - true ise mevcut takvimi siler
}
```

### 2. Yönetici Ayarları (deadline_day) ⚙️

Her yönetici **kendi haftalık son gününü** belirleyebilir:
- **deadline_day**: 1-7 arası (1=Pazartesi, 7=Pazar)
- **Otomatik Takvim**: Belirlenen gün saat 23:00'da otomatik oluşturulur

#### Ayarları Görüntüleme
```typescript
import { getManagerSettings } from '@/services/manager-settings';

const settings = await getManagerSettings();
console.log('Son gün:', settings.deadline_day); // 5 = Cuma
```

#### Ayarları Güncelleme
```typescript
import { updateManagerSettings, getDeadlineDayName } from '@/services/manager-settings';

// Son günü Cuma yap
await updateManagerSettings({ 
  deadline_day: 5,
  store_name: 'Yeni Mağaza Adı' // Opsiyonel
});

// Gün ismini al
const dayName = getDeadlineDayName(5); // "Cuma"
```

#### API Endpoints

**Ayarları Getir:**
```http
GET /api/manager-settings
Authorization: Bearer <manager-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "manager@example.com",
    "store_name": "Starbucks Kadıköy",
    "deadline_day": 5,
    "created_at": "2025-10-25T10:00:00.000Z",
    "updated_at": "2025-10-25T10:00:00.000Z"
  }
}
```

**Ayarları Güncelle:**
```http
PATCH /api/manager-settings
Authorization: Bearer <manager-token>
Content-Type: application/json

{
  "store_name": "Yeni İsim",     // Opsiyonel
  "deadline_day": 7               // Opsiyonel (1-7)
}
```

### 3. Otomatik Takvim Sistemi 🤖

#### Nasıl Çalışır?

1. **Her gün saat 23:00'da** sistem çalışır
2. **Bugünün gününü** kontrol eder (1-7)
3. **deadline_day'i bugüne eşit olan** yöneticileri bulur
4. **Sadece o yöneticiler için** gelecek haftanın takvimini oluşturur

#### Örnek Senaryo

```
Yönetici A: deadline_day = 5 (Cuma)
Yönetici B: deadline_day = 7 (Pazar)
Yönetici C: deadline_day = 2 (Salı)

CUMA 23:00 → Sadece Yönetici A için takvim oluşturulur
PAZAR 23:00 → Sadece Yönetici B için takvim oluşturulur
SALI 23:00 → Sadece Yönetici C için takvim oluşturulur
```

#### Avantajları
- ✅ Her yönetici kendi tercihi olan günde takvim alır
- ✅ Sistem yükü dağıtılır (hepsi aynı anda değil)
- ✅ Esnek ve özelleştirilebilir

## 🎨 Frontend Örnek Kullanım

### Ayarlar Sayfası Komponenti

```typescript
import { useState, useEffect } from 'react';
import { 
  getManagerSettings, 
  updateManagerSettings,
  getDeadlineDayOptions,
  ManagerSettings 
} from '@/services/manager-settings';

function SettingsScreen() {
  const [settings, setSettings] = useState<ManagerSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getManagerSettings();
      setSettings(data);
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  };

  const handleDeadlineDayChange = async (newDay: number) => {
    try {
      setLoading(true);
      const updated = await updateManagerSettings({ deadline_day: newDay });
      setSettings(updated);
      alert('Ayarlar kaydedildi!');
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const dayOptions = getDeadlineDayOptions();

  return (
    <View>
      <Text>Otomatik Takvim Son Günü:</Text>
      <Picker
        selectedValue={settings?.deadline_day}
        onValueChange={handleDeadlineDayChange}
        enabled={!loading}
      >
        {dayOptions.map(option => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
      
      <Text style={{ marginTop: 10, color: '#666' }}>
        Her {dayOptions.find(d => d.value === settings?.deadline_day)?.label} saat 23:00'da 
        otomatik takvim oluşturulacak.
      </Text>
    </View>
  );
}
```

### Manuel AI Tetikleme Butonu

```typescript
import { generateSchedule } from '@/services/schedule';
import { Alert } from 'react-native';

function ScheduleScreen() {
  const [weekStart, setWeekStart] = useState('2025-10-28');
  const [hasExisting, setHasExisting] = useState(false);

  const handleRegenerateAI = async () => {
    if (hasExisting) {
      Alert.alert(
        'Mevcut Takvimi Sil',
        'Bu hafta için zaten takvim var. Silip yeniden oluşturmak istiyor musunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Evet, Yeniden Oluştur', 
            onPress: async () => {
              try {
                // Mevcut takvimi sil ve yeniden oluştur
                const schedule = await generateSchedule(weekStart, true);
                alert('Takvim yeniden oluşturuldu!');
              } catch (error) {
                alert('Hata: ' + error.message);
              }
            }
          }
        ]
      );
    } else {
      // Normal oluşturma
      try {
        const schedule = await generateSchedule(weekStart, false);
        alert('Takvim oluşturuldu!');
      } catch (error) {
        alert('Hata: ' + error.message);
      }
    }
  };

  return (
    <TouchableOpacity onPress={handleRegenerateAI}>
      <Text>🤖 AI ile {hasExisting ? 'Yeniden' : ''} Oluştur</Text>
    </TouchableOpacity>
  );
}
```

## 📊 Database Değişiklikleri

`managers` tablosunda zaten var:
```sql
deadline_day INTEGER NOT NULL DEFAULT 5 CHECK (deadline_day >= 1 AND deadline_day <= 7)
```

Default değer: **5 (Cuma)**

## 🔄 Backend Değişiklikleri

### Dosyalar
- ✅ `auto-schedule.service.ts` - Günlük kontrol, dinamik deadline_day
- ✅ `schedule.service.ts` - `forceRegenerate` parametresi
- ✅ `schedule.routes.ts` - `force_regenerate` desteği
- ✅ `manager-settings.routes.ts` - Yeni endpoint (GET/PATCH)
- ✅ `routes/index.ts` - Yeni route eklendi

### Frontend
- ✅ `services/schedule.ts` - `forceRegenerate` parametresi
- ✅ `services/manager-settings.ts` - Yeni servis (settings CRUD)

## 🎯 Kullanım Senaryoları

### Senaryo 1: Yönetici Ayarlarını Değiştiriyor
1. Yönetici ayarlar sayfasına gider
2. "Otomatik Takvim Günü" olarak **Cuma** seçer
3. Her Cuma 23:00'da otomatik takvim oluşturulur

### Senaryo 2: Onaylanmış Takvimi Yeniden Oluşturma
1. Yönetici bu hafta için takvim oluşturmuş ve onaylamış
2. Çalışan değişikliği oldu, tekrar oluşturmak istiyor
3. "AI ile Yeniden Oluştur" butonuna basar
4. Mevcut takvim silinir, yeni takvim oluşturulur

### Senaryo 3: Farklı Mağazalar Farklı Günler
```
Starbucks Kadıköy: Cuma 23:00 → Cumartesi için takvim
McDonald's: Pazar 23:00 → Pazartesi için takvim
Burger King: Çarşamba 23:00 → Perşembe için takvim
```

## 🚀 Test

```bash
# Backend
cd backend
npm run dev

# Manuel test
curl -X POST http://localhost:3000/api/schedules/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"week_start":"2025-10-28","force_regenerate":true}'

# Ayarları güncelle
curl -X PATCH http://localhost:3000/api/manager-settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deadline_day":5}'
```

---

**Son Güncelleme:** 25 Ekim 2025  
**Versiyon:** 2.0.0
